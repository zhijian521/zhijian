import type { RowDataPacket } from 'mysql2';
import { getDb } from '@/lib/db';

/*============================================================================
  站点监控分析数据层

  职责：
  - 日聚合：从 events 表聚合到 daily 表
  - 查询：仪表盘读取 daily 表
============================================================================*/

/*== 概览卡片数据 ==*/
export interface OverviewData {
    pv: number;
    uv: number;
    bounceRate: number;   // 百分比，如 32.5
    avgDuration: number;  // 秒
    pvChange: number;     // 与昨日对比百分比
    uvChange: number;
}

/*== 趋势数据点 ==*/
export interface TrendPoint {
    date: string;  // YYYY-MM-DD
    pv: number;
    uv: number;
}

/*== 页面排行项 ==*/
export interface PageRankItem {
    path: string;
    pv: number;
    uv: number;
}

/*== 来源排行项 ==*/
export interface SourceItem {
    source: string;
    count: number;
    percent: number;  // 百分比
}

/*== 设备分布项 ==*/
export interface DeviceItem {
    device: string;
    count: number;
    percent: number;
}

/*== 日期范围工具 ==*/
export type DateRange = '7d' | '30d' | '90d';

function getDaysAgo(range: DateRange): number {
    switch (range) {
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
    }
}

function formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

/*== 日聚合：将指定日期的 events 聚合到 daily 表 ==*/
export async function aggregateDaily(siteId: string, date: string): Promise<void> {
    const db = getDb();
    if (!db) return;

    /*-- 整站汇总（只计 pageview 类型） --*/
    const [summaryRows] = await db.execute<RowDataPacket[]>(`
        SELECT
            COUNT(*) AS pv,
            COUNT(DISTINCT visitor_id) AS uv,
            SUM(CASE WHEN is_session = 1 AND COALESCE(duration, 0) < 10 THEN 1 ELSE 0 END) AS bounce,
            ROUND(AVG(CASE WHEN duration > 0 THEN duration END)) AS avg_duration
        FROM zhijian_track_events
        WHERE site_id = ? AND DATE(created_at) = ? AND type = 'pageview'
    `, [siteId, date]);

    const summary = summaryRows[0];
    if (summary && (summary as any).pv > 0) {
        await db.execute(`
            INSERT INTO zhijian_track_daily (site_id, date, path, pv, uv, bounce, avg_duration)
            VALUES (?, ?, '', ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE pv=VALUES(pv), uv=VALUES(uv), bounce=VALUES(bounce), avg_duration=VALUES(avg_duration)
        `, [siteId, date, summary.pv, summary.uv, summary.bounce, summary.avg_duration || 0]);
    }

    /*-- 按页面路径聚合（只计 pageview 类型） --*/
    const [pageRows] = await db.execute<RowDataPacket[]>(`
        SELECT
            path,
            COUNT(*) AS pv,
            COUNT(DISTINCT visitor_id) AS uv,
            SUM(CASE WHEN is_session = 1 AND COALESCE(duration, 0) < 10 THEN 1 ELSE 0 END) AS bounce,
            ROUND(AVG(CASE WHEN duration > 0 THEN duration END)) AS avg_duration
        FROM zhijian_track_events
        WHERE site_id = ? AND DATE(created_at) = ? AND type = 'pageview'
        GROUP BY path
    `, [siteId, date]);

    for (const row of pageRows) {
        await db.execute(`
            INSERT INTO zhijian_track_daily (site_id, date, path, pv, uv, bounce, avg_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE pv=VALUES(pv), uv=VALUES(uv), bounce=VALUES(bounce), avg_duration=VALUES(avg_duration)
        `, [siteId, date, row.path, row.pv, row.uv, row.bounce, row.avg_duration || 0]);
    }
}

/*== 懒聚合：检查最后聚合时间，补算缺失日期 ==*/
export async function ensureAggregated(siteId: string, range: DateRange): Promise<void> {
    const db = getDb();
    if (!db) return;

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    /* 查询 daily 表中已有数据的日期 */
    const [existingRows] = await db.execute<RowDataPacket[]>(`
        SELECT DISTINCT date FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND path = ''
        ORDER BY date
    `, [siteId, startDate]);

    const existingDates = new Set((existingRows as any[]).map(r => formatDate(new Date(r.date))));

    /* 补算缺失日期 */
    const today = formatDate(new Date());
    for (let i = 0; i <= days; i++) {
        const d = formatDate(new Date(Date.now() - i * 86400000));
        if (d > today) continue;
        if (!existingDates.has(d)) {
            await aggregateDaily(siteId, d);
        }
    }
}

/*== 概览卡片 ==*/
export async function getOverview(siteId: string, range: DateRange, skipAggregate = false): Promise<OverviewData> {
    const db = getDb();
    if (!db) return { pv: 0, uv: 0, bounceRate: 0, avgDuration: 0, pvChange: 0, uvChange: 0 };

    if (!skipAggregate) await ensureAggregated(siteId, range);

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));
    const yesterdayStart = formatDate(new Date(Date.now() - (days + 1) * 86400000));
    const yesterdayEnd = formatDate(new Date(Date.now() - 86400000));

    /* 当期汇总 */
    const [curRows] = await db.execute<RowDataPacket[]>(`
        SELECT SUM(pv) AS pv, SUM(uv) AS uv, SUM(bounce) AS bounce, ROUND(AVG(avg_duration)) AS avg_duration
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND path = ''
    `, [siteId, startDate]);
    const cur = curRows[0] as any;

    /* 上期汇总（用于对比） */
    const [prevRows] = await db.execute<RowDataPacket[]>(`
        SELECT SUM(pv) AS pv, SUM(uv) AS uv
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND date <= ? AND path = ''
    `, [siteId, yesterdayStart, yesterdayEnd]);
    const prev = prevRows[0] as any;

    const pv = cur?.pv || 0;
    const uv = cur?.uv || 0;
    const bounce = cur?.bounce || 0;
    const avgDuration = cur?.avg_duration || 0;
    const bounceRate = pv > 0 ? Math.round((bounce / pv) * 1000) / 10 : 0;

    const prevPv = prev?.pv || 0;
    const prevUv = prev?.uv || 0;
    const pvChange = prevPv > 0 ? Math.round(((pv - prevPv) / prevPv) * 1000) / 10 : 0;
    const uvChange = prevUv > 0 ? Math.round(((uv - prevUv) / prevUv) * 1000) / 10 : 0;

    return { pv, uv, bounceRate, avgDuration, pvChange, uvChange };
}

/*== PV/UV 趋势 ==*/
export async function getTrend(siteId: string, range: DateRange, skipAggregate = false): Promise<TrendPoint[]> {
    const db = getDb();
    if (!db) return [];

    if (!skipAggregate) await ensureAggregated(siteId, range);

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT date, pv, uv FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND path = ''
        ORDER BY date
    `, [siteId, startDate]);

    return (rows as any[]).map(r => ({
        date: formatDate(new Date(r.date)),
        pv: r.pv || 0,
        uv: r.uv || 0,
    }));
}

/*== 页面排行 TOP N ==*/
export async function getPageRank(siteId: string, range: DateRange, limit = 10, skipAggregate = false): Promise<PageRankItem[]> {
    const db = getDb();
    if (!db) return [];

    if (!skipAggregate) await ensureAggregated(siteId, range);

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT path, SUM(pv) AS pv, SUM(uv) AS uv
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND path != ''
        GROUP BY path
        ORDER BY pv DESC
        LIMIT ?
    `, [siteId, startDate, limit]);

    return (rows as any[]).map(r => ({
        path: r.path,
        pv: r.pv || 0,
        uv: r.uv || 0,
    }));
}

/*== 来源排行 TOP N（从 events 表实时查，daily 表不存来源） ==*/
export async function getSources(siteId: string, range: DateRange, limit = 8): Promise<SourceItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            CASE
                WHEN referrer IS NULL OR referrer = '' THEN '直接访问'
                ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(referrer, '://', -1), '/', 1)
            END AS source,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND DATE(created_at) >= ?
        GROUP BY source
        ORDER BY count DESC
        LIMIT ?
    `, [siteId, startDate, limit]);

    const total = (rows as any[]).reduce((sum, r) => sum + (r.count || 0), 0);

    return (rows as any[]).map(r => ({
        source: r.source,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 设备分布（从 events 表实时查） ==*/
export async function getDevices(siteId: string, range: DateRange): Promise<DeviceItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            CASE
                WHEN screen LIKE '%x%' AND CAST(SUBSTRING_INDEX(screen, 'x', 1) AS UNSIGNED) <= 768 THEN 'Mobile'
                WHEN screen LIKE '%x%' AND CAST(SUBSTRING_INDEX(screen, 'x', 1) AS UNSIGNED) <= 1024 THEN 'Tablet'
                ELSE 'Desktop'
            END AS device,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND DATE(created_at) >= ?
        GROUP BY device
        ORDER BY count DESC
    `, [siteId, startDate]);

    const total = (rows as any[]).reduce((sum, r) => sum + (r.count || 0), 0);

    return (rows as any[]).map(r => ({
        device: r.device,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}
