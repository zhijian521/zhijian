/**
 * @api 统计数据采集
 * @group collect
 * @auth none
 * @method POST 接收前端埋点数据（PV/UV/事件等）
 * @returns success | fail
 */

import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/lib/db';
import { fail, type BizCodeValue } from '@/lib/api-response';
import { lookup, maskIp } from '@/lib/geo';
import { parseUA } from '@/lib/ua';

/*============================================================================
  数据收集 API — 供 script.js 上报，无鉴权

  POST /api/collect
  Body: { siteId, visitorId, sessionId, events: [...] }
  响应: 202 (已接受) / 404 (站点未注册) / 400 (格式错误)
============================================================================*/

/*== 令牌桶限流：每 siteId 每秒最多 10 次请求 ==*/
const buckets = new Map<string, { tokens: number; lastRefill: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 1000;
let cleanupRegistered = false;

function checkRateLimit(siteId: string): boolean {
    // 惰性注册清理 interval，避免 Next.js 热重载时注册多个
    if (!cleanupRegistered) {
        cleanupRegistered = true;
        setInterval(() => {
            const cutoff = Date.now() - 60000;
            for (const [key, bucket] of buckets) {
                if (bucket.lastRefill < cutoff) buckets.delete(key);
            }
        }, 300000);
    }

    let bucket = buckets.get(siteId);
    const now = Date.now();

    if (!bucket) {
        bucket = { tokens: RATE_LIMIT - 1, lastRefill: now };
        buckets.set(siteId, bucket);
        return true;
    }

    const elapsed = now - bucket.lastRefill;
    if (elapsed >= WINDOW_MS) {
        bucket.tokens = Math.min(RATE_LIMIT, bucket.tokens + Math.floor(elapsed / WINDOW_MS) * RATE_LIMIT);
        bucket.lastRefill = now;
    }

    if (bucket.tokens <= 0) return false;
    bucket.tokens--;
    return true;
}

/*== 事件字段白名单 + 长度限制 ==*/
const VALID_TYPES = new Set(['pageview', 'heartbeat', 'leave']);
const MAX_PATH = 500;
const MAX_REFERRER = 500;
const MAX_TITLE = 500;
const MAX_SCREEN = 20;
const MAX_LANG = 10;
const MAX_VISITOR_ID = 64;
const MAX_SESSION_ID = 64;
const MAX_EVENTS_PER_REQUEST = 20;

interface RawEvent {
    type: string;
    url: string;
    referrer?: string;
    title?: string;
    duration?: number;
    screen?: string;
    lang?: string;
    ua?: string; // #12 新增
    isNew?: number;
    isSessionStart?: number;
    ts: number;
}

/*== POST：接收并写入事件 ==*/
export async function POST(request: NextRequest) {
    /*-- CORS：动态返回请求 origin，兼容 sendBeacon（默认带 cookie）和 fetch（omit） ==*/
    /* B4 修复：无 origin 时 fallback 为 *，但不设 Allow-Credentials（* + credentials 违反 CORS 规范） */
    const origin = request.headers.get('origin') || '';
    const corsHeaders: Record<string, string> = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (origin) {
        corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    /*-- 所有返回路径都必须带 CORS 头，否则浏览器拦截跨域响应 --*/
    function corsError(code: BizCodeValue, message: string, status: number) {
        return NextResponse.json(fail(code, message), { status, headers: corsHeaders });
    }

    try {
        /*-- 手动读取请求体再 JSON.parse，兼容 sendBeacon 的 text/plain 和 fetch 的 application/json --*/
        let body: any;
        try {
            const text = await request.text();
            body = JSON.parse(text);
        } catch {
            return corsError(40000, '请求体不是有效的 JSON', 400);
        }
        const { siteId, visitorId, sessionId, events } = body as {
            siteId?: string;
            visitorId?: string;
            sessionId?: string;
            events?: RawEvent[];
        };

        /*-- 基本校验 --*/
        if (!siteId || typeof siteId !== 'string' || siteId.length > 32) {
            return NextResponse.json(fail(40000, '无效的 siteId'), { status: 400, headers: corsHeaders });
        }

        if (!events || !Array.isArray(events) || events.length === 0) {
            return NextResponse.json(fail(40000, 'events 不能为空'), { status: 400, headers: corsHeaders });
        }

        if (events.length > MAX_EVENTS_PER_REQUEST) {
            return NextResponse.json(fail(40000, `单次最多 ${MAX_EVENTS_PER_REQUEST} 条事件`), { status: 400, headers: corsHeaders });
        }

        /*-- 限流 --*/
        if (!checkRateLimit(siteId)) {
            return new NextResponse(null, { status: 429, headers: corsHeaders });
        }

        /*-- 验证站点存在且启用 --*/
        const db = getDb();
        if (!db) {
            return NextResponse.json(fail(50000, '服务暂不可用'), { status: 500, headers: corsHeaders });
        }

        const [siteRows] = await db.execute('SELECT id FROM zhijian_track_sites WHERE id = ? AND status = ?', [siteId, 'active']);
        if ((siteRows as any[]).length === 0) {
            return NextResponse.json(fail(40400, '站点未注册或已停用'), { status: 404, headers: corsHeaders });
        }

        /*-- 提取 IP + 解析地理位置 --*/
        const forwarded = request.headers.get('x-forwarded-for');
        const rawIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || '';
        const maskedIp = rawIp ? maskIp(rawIp) : null;
        const geo = rawIp ? lookup(rawIp) : null;

        /*-- 批次内去重：相同 siteId + visitorId + sessionId + type + path + 60秒窗口视为重复 --*/
        const DEDUP_WINDOW_MS = 60_000;
        const seen = new Set<string>();
        const dedupedEvents = events.filter((evt) => {
            if (!evt.type || !VALID_TYPES.has(evt.type)) return false;
            if (!evt.url || typeof evt.url !== 'string') return false;
            const key = `${evt.type}:${(evt.url || '').slice(0, MAX_PATH)}:${visitorId}:${sessionId}:${Math.floor((evt.ts || 0) / DEDUP_WINDOW_MS)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        /*-- 构建批量 INSERT --*/
        const values: any[] = [];
        const placeholders: string[] = [];

        for (const evt of dedupedEvents) {
            /* #14 UA 解析 */
            const uaInfo = parseUA(evt.ua || '');

            placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            values.push(
                siteId,
                evt.type,
                (evt.url || '').slice(0, MAX_PATH),
                (evt.referrer || '').slice(0, MAX_REFERRER) || null,
                (evt.title || '').slice(0, MAX_TITLE) || null,
                evt.duration != null && evt.duration >= 0 ? Math.min(evt.duration, 86400) : null,
                (evt.screen || '').slice(0, MAX_SCREEN) || null,
                (evt.lang || '').slice(0, MAX_LANG) || null,
                evt.isNew ? 1 : 0,
                evt.isSessionStart ? 1 : 0,
                (visitorId || '').slice(0, MAX_VISITOR_ID) || null,
                (sessionId || '').slice(0, MAX_SESSION_ID) || null,
                maskedIp,
                geo?.country || null,
                geo?.region || null,
                geo?.city || null,
                (evt.ua || '').slice(0, 500) || null,
                uaInfo.browser || null,
                uaInfo.os || null
            );
        }

        if (placeholders.length === 0) {
            return new NextResponse(null, { status: 202, headers: corsHeaders });
        }

        /*-- 批量写入 --*/
        await db.execute(
            `INSERT INTO zhijian_track_events (site_id, type, path, referrer, title, duration, screen, lang, is_new, is_session, visitor_id, session_id, ip, country, region, city, ua, browser, os) VALUES ${placeholders.join(', ')}`,
            values
        );

        return new NextResponse(null, { status: 202, headers: corsHeaders });
    } catch (err) {
        console.error('[collect] 处理失败:', err);
        return corsError(50000, '服务器处理失败', 500);
    }
}

/*== OPTIONS：CORS 预检 ==*/
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin') || '';
    const headers: Record<string, string> = {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
    if (origin) {
        headers['Access-Control-Allow-Credentials'] = 'true';
    }
    return new NextResponse(null, { status: 204, headers });
}
