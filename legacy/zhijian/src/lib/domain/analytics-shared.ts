/*============================================================================
  站点监控分析 — 共享类型与 UTC 换算工具

  职责：
  - 查询结果类型（概览/趋势/排行/分布/访问记录）
  - 本地日期 ↔ UTC 范围换算（events.created_at 由 MySQL CURRENT_TIMESTAMP 写入，存 UTC）
============================================================================*/

/*== 概览卡片数据 ==*/
export interface OverviewData {
    pv: number;
    uv: number;
    bounceRate: number; // 百分比，如 32.5
    avgDuration: number; // 秒
    newVisitorRate: number; // #4 新增：新访客占比百分比
    pvChange: number; // 与昨日对比百分比
    uvChange: number;
}

/*== 趋势数据点 ==*/
export interface TrendPoint {
    date: string; // YYYY-MM-DD
    pv: number;
    uv: number;
}

/*== 页面排行项 ==*/
export interface PageRankItem {
    path: string;
    pv: number;
    uv: number;
    bounceRate: number; // 百分比，如 32.5（#1 新增）
    avgDuration: number; // 秒（#1 新增）
}

/*== 来源排行项 ==*/
export interface SourceItem {
    source: string;
    count: number;
    percent: number; // 百分比
}

/*== 设备分布 ==*/
export interface DeviceItem {
    device: string;
    count: number;
    percent: number;
}

/*== 语言分布 ==*/
export interface LanguageItem {
    language: string;
    count: number;
    percent: number;
}

/*== 浏览器分布 ==*/
export interface BrowserItem {
    browser: string;
    count: number;
    percent: number;
}

/*== 操作系统分布 ==*/
export interface OSItem {
    os: string;
    count: number;
    percent: number;
}

/*== 地理分布项 ==*/
export interface GeoItem {
    name: string;
    count: number;
    percent: number;
}

/*== 入口/出口页面排行（仍从 events 表查，daily 表不存入口/出口维度） ==*/
export interface EntryExitItem {
    path: string;
    count: number;
    percent: number;
}

/*== 访问记录 ==*/
export interface VisitRecord {
    id: number;
    path: string;
    title: string;
    referrer: string;
    device: string;
    browser: string;
    os: string;
    lang: string;
    visitorId: string;
    sessionId: string;
    isNew: boolean;
    isSession: boolean;
    ip: string;
    location: string;
    duration: number | null;
    createdAt: string;
}

/*== 日期范围工具 ==*/
export type DateRange = '7d' | '30d' | '90d';

export function getDaysAgo(range: DateRange): number {
    switch (range) {
        case '7d':
            return 7;
        case '30d':
            return 30;
        case '90d':
            return 90;
    }
}

export function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/*== 将本地日期转换为 UTC 范围字符串，用于匹配 events 表的 created_at（UTC） ==*/
export function localDateToUtcRange(date: string): { start: string; end: string } {
    /* events 表的 created_at 由 MySQL CURRENT_TIMESTAMP 写入，存储的是 UTC 时间。
       本地日期 "2026-06-14"（UTC+8）对应的 UTC 范围是：
       2026-06-13T16:00:00 ~ 2026-06-14T16:00:00
       用 new Date(localMidnight + timezoneOffset) 让 JS 自动转 UTC */
    const offset = -(new Date().getTimezoneOffset() / 60); // 正数=东时区，如 +8
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset);
    const mins = (absOffset - hours) * 60;
    const tzStr = sign + String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');

    const startDt = new Date(date + 'T00:00:00' + tzStr);
    const endDt = new Date(date + 'T23:59:59' + tzStr);
    endDt.setSeconds(endDt.getSeconds() + 1); // 溢出到次日 00:00:00

    const start = startDt.toISOString().slice(0, 19).replace('T', ' ');
    const end = endDt.toISOString().slice(0, 19).replace('T', ' ');
    return { start, end };
}

/*== 将本地日期范围转换为 UTC 范围，用于匹配 events 表的 created_at（UTC） ==*/
export function rangeToUtcRange(range: DateRange): { start: string; end: string } {
    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));
    const todayEnd = formatDate(new Date());
    return {
        start: localDateToUtcRange(startDate).start,
        end: localDateToUtcRange(todayEnd).end,
    };
}
