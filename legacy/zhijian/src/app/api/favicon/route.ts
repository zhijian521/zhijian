/**
 * @api Favicon 代理
 * @group util
 * @auth none
 * @method GET 自建 favicon 获取服务，代理抓取站点图标（SSRF 防护）
 * @returns 图片二进制 | 302 重定向
 */

import { NextRequest, NextResponse } from 'next/server';

import { fetchWithSsrfGuard } from '@/lib/core/ssrf-guard';

/*============================================================================
  Favicon 代理 API — 自建 favicon 获取服务

  GET /api/favicon?domain=github.com

  逻辑：
  1. 内存缓存，30 天过期
  2. isValidDomain 形状粗筛（第一道防线）
  3. fetchWithSsrfGuard 抓取首页 HTML（仅 https + DNS 校验公网地址 + 逐跳
     校验重定向），流式读取超 512KB 截断，解析 <link rel="icon"> 等
  4. 未找到则 fallback /favicon.ico
  5. fetchWithSsrfGuard 抓取 favicon 图片，校验 image/* content-type，流式读取限 2MB
  6. 代理返回图片二进制 + 浏览器缓存头
  7. 全部失败 302 → Google favicon API
============================================================================*/

/*-- 内存缓存 --*/
interface CacheEntry {
    data: Uint8Array;
    contentType: string;
    expires: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 天
const MAX_CACHE = 500;
const MAX_HTML_BYTES = 512 * 1024; // 首页 HTML 读取上限 512KB
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // favicon 图片读取上限 2MB

/*-- 流式读取响应体为文本，超过 512KB 即截断（无鉴权端点防止大 body 耗尽内存） --*/
async function readHtmlWithLimit(res: Response): Promise<string> {
    if (!res.body) return '';
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > MAX_HTML_BYTES) {
                /* 截断安全：<link rel="icon"> 位于 head 前部，截尾不影响提取 */
                await reader.cancel();
                break;
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    const size = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const merged = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return new TextDecoder().decode(merged);
}

/*-- 流式读取响应体为字节数组，超过 2MB 即抛错（截断图片必然损坏，超限走 302 兜底） --*/
async function readImageWithLimit(res: Response): Promise<Uint8Array> {
    if (!res.body) return new Uint8Array(0);
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > MAX_IMAGE_BYTES) {
                await reader.cancel();
                throw new Error(`favicon image exceeds ${MAX_IMAGE_BYTES} bytes`);
            }
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    /* 未超限时 total 即分块总长，直接按 total 合并 */
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return merged;
}

/*-- 从 HTML 中提取 favicon URL --*/
function extractFaviconUrl(html: string, origin: string): string | null {
    /*-- 匹配 <link ... rel="icon|shortcut icon|apple-touch-icon" ... href="..." ...>，属性顺序不固定 --*/
    const linkRe = /<link\s[^>]*rel\s*=\s*["'](?:shortcut\s+icon|icon|apple-touch-icon)["'][^>]*>/gi;
    const hrefRe = /href\s*=\s*["']([^"']+)["']/i;
    let bestMatch: string | null = null;
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(html)) !== null) {
        const hrefMatch = match[0].match(hrefRe);
        if (hrefMatch) {
            /*-- 优先选含 sizes="...x..." 且尺寸较大的 --*/
            const sizesMatch = match[0].match(/sizes\s*=\s*["'](\d+)x\d+["']/i);
            if (!bestMatch || (sizesMatch && parseInt(sizesMatch[1]) >= 32)) {
                bestMatch = hrefMatch[1];
            }
        }
    }
    if (!bestMatch) return null;
    let href = bestMatch;
    /*-- 解析相对路径 --*/
    if (href.startsWith('//')) href = `https:${href}`;
    else if (href.startsWith('/')) href = `${origin}${href}`;
    else if (!href.startsWith('http')) href = `${origin}/${href}`;
    return href;
}

/*-- 域名校验：只允许合法域名 --*/
function isValidDomain(domain: string): boolean {
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
        domain
    );
}

export async function GET(request: NextRequest) {
    const domain = request.nextUrl.searchParams.get('domain');
    if (!domain || !isValidDomain(domain)) {
        return NextResponse.json({ error: 'invalid domain' }, { status: 400 });
    }

    /*-- 缓存命中 --*/
    const cached = cache.get(domain);
    if (cached && cached.expires > Date.now()) {
        return new NextResponse(cached.data, {
            headers: {
                'Content-Type': cached.contentType,
                'Cache-Control': 'public, max-age=2592000, immutable',
            },
        });
    }

    const origin = `https://${domain}`;

    try {
        /*-- 第一步：抓首页 HTML 提取 favicon URL（SSRF 防护在 fetchWithSsrfGuard 内统一完成） --*/
        let faviconUrl: string | null = null;
        try {
            const htmlRes = await fetchWithSsrfGuard(origin);
            if (htmlRes.ok) {
                const html = await readHtmlWithLimit(htmlRes);
                faviconUrl = extractFaviconUrl(html, origin);
            }
        } catch {
            /* 首页抓取失败（含 SSRF 拦截），忽略走 fallback */
        }

        /*-- 第二步：fallback /favicon.ico --*/
        if (!faviconUrl) {
            faviconUrl = `${origin}/favicon.ico`;
        }

        /*-- 第三步：抓取 favicon 图片 --*/
        const imgRes = await fetchWithSsrfGuard(faviconUrl);

        if (!imgRes.ok) throw new Error(`favicon fetch ${imgRes.status}`);

        const contentType = imgRes.headers.get('content-type') || 'image/x-icon';
        /*-- 防止非图片响应（如 HTML 404 页面）被当图片返回 --*/
        if (!contentType.startsWith('image/')) throw new Error(`not an image: ${contentType}`);
        /*-- 流式读取限 2MB，超限抛错由外层 catch 统一走 302 兜底；写入缓存的数据同源，天然受限 --*/
        const data = await readImageWithLimit(imgRes);

        /*-- 写入缓存 --*/
        if (cache.size >= MAX_CACHE) {
            /* ponytail: FIFO 淘汰第一个，简单有效 */
            const first = cache.keys().next().value;
            if (first) cache.delete(first);
        }
        cache.set(domain, { data, contentType, expires: Date.now() + CACHE_TTL });

        return new NextResponse(data, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=2592000, immutable',
            },
        });
    } catch {
        /*-- 兜底：302 到 Google favicon API --*/
        return NextResponse.redirect(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`, 302);
    }
}
