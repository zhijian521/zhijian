import { type ClassValue, clsx } from 'clsx';

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

/*== 生成监控接入代码片段。 ==*/
export function getEmbedScript(siteId: string): string {
    const base = getScriptUrl();
    return `<script async src="${base}/script.js" data-site-id="${siteId}"></script>`;
}