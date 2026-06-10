/*============================================================================
  UA 解析 — 从 User-Agent 字符串提取浏览器名 + 操作系统名

  职责：
  - 解析浏览器名称和版本（Chrome, Firefox, Safari, Edge, Opera 等）
  - 解析操作系统名称（Windows, macOS, Linux, Android, iOS 等）
  - 轻量级手写正则，不引入外部库
============================================================================*/

export interface UAInfo {
    browser: string;  // 如 'Chrome', 'Safari', 'Firefox'
    os: string;       // 如 'Windows', 'macOS', 'Android', 'iOS'
}

/*== 从 UA 字符串提取浏览器 + OS ==*/
export function parseUA(ua: string): UAInfo {
    if (!ua) return { browser: '未知', os: '未知' };

    const browser = detectBrowser(ua);
    const os = detectOS(ua);

    return { browser, os };
}

function detectBrowser(ua: string): string {
    /* 顺序很重要：先匹配特定再匹配通用 */
    /* Edge（Chromium 版） */
    if (/Edg\//.test(ua)) return 'Edge';
    /* Opera / OPR */
    if (/OPR\/|Opera/.test(ua)) return 'Opera';
    /* Vivaldi */
    if (/Vivaldi/.test(ua)) return 'Vivaldi';
    /* Samsung Internet */
    if (/SamsungBrowser/.test(ua)) return 'Samsung';
    /* UC 浏览器 */
    if (/UCBrowser/.test(ua)) return 'UC';
    /* QQ 浏览器 */
    if (/QQBrowser/.test(ua)) return 'QQ';
    /* 微信内置浏览器 */
    if (/MicroMessenger/.test(ua)) return '微信';
    /* Firefox */
    if (/Firefox\//.test(ua)) return 'Firefox';
    /* Chrome（必须在 Safari 之前，因为 Chrome 的 UA 也包含 Safari） */
    if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome';
    /* Chromium */
    if (/Chromium/.test(ua)) return 'Chromium';
    /* Safari（只在没有 Chrome 标识时才判断为 Safari） */
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
    /* IE */
    if (/MSIE|Trident\//.test(ua)) return 'IE';

    return '其他';
}

function detectOS(ua: string): string {
    if (/Windows NT/.test(ua)) return 'Windows';
    if (/Mac OS X/.test(ua)) {
        if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
        return 'macOS';
    }
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Linux/.test(ua)) return 'Linux';
    if (/CrOS/.test(ua)) return 'ChromeOS';

    return '其他';
}