import { type ClassValue, clsx } from 'clsx';

import { SITE_METADATA } from '@/lib/core/site';

/*== 合并 CSS 类名，通过 clsx 解析条件类。用于组件中动态组合 className。 ==*/
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/*== 判断导航项是否处于激活状态，前台和后台导航共用。 ==*/
export function isNavItemActive(pathname: string, href: string, match: 'exact' | 'prefix'): boolean {
    return match === 'exact' ? pathname === href : pathname.startsWith(href);
}

/*== 获取站点基础 URL（服务端/客户端通用）。 ==*/
export function getSiteUrl(): string {
    if (typeof window !== 'undefined') {
        // 客户端：优先环境变量，回退到当前 origin
        return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

/*== 获取监控脚本分发 URL。用于生成接入代码。 ==*/
export function getScriptUrl(): string {
    // NEXT_PUBLIC_SCRIPT_URL 优先，未配置时回退到 SITE_URL
    return process.env.NEXT_PUBLIC_SCRIPT_URL || getSiteUrl();
}

/*== 将站内相对地址或完整外链统一转换为绝对 URL。 ==*/
export function toAbsoluteUrl(value: string | null | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    try {
        return new URL(value, getSiteUrl()).toString();
    } catch {
        return undefined;
    }
}

/*== 生成监控接入代码片段。 ==*/
export function getEmbedScript(siteId: string): string {
    const base = getScriptUrl();
    return `<script async src="${base}/script.js" data-site-id="${siteId}"></script>`;
}

/*== 构建博客列表 URL（带筛选参数）。 ==*/
export function buildBlogUrl(filters: {
    categorySlug?: string;
    page?: number;
    siteUrl?: boolean;
    tagSlugs?: string[];
}): string {
    const params = new URLSearchParams();
    if (filters.categorySlug) params.set('category', filters.categorySlug);
    if (filters.tagSlugs && filters.tagSlugs.length > 0) params.set('tags', filters.tagSlugs.join(','));
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));
    const query = params.toString();
    const path = query ? '/blog?' + query : '/blog';
    return filters.siteUrl ? SITE_METADATA.siteUrl + path : path;
}

/*== 判断分类是否激活 ==*/
export function isCategoryActive(activeCategorySlug: string | undefined, slug: string): boolean {
    if (!activeCategorySlug) return !slug;
    return activeCategorySlug === slug;
}

/*== 序列化 JSON-LD 为可安全内嵌 <script> 的字符串。转义 < 防止内容中的 </script> 提前闭合标签（XSS）。 ==*/
export function serializeJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}
