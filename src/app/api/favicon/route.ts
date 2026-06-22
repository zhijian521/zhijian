import { NextRequest, NextResponse } from 'next/server';

/*============================================================================
  Favicon 代理 API — 自建 favicon 获取服务

  GET /api/favicon?domain=github.com

  逻辑：
  1. 内存缓存，30 天过期
  2. 抓取首页 HTML，解析 <link rel="icon"> 等
  3. 未找到则 fallback /favicon.ico
  4. 代理返回图片二进制 + 浏览器缓存头
  5. 全部失败 302 → Google favicon API
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
    return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(domain);
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
        /*-- 第一步：抓首页 HTML 提取 favicon URL --*/
        let faviconUrl: string | null = null;
        try {
            const htmlRes = await fetch(origin, {
                signal: AbortSignal.timeout(5000),
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FaviconBot/1.0)' },
                redirect: 'follow',
            });
            if (htmlRes.ok) {
                const html = await htmlRes.text();
                faviconUrl = extractFaviconUrl(html, origin);
            }
        } catch { /* 首页抓取失败，忽略 */ }

        /*-- 第二步：fallback /favicon.ico --*/
        if (!faviconUrl) {
            faviconUrl = `${origin}/favicon.ico`;
        }

        /*-- 第三步：抓取 favicon 图片 --*/
        const imgRes = await fetch(faviconUrl, {
            signal: AbortSignal.timeout(5000),
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FaviconBot/1.0)' },
            redirect: 'follow',
        });

        if (!imgRes.ok) throw new Error(`favicon fetch ${imgRes.status}`);

        const contentType = imgRes.headers.get('content-type') || 'image/x-icon';
        /*-- 防止非图片响应（如 HTML 404 页面）被当图片返回 --*/
        if (!contentType.startsWith('image/')) throw new Error(`not an image: ${contentType}`);
        const buf = await imgRes.arrayBuffer();
        const data = new Uint8Array(buf);

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
        return NextResponse.redirect(
            `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
            302,
        );
    }
}
