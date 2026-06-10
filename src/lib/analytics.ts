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
    newVisitorRate: number; // #4 新增：新访客占比百分比
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
    bounceRate: number;   // 百分比，如 32.5（#1 新增）
    avgDuration: number;  // 秒（#1 新增）
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

    /*-- 整站汇总 --*/
    /* B1 修复：跳出率改为 session 维度——
       一个 session 只有 1 个 pageview 且该 session 无 leave 或 leave.duration < 10，才算跳出 */
    /* B2 修复：平均停留从 leave 事件计算，不再从 pageview 读 duration */

    /* 第一步：统计 PV/UV */
    const [pvRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv
        FROM zhijian_track_events
        WHERE site_id = ? AND DATE(created_at) = ? AND type = 'pageview'
    `, [siteId, date]);
    const pv = (pvRows[0] as any)?.pv || 0;
    const uv = (pvRows[0] as any)?.uv || 0;

    /* 第二步：跳出数——只有 1 个 pageview 的 session 且无 leave 或 leave.duration < 10 */
    const [bounceRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS bounce FROM (
            SELECT session_id
            FROM zhijian_track_events
            WHERE site_id = ? AND DATE(created_at) = ? AND type = 'pageview' AND session_id IS NOT NULL
            GROUP BY session_id
            HAVING COUNT(*) = 1
        ) single
        WHERE single.session_id NOT IN (
            SELECT session_id FROM zhijian_track_events
            WHERE site_id = ? AND DATE(created_at) = ?
              AND type = 'leave' AND duration >= 10 AND session_id IS NOT NULL
        )
    `, [siteId, date, siteId, date]);
    const bounce = (bounceRows[0] as any)?.bounce || 0;

    /* 第三步：平均停留——从 leave 事件取 duration */
    const [durRows] = await db.execute<RowDataPacket[]>(`
        SELECT ROUND(AVG(duration)) AS avg_duration
        FROM zhijian_track_events
        WHERE site_id = ? AND DATE(created_at) = ? AND type = 'leave' AND duration > 0
    `, [siteId, date]);
    const avgDuration = (durRows[0] as any)?.avg_duration || 0;

    if (pv > 0) {
        await db.execute(`
            INSERT INTO zhijian_track_daily (site_id, date, path, pv, uv, bounce, avg_duration)
            VALUES (?, ?, '', ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE pv=VALUES(pv), uv=VALUES(uv), bounce=VALUES(bounce), avg_duration=VALUES(avg_duration)
        `, [siteId, date, pv, uv, bounce, avgDuration]);
    }

    /*-- 按页面路径聚合 --*/
    const [pageRows] = await db.execute<RowDataPacket[]>(`
        SELECT
            path,
            COUNT(*) AS pv,
            COUNT(DISTINCT visitor_id) AS uv
        FROM zhijian_track_events
        WHERE site_id = ? AND DATE(created_at) = ? AND type = 'pageview'
        GROUP BY path
    `, [siteId, date]);

    /* 按路径统计 leave 事件的平均停留 */
    const [pageDurRows] = await db.execute<RowDataPacket[]>(`
        SELECT
            p.path,
            ROUND(AVG(l.duration)) AS avg_duration
        FROM zhijian_track_events l
        JOIN zhijian_track_events p
            ON l.site_id = p.site_id AND l.session_id = p.session_id
        WHERE l.site_id = ? AND DATE(l.created_at) = ? AND l.type = 'leave' AND l.duration > 0
          AND p.type = 'pageview'
        GROUP BY p.path
    `, [siteId, date]);

    const pageDurMap = new Map<string, number>();
    for (const r of pageDurRows as any[]) {
        pageDurMap.set(r.path, r.avg_duration || 0);
    }

    for (const row of pageRows as any[]) {
        const pathAvgDur = pageDurMap.get(row.path) || 0;
        await db.execute(`
            INSERT INTO zhijian_track_daily (site_id, date, path, pv, uv, bounce, avg_duration)
            VALUES (?, ?, ?, ?, ?, 0, ?)
            ON DUPLICATE KEY UPDATE pv=VALUES(pv), uv=VALUES(uv), avg_duration=VALUES(avg_duration)
        `, [siteId, date, row.path, row.pv, row.uv, pathAvgDur]);
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
    if (!db) return { pv: 0, uv: 0, bounceRate: 0, avgDuration: 0, newVisitorRate: 0, pvChange: 0, uvChange: 0 };

    if (!skipAggregate) await ensureAggregated(siteId, range);

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));
    const yesterdayStart = formatDate(new Date(Date.now() - (days + 1) * 86400000));
    const yesterdayEnd = formatDate(new Date(Date.now() - 86400000));

    /* 当期汇总 — B3 修复：avg_duration 改为按 PV 加权平均 */
    const [curRows] = await db.execute<RowDataPacket[]>(`
        SELECT SUM(pv) AS pv, SUM(uv) AS uv, SUM(bounce) AS bounce,
               CASE WHEN SUM(pv) > 0 THEN ROUND(SUM(pv * avg_duration) / SUM(pv)) ELSE 0 END AS avg_duration
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

    /* #4 新访客比例：从 events 表实时查 */
    const [newVRows] = await db.execute<RowDataPacket[]>(`
        SELECT
            SUM(is_new) AS new_count,
            COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
    `, [siteId, startDate + ' 00:00:00']);
    const newV = newVRows[0] as any;
    const newVisitorRate = (newV?.total > 0) ? Math.round(((newV.new_count || 0) / newV.total) * 1000) / 10 : 0;

    return { pv, uv, bounceRate, avgDuration, newVisitorRate, pvChange, uvChange };
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

    /* B5 修复：补全缺失日期，保证时间轴连续 */
    const dataMap = new Map<string, TrendPoint>();
    for (const r of rows as any[]) {
        dataMap.set(formatDate(new Date(r.date)), { date: formatDate(new Date(r.date)), pv: r.pv || 0, uv: r.uv || 0 });
    }

    const result: TrendPoint[] = [];
    const today = formatDate(new Date());
    for (let i = days; i >= 0; i--) {
        const d = formatDate(new Date(Date.now() - i * 86400000));
        if (d > today) continue;
        result.push(dataMap.get(d) || { date: d, pv: 0, uv: 0 });
    }

    return result;
}

/*== 页面排行 TOP N ==*/
export async function getPageRank(siteId: string, range: DateRange, limit = 10, skipAggregate = false): Promise<PageRankItem[]> {
    const db = getDb();
    if (!db) return [];

    if (!skipAggregate) await ensureAggregated(siteId, range);

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT path, SUM(pv) AS pv, SUM(uv) AS uv, SUM(bounce) AS bounce,
               CASE WHEN SUM(pv) > 0 THEN ROUND(SUM(pv * avg_duration) / SUM(pv)) ELSE 0 END AS avg_duration
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
        bounceRate: r.pv > 0 ? Math.round((r.bounce / r.pv) * 1000) / 10 : 0,
        avgDuration: r.avg_duration || 0,
    }));
}

/*== 来源智能归类（#18 新增） ==*/
function categorizeSource(source: string): string {
    if (!source || source === '直接访问') return '直接访问';

    const s = source.toLowerCase();

    /* 搜索引擎 */
    if (s.includes('google.')) return 'Google 搜索';
    if (s.includes('baidu.com')) return '百度搜索';
    if (s.includes('bing.com')) return 'Bing 搜索';
    if (s.includes('sogou.com')) return '搜狗搜索';
    if (s.includes('so.com') || s.includes('360.cn')) return '360 搜索';
    if (s.includes('duckduckgo.com')) return 'DuckDuckGo';

    /* 社交/内容平台 */
    if (s.includes('weixin.qq.com') || s.includes('mp.weixin')) return '微信';
    if (s.includes('weibo.com') || s.includes('weibo.cn')) return '微博';
    if (s.includes('douyin.com') || s.includes('tiktok.com')) return '抖音/TikTok';
    if (s.includes('xiaohongshu.com') || s.includes('xhslink.com')) return '小红书';
    if (s.includes('zhihu.com')) return '知乎';
    if (s.includes('bilibili.com')) return 'B站';
    if (s.includes('twitter.com') || s.includes('x.com')) return 'Twitter/X';
    if (s.includes('facebook.com') || s.includes('fb.com')) return 'Facebook';
    if (s.includes('linkedin.com')) return 'LinkedIn';
    if (s.includes('github.com')) return 'GitHub';

    /* AI 来源 */
    if (s.includes('chatgpt.com') || s.includes('chat.openai.com')) return 'ChatGPT';
    if (s.includes('perplexity.ai')) return 'Perplexity';
    if (s.includes('claude.ai')) return 'Claude';

    /* 其他：返回原始域名 */
    return source;
}

/*== 来源排行 TOP N（从 events 表实时查，daily 表不存来源） ==*/
export async function getSources(siteId: string, range: DateRange, limit = 8): Promise<SourceItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    /* #18 修复：SQL 提取域名后，JS 层再归类 */
    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            CASE
                WHEN referrer IS NULL OR referrer = '' THEN '直接访问'
                ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(referrer, '://', -1), '/', 1)
            END AS source,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
        GROUP BY source
        ORDER BY count DESC
    `, [siteId, startDate + ' 00:00:00']);

    /* B9 修复：百分比基于全站总量而非 TOP N 的 count 之和 */
    const [totalRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
    `, [siteId, startDate + ' 00:00:00']);
    const total = (totalRows[0] as any)?.total || 0;

    /* #18 来源智能归类：归类后合并同名的 count */
    const merged = new Map<string, number>();
    for (const r of rows as any[]) {
        const category = categorizeSource(r.source);
        merged.set(category, (merged.get(category) || 0) + (r.count || 0));
    }

    /* 按合并后的 count 降序排列，截取 TOP N */
    const sorted = Array.from(merged.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

    return sorted.map(([source, count]) => ({
        source,
        count,
        percent: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
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
                WHEN screen LIKE '%x%' AND CAST(SUBSTRING_INDEX(screen, 'x', 1) AS UNSIGNED) <= 1200 THEN 'Tablet'
                ELSE 'Desktop'
            END AS device,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
        GROUP BY device
        ORDER BY count DESC
    `, [siteId, startDate + ' 00:00:00']);

    const total = (rows as any[]).reduce((sum, r) => sum + (r.count || 0), 0);

    return (rows as any[]).map(r => ({
        device: r.device,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 语言分布（#5 新增，复用设备分布模式） ==*/
export interface LanguageItem {
    language: string;
    count: number;
    percent: number;
}

export async function getLanguages(siteId: string, range: DateRange, limit = 8): Promise<LanguageItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            COALESCE(lang, '未知') AS language,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
        GROUP BY language
        ORDER BY count DESC
        LIMIT ?
    `, [siteId, startDate + ' 00:00:00', limit]);

    const total = (rows as any[]).reduce((sum, r) => sum + (r.count || 0), 0);

    return (rows as any[]).map(r => ({
        language: r.language,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 浏览器分布（#15 新增） ==*/
export interface BrowserItem {
    browser: string;
    count: number;
    percent: number;
}

export async function getBrowsers(siteId: string, range: DateRange, limit = 8): Promise<BrowserItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            COALESCE(browser, '未知') AS browser,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
        GROUP BY browser
        ORDER BY count DESC
        LIMIT ?
    `, [siteId, startDate + ' 00:00:00', limit]);

    const [totalRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
    `, [siteId, startDate + ' 00:00:00']);
    const total = (totalRows[0] as any)?.total || 0;

    return (rows as any[]).map(r => ({
        browser: r.browser,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 操作系统分布（#16 新增） ==*/
export interface OSItem {
    os: string;
    count: number;
    percent: number;
}

export async function getOS(siteId: string, range: DateRange, limit = 8): Promise<OSItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            COALESCE(os, '未知') AS os,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
        GROUP BY os
        ORDER BY count DESC
        LIMIT ?
    `, [siteId, startDate + ' 00:00:00', limit]);

    const [totalRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
    `, [siteId, startDate + ' 00:00:00']);
    const total = (totalRows[0] as any)?.total || 0;

    return (rows as any[]).map(r => ({
        os: r.os,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 地理分布项（#9 #10 新增） ==*/
export interface GeoItem {
    name: string;    // 国家/省份名
    count: number;
    percent: number;
}

/*== 国家分布排行 ==*/
export async function getCountries(siteId: string, range: DateRange, limit = 8): Promise<GeoItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            COALESCE(country, '未知') AS name,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
        GROUP BY name
        ORDER BY count DESC
        LIMIT ?
    `, [siteId, startDate + ' 00:00:00', limit]);

    /* 计算全站总量而非只算 TOP N */
    const [totalRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
    `, [siteId, startDate + ' 00:00:00']);
    const total = (totalRows[0] as any)?.total || 0;

    return (rows as any[]).map(r => ({
        name: r.name,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 省份/城市 TOP N 排行 ==*/
export async function getRegions(siteId: string, range: DateRange, limit = 10): Promise<GeoItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            COALESCE(region, '未知') AS name,
            COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
          AND country = '中国'
        GROUP BY name
        ORDER BY count DESC
        LIMIT ?
    `, [siteId, startDate + ' 00:00:00', limit]);

    /* 中国访客总量 */
    const [totalRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
          AND country = '中国'
    `, [siteId, startDate + ' 00:00:00']);
    const total = (totalRows[0] as any)?.total || 0;

    return (rows as any[]).map(r => ({
        name: r.name,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 入口页面排行（#19 新增：is_session = 1 的 pageview） ==*/
export interface EntryExitItem {
    path: string;
    count: number;
    percent: number;
}

export async function getEntryPages(siteId: string, range: DateRange, limit = 10): Promise<EntryExitItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT path, COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND is_session = 1 AND created_at >= ?
        GROUP BY path
        ORDER BY count DESC
        LIMIT ?
    `, [siteId, startDate + ' 00:00:00', limit]);

    const [totalRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND is_session = 1 AND created_at >= ?
    `, [siteId, startDate + ' 00:00:00']);
    const total = (totalRows[0] as any)?.total || 0;

    return (rows as any[]).map(r => ({
        path: r.path,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 出口页面排行（#20 新增：type = 'leave' 的 path） ==*/
export async function getExitPages(siteId: string, range: DateRange, limit = 10): Promise<EntryExitItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT path, COUNT(*) AS count
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'leave' AND created_at >= ?
        GROUP BY path
        ORDER BY count DESC
        LIMIT ?
    `, [siteId, startDate + ' 00:00:00', limit]);

    const [totalRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'leave' AND created_at >= ?
    `, [siteId, startDate + ' 00:00:00']);
    const total = (totalRows[0] as any)?.total || 0;

    return (rows as any[]).map(r => ({
        path: r.path,
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 访问记录 ==*/
export interface VisitRecord {
    id: number;
    path: string;
    title: string;        // #2 新增：页面标题
    referrer: string;
    device: string;
    visitorId: string;
    isNew: boolean;       // #3 新增：新访客标记
    ip: string;           // #11 新增：遮蔽 IP
    location: string;     // #11 新增：如 '中国·上海'
    duration: number | null;
    createdAt: string;
}

export async function getVisits(
    siteId: string,
    range: DateRange,
    page: number,
    pageSize: number,
): Promise<{ data: VisitRecord[]; total: number }> {
    const db = getDb();
    if (!db) return { data: [], total: 0 };

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));
    const offset = (page - 1) * pageSize;

    /* 总数 */
    const [countRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ?
    `, [siteId, startDate + ' 00:00:00']);
    const total = (countRows[0] as any)?.total || 0;

    /* 分页数据 — #2 title, #3 is_new, #11 ip/country/region/city
       B7 修复：LEFT JOIN 同一 session 的 leave 事件获取 duration */
    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            p.id,
            p.path,
            p.title,
            p.referrer,
            p.screen,
            p.visitor_id,
            p.is_new,
            COALESCE(l.duration, p.duration) AS duration,
            p.ip,
            p.country,
            p.region,
            p.city,
            p.created_at
        FROM zhijian_track_events p
        LEFT JOIN zhijian_track_events l
            ON l.site_id = p.site_id
            AND l.session_id = p.session_id
            AND l.type = 'leave'
            AND l.duration IS NOT NULL
        WHERE p.site_id = ? AND p.type = 'pageview' AND p.created_at >= ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `, [siteId, startDate + ' 00:00:00', pageSize, offset]);

    const data: VisitRecord[] = (rows as any[]).map((r) => {
        /* 从 screen 字段推导设备类型，格式如 "1920x1080" */
        let device = 'Desktop';
        if (r.screen && typeof r.screen === 'string' && r.screen.includes('x')) {
            const w = parseInt(r.screen.split('x')[0], 10);
            if (!isNaN(w)) {
                if (w <= 768) device = 'Mobile';
                else if (w <= 1200) device = 'Tablet';
            }
        }

        /* 来源：空则显示「直接访问」，否则提取域名 */
        let referrer = '直接访问';
        if (r.referrer && typeof r.referrer === 'string' && r.referrer.trim()) {
            try {
                const url = new URL(r.referrer);
                referrer = url.hostname;
            } catch {
                referrer = r.referrer.split('/')[0] || '直接访问';
            }
        }

        /* 位置信息（#11） */
        const locationParts = [r.country, r.region, r.city].filter(Boolean);
        const location = locationParts.length > 0 ? locationParts.join('·') : '-';

        return {
            id: r.id,
            path: r.path || '/',
            title: r.title || '',
            referrer,
            device,
            visitorId: (r.visitor_id || '').slice(0, 8),
            isNew: r.is_new === 1,
            ip: r.ip || '-',
            location,
            duration: r.duration != null && r.duration > 0 ? r.duration : null,
            createdAt: r.created_at instanceof Date
                ? r.created_at.toISOString()
                : String(r.created_at),
        };
    });

    return { data, total };
}
