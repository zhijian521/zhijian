/**
 * @api 统计数据采集
 * @group collect
 * @auth none
 * @method POST 接收前端埋点数据（PV/UV/事件等）
 * @method OPTIONS 响应 CORS 预检
 * @returns POST 202 空响应 | OPTIONS 204 空响应 | fail
 */

import { NextRequest, NextResponse } from 'next/server';

import { fail, type BizCodeValue } from '@/lib/core/api-response';
import { checkRateLimit } from '@/lib/core/rate-limit';
import { getClientIp } from '@/lib/core/request-ip';
import { lookup, maskIp } from '@/lib/domain/geo';
import { insertTrackEvents, isTrackSiteActive, type TrackEventRow } from '@/lib/domain/track-events';
import { parseUA } from '@/lib/domain/ua';

/*============================================================================
  数据收集 API — 供 script.js 上报，无鉴权

  POST /api/collect
  Body: { siteId, visitorId, sessionId, events: [...] }
  响应: 202 (已接受) / 404 (站点未注册) / 400 (格式错误)
============================================================================*/

/*== 限流：复用 core/rate-limit 令牌桶，每 siteId 每秒最多 10 次请求 ==*/

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
            return NextResponse.json(fail(40000, `单次最多 ${MAX_EVENTS_PER_REQUEST} 条事件`), {
                status: 400,
                headers: corsHeaders,
            });
        }

        /*-- 限流：10 次/秒/siteId，超限返回 429 空响应 --*/
        if (!checkRateLimit(siteId, 10, 1000)) {
            return new NextResponse(null, { status: 429, headers: corsHeaders });
        }

        /*-- 验证站点存在且启用（null = 数据库不可用，与站点不存在区分） --*/
        const siteActive = await isTrackSiteActive(siteId);
        if (siteActive === null) {
            return NextResponse.json(fail(50000, '服务暂不可用'), { status: 500, headers: corsHeaders });
        }
        if (!siteActive) {
            return NextResponse.json(fail(40400, '站点未注册或已停用'), { status: 404, headers: corsHeaders });
        }

        /*-- 提取 IP + 解析地理位置。统一走 getClientIp（x-real-ip 优先，否则 XFF 链尾，防伪造首值） --*/
        const clientIp = getClientIp(request);
        const rawIp = clientIp === 'unknown' ? '' : clientIp;
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

        /*-- 构建批量写入行（字段截断 + 白名单 + UA/Geo 编排在此完成） --*/
        const rows: TrackEventRow[] = [];

        for (const evt of dedupedEvents) {
            /* #14 UA 解析 */
            const uaInfo = parseUA(evt.ua || '');

            rows.push({
                site_id: siteId,
                type: evt.type,
                path: (evt.url || '').slice(0, MAX_PATH),
                referrer: (evt.referrer || '').slice(0, MAX_REFERRER) || null,
                title: (evt.title || '').slice(0, MAX_TITLE) || null,
                duration: evt.duration != null && evt.duration >= 0 ? Math.min(evt.duration, 86400) : null,
                screen: (evt.screen || '').slice(0, MAX_SCREEN) || null,
                lang: (evt.lang || '').slice(0, MAX_LANG) || null,
                is_new: evt.isNew ? 1 : 0,
                is_session: evt.isSessionStart ? 1 : 0,
                visitor_id: (visitorId || '').slice(0, MAX_VISITOR_ID) || null,
                session_id: (sessionId || '').slice(0, MAX_SESSION_ID) || null,
                ip: maskedIp,
                country: geo?.country || null,
                region: geo?.region || null,
                city: geo?.city || null,
                ua: (evt.ua || '').slice(0, 500) || null,
                browser: uaInfo.browser || null,
                os: uaInfo.os || null,
            });
        }

        if (rows.length === 0) {
            return new NextResponse(null, { status: 202, headers: corsHeaders });
        }

        /*-- 批量写入（SQL 收口 domain 层，热路径仅站点校验 + 一次 INSERT 两条查询） --*/
        await insertTrackEvents(rows);

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
