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

/*== 日期范围工具 ==*/
export type DateRange = '7d' | '30d' | '90d';

function getDaysAgo(range: DateRange): number {
    switch (range) {
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
    }
}

/*== 从 screen 字段推导设备类型（与 SQL 中 CASE WHEN 逻辑保持一致） ==*/
function detectDevice(screen: string | null): string {
    if (screen && screen.includes('x')) {
        const w = parseInt(screen.split('x')[0], 10);
        if (!isNaN(w)) {
            if (w <= 768) return 'Mobile';
            if (w <= 1200) return 'Tablet';
        }
    }
    return 'Desktop';
}

function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/*== 将本地日期转换为 UTC 范围字符串，用于匹配 events 表的 created_at（UTC） ==*/
function localDateToUtcRange(date: string): { start: string; end: string } {
    /* events 表的 created_at 由 MySQL CURRENT_TIMESTAMP 写入，存储的是 UTC 时间。
       本地日期 "2026-06-14"（UTC+8）对应的 UTC 范围是：
       2026-06-13T16:00:00 ~ 2026-06-14T16:00:00
       用 new Date(localMidnight + timezoneOffset) 让 JS 自动转 UTC */
    const offset = -(new Date().getTimezoneOffset() / 60);  // 正数=东时区，如 +8
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset);
    const mins = (absOffset - hours) * 60;
    const tzStr = sign + String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');

    const startDt = new Date(date + 'T00:00:00' + tzStr);
    const endDt = new Date(date + 'T23:59:59' + tzStr);
    endDt.setSeconds(endDt.getSeconds() + 1);  // 溢出到次日 00:00:00

    const start = startDt.toISOString().slice(0, 19).replace('T', ' ');
    const end = endDt.toISOString().slice(0, 19).replace('T', ' ');
    return { start, end };
}

/*== 日聚合：将指定日期的 events 聚合到 daily 表 ==*/
export async function aggregateDaily(siteId: string, date: string): Promise<void> {
    const db = getDb();
    if (!db) return;

    /* 范围查询：created_at >= UTC起点 AND created_at < UTC终点，利用索引
       date 是本地日期（如 "2026-06-14"），需转为 UTC 范围匹配 events 的 UTC created_at */
    const utcRange = localDateToUtcRange(date);

    /*-- 整站汇总 --*/
    /* PV/UV/sessions/new_visitors */
    const [pvRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv,
               COUNT(DISTINCT session_id) AS sessions, SUM(is_new) AS new_visitors
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'pageview'
    `, [siteId, utcRange.start, utcRange.end]);
    const pv = (pvRows[0] as any)?.pv || 0;
    const uv = (pvRows[0] as any)?.uv || 0;
    const sessions = (pvRows[0] as any)?.sessions || 0;
    const newVisitors = (pvRows[0] as any)?.new_visitors || 0;

    /* 跳出数——只有 1 个 pageview 的 session 且无有效 leave（duration >= 10） */
    const [bounceRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS bounce
        FROM (
            SELECT e.session_id
            FROM zhijian_track_events e
            LEFT JOIN zhijian_track_events l
                ON l.session_id = e.session_id
                AND l.site_id = e.site_id
                AND l.type = 'leave'
                AND l.duration >= 10
                AND l.created_at >= ? AND l.created_at < ?
            WHERE e.site_id = ? AND e.created_at >= ? AND e.created_at < ? AND e.type = 'pageview'
              AND e.session_id IS NOT NULL
            GROUP BY e.session_id
            HAVING COUNT(e.id) = 1 AND MAX(l.id) IS NULL
        ) single
    `, [utcRange.start, utcRange.end, siteId, utcRange.start, utcRange.end]);
    const bounce = (bounceRows[0] as any)?.bounce || 0;

    /* 平均停留——从 leave 事件取 duration */
    const [durRows] = await db.execute<RowDataPacket[]>(`
        SELECT ROUND(AVG(duration)) AS avg_duration
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'leave' AND duration > 0
    `, [siteId, utcRange.start, utcRange.end]);
    const avgDuration = (durRows[0] as any)?.avg_duration || 0;

    if (pv > 0) {
        await db.execute(`
            INSERT INTO zhijian_track_daily (site_id, date, row_type, path, pv, uv, sessions, new_visitors, bounce, avg_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE pv=VALUES(pv), uv=VALUES(uv), sessions=VALUES(sessions),
                new_visitors=VALUES(new_visitors), bounce=VALUES(bounce), avg_duration=VALUES(avg_duration)
        `, [siteId, date, 'summary', '', pv, uv, sessions, newVisitors, bounce, avgDuration]);
    }

    /*-- 按页面路径聚合 --*/
    const [pageRows] = await db.execute<RowDataPacket[]>(`
        SELECT
            path,
            COUNT(*) AS pv,
            COUNT(DISTINCT visitor_id) AS uv,
            COUNT(DISTINCT session_id) AS sessions,
            SUM(is_new) AS new_visitors
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'pageview'
        GROUP BY path
    `, [siteId, utcRange.start, utcRange.end]);

    /* 按路径统计 leave 事件的平均停留——直接查 leave.path，消除笛卡尔积 */
    const [pageDurRows] = await db.execute<RowDataPacket[]>(`
        SELECT path, ROUND(AVG(duration)) AS avg_duration
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'leave' AND duration > 0
        GROUP BY path
    `, [siteId, utcRange.start, utcRange.end]);

    const pageDurMap = new Map<string, number>();
    for (const r of pageDurRows as any[]) {
        pageDurMap.set(r.path, r.avg_duration || 0);
    }

    for (const row of pageRows as any[]) {
        const pathAvgDur = pageDurMap.get(row.path) || 0;
        await db.execute(`
            INSERT INTO zhijian_track_daily (site_id, date, row_type, path, pv, uv, sessions, new_visitors, bounce, avg_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE pv=VALUES(pv), uv=VALUES(uv), sessions=VALUES(sessions),
                avg_duration=VALUES(avg_duration)
        `, [siteId, date, 'page', row.path, row.pv, row.uv, row.sessions, row.new_visitors || 0, 0, pathAvgDur]);
    }

    /*-- 维度聚合：统一循环，每个维度只存 pv（维度行不需要 uv/sessions 等冗余指标） --*/
    type DimDef = { name: string; expr: string; skipEmpty?: boolean };
    const DIMENSIONS: DimDef[] = [
        {
            name: 'source',
            expr: `CASE WHEN referrer IS NULL OR referrer = '' THEN '' ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(referrer, '://', -1), '/', 1) END`,
            skipEmpty: true,  // 直接访问归入整站汇总行，不单独存维度行
        },
        {
            name: 'device',
            expr: `CASE WHEN screen LIKE '%x%' AND CAST(SUBSTRING_INDEX(screen, 'x', 1) AS UNSIGNED) <= 768 THEN 'Mobile' WHEN screen LIKE '%x%' AND CAST(SUBSTRING_INDEX(screen, 'x', 1) AS UNSIGNED) <= 1200 THEN 'Tablet' ELSE 'Desktop' END`,
        },
        {
            name: 'browser',
            expr: `COALESCE(browser, '未知')`,
        },
        {
            name: 'os',
            expr: `COALESCE(os, '未知')`,
        },
        {
            name: 'lang',
            expr: `COALESCE(lang, '未知')`,
        },
        {
            name: 'country',
            expr: `COALESCE(country, '未知')`,
        },
        {
            name: 'region',
            expr: `COALESCE(region, '未知')`,
        },
    ];

    for (const dim of DIMENSIONS) {
        const [dimRows] = await db.execute<RowDataPacket[]>(`
            SELECT ${dim.expr} AS dim_val, COUNT(*) AS pv
            FROM zhijian_track_events
            WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'pageview'
            GROUP BY dim_val
        `, [siteId, utcRange.start, utcRange.end]);

        for (const row of dimRows as any[]) {
            if (dim.skipEmpty && !row.dim_val) continue;
            await db.execute(`
                INSERT INTO zhijian_track_daily (site_id, date, row_type, path, pv, dim_name, dim_value)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE pv=VALUES(pv)
            `, [siteId, date, 'dim', '', row.pv, dim.name, row.dim_val]);
        }
    }
}

/*== 懒聚合：检查最后聚合时间，补算缺失日期 ==*/
export async function ensureAggregated(siteId: string, range: DateRange): Promise<void> {
    const db = getDb();
    if (!db) return;

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    /* 查询 daily 表中已有整站汇总行的日期 */
    const [existingRows] = await db.execute<RowDataPacket[]>(`
        SELECT DISTINCT date FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'summary'
        ORDER BY date
    `, [siteId, startDate]);

    const existingDates = new Set((existingRows as any[]).map(r => r.date instanceof Date ? formatDate(r.date) : String(r.date).slice(0, 10)));

    /* 收集缺失日期 */
    const today = formatDate(new Date());
    const missingDates: string[] = [];
    for (let i = 0; i <= days; i++) {
        const d = formatDate(new Date(Date.now() - i * 86400000));
        if (d > today) continue;
        if (!existingDates.has(d)) {
            missingDates.push(d);
        }
    }

    /* 分批并行补算：每批 7 天，避免连接池过载（connectionLimit: 3） */
    const BATCH_SIZE = 7;
    for (let i = 0; i < missingDates.length; i += BATCH_SIZE) {
        const batch = missingDates.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(d => aggregateDaily(siteId, d)));
    }

    /* 安全清理：确认 daily 表已有聚合数据后，分批删除 90 天前的原始 events */
    const cutoffDate = formatDate(new Date(Date.now() - 90 * 86400000));

    /* 确认 daily 表中 cutoff 之前已有聚合数据 */
    const [aggCheck] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS cnt FROM zhijian_track_daily
        WHERE site_id = ? AND date < ? AND row_type = 'summary'
    `, [siteId, cutoffDate]);
    const hasAggregated = ((aggCheck[0] as any)?.cnt || 0) > 0;

    if (hasAggregated) {
        /* 分批 LIMIT 5000 删除，避免长事务锁表 */
        const DELETE_LIMIT = 5000;
        let deleted = 0;
        do {
            const [result] = await db.execute(
                `DELETE FROM zhijian_track_events WHERE site_id = ? AND created_at < ? LIMIT ?`,
                [siteId, cutoffDate + ' 00:00:00', DELETE_LIMIT],
            );
            deleted = (result as any)?.affectedRows || 0;
        } while (deleted >= DELETE_LIMIT);
    }
}

/*== 概览卡片 ==*/
export async function getOverview(siteId: string, range: DateRange, skipAggregate = false): Promise<OverviewData> {
    const db = getDb();
    if (!db) return { pv: 0, uv: 0, bounceRate: 0, avgDuration: 0, newVisitorRate: 0, pvChange: 0, uvChange: 0 };

    if (!skipAggregate) await ensureAggregated(siteId, range);

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));
    const prevPeriodStart = formatDate(new Date(Date.now() - (days + 1) * 86400000));
    const prevPeriodEnd = formatDate(new Date(Date.now() - 86400000));

    /* 当期汇总 — avg_duration 改为按 PV 加权平均，跳出率分母改为 sessions */
    const [curRows] = await db.execute<RowDataPacket[]>(`
        SELECT SUM(pv) AS pv, SUM(uv) AS uv, SUM(sessions) AS sessions,
               SUM(new_visitors) AS new_visitors, SUM(bounce) AS bounce,
               CASE WHEN SUM(pv) > 0 THEN ROUND(SUM(pv * avg_duration) / SUM(pv)) ELSE 0 END AS avg_duration
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'summary'
    `, [siteId, startDate]);
    const cur = curRows[0] as any;

    /* 上期汇总（用于对比） */
    const [prevRows] = await db.execute<RowDataPacket[]>(`
        SELECT SUM(pv) AS pv, SUM(uv) AS uv
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND date <= ? AND row_type = 'summary'
    `, [siteId, prevPeriodStart, prevPeriodEnd]);
    const prev = prevRows[0] as any;

    const pv = cur?.pv || 0;
    const uv = cur?.uv || 0;
    const sessions = cur?.sessions || 0;
    const newVisitors = cur?.new_visitors || 0;
    const bounce = cur?.bounce || 0;
    const avgDuration = cur?.avg_duration || 0;
    const bounceRate = sessions > 0 ? Math.round((bounce / sessions) * 1000) / 10 : 0;
    const newVisitorRate = uv > 0 ? Math.round((newVisitors / uv) * 1000) / 10 : 0;

    const prevPv = prev?.pv || 0;
    const prevUv = prev?.uv || 0;
    const pvChange = prevPv > 0 ? Math.round(((pv - prevPv) / prevPv) * 1000) / 10 : 0;
    const uvChange = prevUv > 0 ? Math.round(((uv - prevUv) / prevUv) * 1000) / 10 : 0;

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
        WHERE site_id = ? AND date >= ? AND row_type = 'summary'
        ORDER BY date
    `, [siteId, startDate]);

    /* B5 修复：补全缺失日期，保证时间轴连续 */
    const dataMap = new Map<string, TrendPoint>();
    for (const r of rows as any[]) {
        /* r.date 可能是 Date 对象（mysql2 解析）或字符串，统一用 formatDate 格式化 */
        const dateStr = r.date instanceof Date ? formatDate(r.date) : String(r.date).slice(0, 10);
        dataMap.set(dateStr, { date: dateStr, pv: r.pv || 0, uv: r.uv || 0 });
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
        SELECT path, SUM(pv) AS pv, SUM(uv) AS uv, SUM(sessions) AS sessions, SUM(bounce) AS bounce,
               CASE WHEN SUM(pv) > 0 THEN ROUND(SUM(pv * avg_duration) / SUM(pv)) ELSE 0 END AS avg_duration
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'page'
        GROUP BY path
        ORDER BY pv DESC
        LIMIT ?
    `, [siteId, startDate, limit]);

    return (rows as any[]).map(r => ({
        path: r.path,
        pv: r.pv || 0,
        uv: r.uv || 0,
        bounceRate: (r.sessions || 0) > 0 ? Math.round((r.bounce / r.sessions) * 1000) / 10 : 0,
        avgDuration: r.avg_duration || 0,
    }));
}

/*== 来源智能归类 ==*/
function categorizeSource(source: string): string {
    if (!source || source === '直接访问') return '直接访问';

    /* 提取纯域名用于精确匹配，避免 includes 误匹配（如 so.com 匹配到 stackoverflow.com） */
    const domain = source.toLowerCase();

    /* 搜索引擎 */
    if (/google\./.test(domain)) return 'Google 搜索';
    if (domain === 'baidu.com' || domain.endsWith('.baidu.com')) return '百度搜索';
    if (domain === 'bing.com' || domain.endsWith('.bing.com')) return 'Bing 搜索';
    if (domain === 'sogou.com' || domain.endsWith('.sogou.com')) return '搜狗搜索';
    if (domain === 'so.com' || domain.endsWith('.so.com') || domain === '360.cn' || domain.endsWith('.360.cn')) return '360 搜索';
    if (domain === 'duckduckgo.com' || domain.endsWith('.duckduckgo.com')) return 'DuckDuckGo';

    /* 社交/内容平台 */
    if (domain === 'weixin.qq.com' || domain.endsWith('.weixin.qq.com') || domain.startsWith('mp.weixin')) return '微信';
    if (domain === 'weibo.com' || domain === 'weibo.cn' || domain.endsWith('.weibo.com') || domain.endsWith('.weibo.cn')) return '微博';
    if (domain === 'douyin.com' || domain.endsWith('.douyin.com') || domain === 'tiktok.com' || domain.endsWith('.tiktok.com')) return '抖音/TikTok';
    if (domain === 'xiaohongshu.com' || domain.endsWith('.xiaohongshu.com') || domain === 'xhslink.com' || domain.endsWith('.xhslink.com')) return '小红书';
    if (domain === 'zhihu.com' || domain.endsWith('.zhihu.com')) return '知乎';
    if (domain === 'bilibili.com' || domain.endsWith('.bilibili.com')) return 'B站';
    if (domain === 'twitter.com' || domain.endsWith('.twitter.com') || domain === 'x.com' || domain.endsWith('.x.com')) return 'Twitter/X';
    if (domain === 'facebook.com' || domain.endsWith('.facebook.com') || domain === 'fb.com' || domain.endsWith('.fb.com')) return 'Facebook';
    if (domain === 'linkedin.com' || domain.endsWith('.linkedin.com')) return 'LinkedIn';
    if (domain === 'github.com' || domain.endsWith('.github.com')) return 'GitHub';

    /* AI 来源 */
    if (domain === 'chatgpt.com' || domain === 'chat.openai.com') return 'ChatGPT';
    if (domain === 'perplexity.ai' || domain.endsWith('.perplexity.ai')) return 'Perplexity';
    if (domain === 'claude.ai' || domain.endsWith('.claude.ai')) return 'Claude';

    /* 其他：返回原始域名 */
    return source;
}

/*== 来源排行 TOP N（从 daily 表查维度行） ==*/
export async function getSources(siteId: string, range: DateRange, limit = 8): Promise<SourceItem[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    /* 整站 PV 总量 */
    const [totalRows] = await db.execute<RowDataPacket[]>(`
        SELECT SUM(pv) AS total FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'summary'
    `, [siteId, startDate]);
    const total = (totalRows[0] as any)?.total || 0;

    /* 从 daily 表查 source 维度行 */
    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT dim_value AS source, SUM(pv) AS count
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'dim' AND dim_name = 'source'
        GROUP BY dim_value
        ORDER BY count DESC
    `, [siteId, startDate]);

    /* 来源智能归类：归类后合并同名的 count */
    const merged = new Map<string, number>();
    let sourceTotal = 0;
    for (const r of rows as any[]) {
        const category = categorizeSource(r.source);
        merged.set(category, (merged.get(category) || 0) + (r.count || 0));
        sourceTotal += (r.count || 0);
    }

    /* 无外部来源时，剩余 PV 全部归入"直接访问" */
    const directCount = total - sourceTotal;
    if (directCount > 0) {
        merged.set('直接访问', (merged.get('直接访问') || 0) + directCount);
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

/*== 通用分布查询（从 events 表实时查） ==*/
interface DistributionConfig {
    columnExpr: string;        // SELECT 的分组列表达式
    columnAlias: string;       // 列别名（也是返回对象的 key）
    extraWhere?: string;       // 额外 WHERE 条件（追加在 baseWhere 后）
    totalExtraWhere?: string;  // total 查询的额外 WHERE（默认同 extraWhere）
    overrideWhere?: string;    // 完全覆盖 baseWhere（出口页面：type='leave' 而非 pageview）
    overrideTotalWhere?: string; // total 查询的完全覆盖 WHERE
    overrideParams?: unknown[];   // overrideWhere 的参数（显式传入，避免推断错误）
    overrideTotalParams?: unknown[]; // overrideTotalWhere 的参数
    limit?: number;
    useReduceTotal?: boolean;  // true = 从结果行 reduce 求和（无 LIMIT 的场景）
}

async function getDistribution(siteId: string, range: DateRange, config: DistributionConfig): Promise<Record<string, any>[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));
    const startDateTime = startDate + ' 00:00:00';

    const baseWhere = `site_id = ? AND type = 'pageview' AND created_at >= ?`;
    const whereClause = config.overrideWhere
        ? config.overrideWhere
        : (config.extraWhere ? `${baseWhere} ${config.extraWhere}` : baseWhere);
    const whereParams = config.overrideWhere
        ? (config.overrideParams || [siteId, startDateTime])
        : [siteId, startDateTime];
    const limitClause = config.limit ? ' LIMIT ?' : '';
    const limitParams = config.limit ? [config.limit] : [];

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT ${config.columnExpr} AS ${config.columnAlias}, COUNT(*) AS count
        FROM zhijian_track_events
        WHERE ${whereClause}
        GROUP BY ${config.columnAlias}
        ORDER BY count DESC${limitClause}
    `, [...whereParams, ...limitParams]);

    let total: number;
    if (config.useReduceTotal) {
        total = (rows as any[]).reduce((sum, r) => sum + (r.count || 0), 0);
    } else {
        const totalWhere = config.overrideTotalWhere
            ? config.overrideTotalWhere
            : (config.overrideWhere
                ? config.overrideWhere
                : (config.totalExtraWhere || config.extraWhere
                    ? `${baseWhere} ${config.totalExtraWhere || config.extraWhere}`
                    : baseWhere));
        const totalParams = config.overrideTotalWhere
            ? (config.overrideTotalParams || config.overrideParams || [siteId, startDateTime])
            : (config.overrideWhere
                ? (config.overrideParams || [siteId, startDateTime])
                : [siteId, startDateTime]);
        const [totalRows] = await db.execute<RowDataPacket[]>(`
            SELECT COUNT(*) AS total FROM zhijian_track_events WHERE ${totalWhere}
        `, totalParams);
        total = (totalRows[0] as any)?.total || 0;
    }

    return (rows as any[]).map(r => ({
        [config.columnAlias]: r[config.columnAlias],
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 通用分布查询（从 daily 表查维度数据） ==*/
interface DailyDistributionConfig {
    dimName: string;            // 维度名（如 source/device/browser）
    columnAlias: string;        // 返回对象的 key（如 device/language/name）
    regionFilter?: string;      // 省份查询时的国家过滤条件（如 '中国'）
    limit?: number;
}

async function getDistributionFromDaily(siteId: string, range: DateRange, config: DailyDistributionConfig): Promise<Record<string, any>[]> {
    const db = getDb();
    if (!db) return [];

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const regionJoin = config.regionFilter
        ? `INNER JOIN zhijian_track_daily c
             ON c.site_id = d.site_id AND c.date = d.date
             AND c.row_type = 'dim' AND c.dim_name = 'country' AND c.dim_value = ?`
        : '';
    const regionParams = config.regionFilter ? [config.regionFilter] : [];
    const limitClause = config.limit ? ' LIMIT ?' : '';
    const limitParams = config.limit ? [config.limit] : [];

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT d.dim_value AS ${config.columnAlias}, SUM(d.pv) AS count,
               (SELECT SUM(pv) FROM zhijian_track_daily
                WHERE site_id = ? AND date >= ? AND row_type = 'summary') AS total
        FROM zhijian_track_daily d
        ${regionJoin}
        WHERE d.site_id = ? AND d.date >= ? AND d.row_type = 'dim' AND d.dim_name = ?
        GROUP BY d.dim_value
        ORDER BY count DESC${limitClause}
    `, [...regionParams, siteId, startDate, siteId, startDate, config.dimName, ...limitParams]);

    const total = (rows[0] as any)?.total || 0;

    return (rows as any[]).map(r => ({
        [config.columnAlias]: r[config.columnAlias],
        count: r.count || 0,
        percent: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
}

/*== 设备分布 ==*/
export interface DeviceItem {
    device: string;
    count: number;
    percent: number;
}

export async function getDevices(siteId: string, range: DateRange): Promise<DeviceItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'device',
        columnAlias: 'device',
    }) as Promise<DeviceItem[]>;
}

/*== 语言分布 ==*/
export interface LanguageItem {
    language: string;
    count: number;
    percent: number;
}

export async function getLanguages(siteId: string, range: DateRange, limit = 8): Promise<LanguageItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'lang',
        columnAlias: 'language',
        limit,
    }) as Promise<LanguageItem[]>;
}

/*== 浏览器分布 ==*/
export interface BrowserItem {
    browser: string;
    count: number;
    percent: number;
}

export async function getBrowsers(siteId: string, range: DateRange, limit = 8): Promise<BrowserItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'browser',
        columnAlias: 'browser',
        limit,
    }) as Promise<BrowserItem[]>;
}

/*== 操作系统分布 ==*/
export interface OSItem {
    os: string;
    count: number;
    percent: number;
}

export async function getOS(siteId: string, range: DateRange, limit = 8): Promise<OSItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'os',
        columnAlias: 'os',
        limit,
    }) as Promise<OSItem[]>;
}

/*== 地理分布项 ==*/
export interface GeoItem {
    name: string;
    count: number;
    percent: number;
}

/*== 国家分布排行 ==*/
export async function getCountries(siteId: string, range: DateRange, limit = 8): Promise<GeoItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'country',
        columnAlias: 'name',
        limit,
    }) as Promise<GeoItem[]>;
}

/*== 省份 TOP N（仅中国访客） ==*/
export async function getRegions(siteId: string, range: DateRange, limit = 10): Promise<GeoItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'region',
        columnAlias: 'name',
        regionFilter: '中国',
        limit,
    }) as Promise<GeoItem[]>;
}

/*== 入口/出口页面排行（仍从 events 表查，daily 表不存入口/出口维度） ==*/
export interface EntryExitItem {
    path: string;
    count: number;
    percent: number;
}

export async function getEntryPages(siteId: string, range: DateRange, limit = 10): Promise<EntryExitItem[]> {
    return getDistribution(siteId, range, {
        columnExpr: 'path',
        columnAlias: 'path',
        extraWhere: 'AND is_session = 1',
        limit,
    }) as Promise<EntryExitItem[]>;
}

export async function getExitPages(siteId: string, range: DateRange, limit = 10): Promise<EntryExitItem[]> {
    return getDistribution(siteId, range, {
        columnExpr: 'path',
        columnAlias: 'path',
        overrideWhere: "site_id = ? AND type = 'leave' AND created_at >= ?",
        overrideTotalWhere: "site_id = ? AND type = 'leave' AND created_at >= ?",
        overrideParams: [siteId, formatDate(new Date(Date.now() - getDaysAgo(range) * 86400000)) + ' 00:00:00'],
        overrideTotalParams: [siteId, formatDate(new Date(Date.now() - getDaysAgo(range) * 86400000)) + ' 00:00:00'],
        limit,
    }) as Promise<EntryExitItem[]>;
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

    /* 分页数据 — LEFT JOIN 同一 session 的 leave 事件获取 duration
       子查询加 site_id + 日期过滤，避免全表扫描 */
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
        LEFT JOIN (
            SELECT session_id, site_id, MAX(duration) AS duration
            FROM zhijian_track_events
            WHERE type = 'leave' AND duration IS NOT NULL
              AND site_id = ? AND created_at >= ?
            GROUP BY session_id, site_id
        ) l ON l.site_id = p.site_id AND l.session_id = p.session_id
        WHERE p.site_id = ? AND p.type = 'pageview' AND p.created_at >= ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `, [siteId, startDate + ' 00:00:00', siteId, startDate + ' 00:00:00', pageSize, offset]);

    const data: VisitRecord[] = (rows as any[]).map((r) => {
        const device = detectDevice(r.screen);

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
