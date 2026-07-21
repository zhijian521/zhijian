import type { RowDataPacket } from 'mysql2';
import { getDb } from '../core/db';
import { ensureAggregated } from './analytics-aggregate';
import { formatDate, getDaysAgo, localDateToUtcRange, rangeToUtcRange } from './analytics-shared';
import type {
    BrowserItem,
    DateRange,
    DeviceItem,
    EntryExitItem,
    GeoItem,
    LanguageItem,
    OSItem,
    OverviewData,
    PageRankItem,
    SourceItem,
    TrendPoint,
    VisitRecord,
} from './analytics-shared';

/*============================================================================
  站点监控分析 — 查询读取数据层

  职责：
  - 概览卡片 / PV·UV 趋势 / 页面排行 / 来源排行
  - 设备·语言·浏览器·操作系统·地理分布（读 daily 维度行）
  - 入口/出口页面与访问记录（读 events 实时查询）
============================================================================*/

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

/*== 概览卡片 — 直接从 events 表实时查询，保证 PV/UV 与访问记录一致 ==*/
export async function getOverview(siteId: string, range: DateRange, skipAggregate = false): Promise<OverviewData> {
    const db = getDb();
    if (!db) return { pv: 0, uv: 0, bounceRate: 0, avgDuration: 0, newVisitorRate: 0, pvChange: 0, uvChange: 0 };

    if (!skipAggregate) await ensureAggregated(siteId, range);

    const utc = rangeToUtcRange(range);

    /*-- 当期：从 events 表实时查，UV 用 COUNT(DISTINCT visitor_id) 跨天去重 --*/
    const [curRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv,
               COUNT(DISTINCT session_id) AS sessions, SUM(is_new) AS new_visitors
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ? AND created_at < ?
    `,
        [siteId, utc.start, utc.end]
    );
    const cur = curRows[0] as any;

    /* 跳出数——只有 1 个 pageview 的 session 且无有效 leave（duration >= 10） */
    const [bounceRows] = await db.execute<RowDataPacket[]>(
        `
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
    `,
        [utc.start, utc.end, siteId, utc.start, utc.end]
    );
    const bounce = Number((bounceRows[0] as any)?.bounce) || 0;

    /* 平均停留——从 leave 事件取 duration */
    const [durRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT ROUND(AVG(duration)) AS avg_duration
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'leave' AND duration > 0
    `,
        [siteId, utc.start, utc.end]
    );
    const avgDuration = Number((durRows[0] as any)?.avg_duration) || 0;

    const pv = Number(cur?.pv) || 0;
    const uv = Number(cur?.uv) || 0;
    const sessions = Number(cur?.sessions) || 0;
    const newVisitors = Number(cur?.new_visitors) || 0;
    const bounceRate = sessions > 0 ? Math.round((bounce / sessions) * 1000) / 10 : 0;
    const newVisitorRate = uv > 0 ? Math.round((newVisitors / uv) * 1000) / 10 : 0;

    /*-- 上期：同样从 events 表查，保证对比口径一致 --*/
    const days = getDaysAgo(range);
    const prevStartDate = formatDate(new Date(Date.now() - (days + 1) * 86400000));
    const prevEndDate = formatDate(new Date(Date.now() - 86400000));
    const prevUtc = {
        start: localDateToUtcRange(prevStartDate).start,
        end: localDateToUtcRange(prevEndDate).end,
    };

    const [prevRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ? AND created_at < ?
    `,
        [siteId, prevUtc.start, prevUtc.end]
    );
    const prev = prevRows[0] as any;

    const prevPv = Number(prev?.pv) || 0;
    const prevUv = Number(prev?.uv) || 0;
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

    const [rows] = await db.execute<RowDataPacket[]>(
        `
        SELECT date, pv, uv FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'summary'
        ORDER BY date
    `,
        [siteId, startDate]
    );

    /* B5 修复：补全缺失日期，保证时间轴连续 */
    const dataMap = new Map<string, TrendPoint>();
    for (const r of rows as any[]) {
        /* r.date 可能是 Date 对象（mysql2 解析）或字符串，统一用 formatDate 格式化 */
        const dateStr = r.date instanceof Date ? formatDate(r.date) : String(r.date).slice(0, 10);
        dataMap.set(dateStr, { date: dateStr, pv: Number(r.pv) || 0, uv: Number(r.uv) || 0 });
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
export async function getPageRank(
    siteId: string,
    range: DateRange,
    limit = 10,
    skipAggregate = false
): Promise<PageRankItem[]> {
    const db = getDb();
    if (!db) return [];

    if (!skipAggregate) await ensureAggregated(siteId, range);

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));

    const [rows] = await db.execute<RowDataPacket[]>(
        `
        SELECT path, SUM(pv) AS pv, SUM(uv) AS uv, SUM(sessions) AS sessions, SUM(bounce) AS bounce,
               CASE WHEN SUM(pv) > 0 THEN ROUND(SUM(pv * avg_duration) / SUM(pv)) ELSE 0 END AS avg_duration
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'page'
        GROUP BY path
        ORDER BY pv DESC
        LIMIT ?
    `,
        [siteId, startDate, limit]
    );

    return (rows as any[]).map((r) => ({
        path: r.path,
        pv: Number(r.pv) || 0,
        uv: Number(r.uv) || 0,
        bounceRate: (Number(r.sessions) || 0) > 0 ? Math.round((Number(r.bounce) / Number(r.sessions)) * 1000) / 10 : 0,
        avgDuration: Number(r.avg_duration) || 0,
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
    if (domain === 'so.com' || domain.endsWith('.so.com') || domain === '360.cn' || domain.endsWith('.360.cn'))
        return '360 搜索';
    if (domain === 'duckduckgo.com' || domain.endsWith('.duckduckgo.com')) return 'DuckDuckGo';

    /* 社交/内容平台 */
    if (domain === 'weixin.qq.com' || domain.endsWith('.weixin.qq.com') || domain.startsWith('mp.weixin'))
        return '微信';
    if (
        domain === 'weibo.com' ||
        domain === 'weibo.cn' ||
        domain.endsWith('.weibo.com') ||
        domain.endsWith('.weibo.cn')
    )
        return '微博';
    if (
        domain === 'douyin.com' ||
        domain.endsWith('.douyin.com') ||
        domain === 'tiktok.com' ||
        domain.endsWith('.tiktok.com')
    )
        return '抖音/TikTok';
    if (
        domain === 'xiaohongshu.com' ||
        domain.endsWith('.xiaohongshu.com') ||
        domain === 'xhslink.com' ||
        domain.endsWith('.xhslink.com')
    )
        return '小红书';
    if (domain === 'zhihu.com' || domain.endsWith('.zhihu.com')) return '知乎';
    if (domain === 'bilibili.com' || domain.endsWith('.bilibili.com')) return 'B站';
    if (domain === 'twitter.com' || domain.endsWith('.twitter.com') || domain === 'x.com' || domain.endsWith('.x.com'))
        return 'Twitter/X';
    if (
        domain === 'facebook.com' ||
        domain.endsWith('.facebook.com') ||
        domain === 'fb.com' ||
        domain.endsWith('.fb.com')
    )
        return 'Facebook';
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
    const [totalRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT SUM(pv) AS total FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'summary'
    `,
        [siteId, startDate]
    );
    const total = Number((totalRows[0] as any)?.total) || 0;

    /* 从 daily 表查 source 维度行 */
    const [rows] = await db.execute<RowDataPacket[]>(
        `
        SELECT dim_value AS source, SUM(pv) AS count
        FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'dim' AND dim_name = 'source'
        GROUP BY dim_value
        ORDER BY count DESC
    `,
        [siteId, startDate]
    );

    /* 来源智能归类：归类后合并同名的 count */
    const merged = new Map<string, number>();
    let sourceTotal = 0;
    for (const r of rows as any[]) {
        const category = categorizeSource(r.source);
        merged.set(category, (merged.get(category) || 0) + (Number(r.count) || 0));
        sourceTotal += Number(r.count) || 0;
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
    columnExpr: string; // SELECT 的分组列表达式
    columnAlias: string; // 列别名（也是返回对象的 key）
    extraWhere?: string; // 额外 WHERE 条件（追加在 baseWhere 后）
    overrideWhere?: string; // 完全覆盖 baseWhere（出口页面：type='leave' 而非 pageview）
    overrideTotalWhere?: string; // total 查询的完全覆盖 WHERE
    overrideParams?: unknown[]; // overrideWhere 的参数（显式传入，避免推断错误）
    overrideTotalParams?: unknown[]; // overrideTotalWhere 的参数
    limit?: number;
}

async function getDistribution(
    siteId: string,
    range: DateRange,
    config: DistributionConfig
): Promise<Record<string, any>[]> {
    const db = getDb();
    if (!db) return [];

    const utc = rangeToUtcRange(range);

    const baseWhere = `site_id = ? AND type = 'pageview' AND created_at >= ? AND created_at < ?`;
    const whereClause = config.overrideWhere
        ? config.overrideWhere
        : config.extraWhere
          ? `${baseWhere} ${config.extraWhere}`
          : baseWhere;
    const whereParams = config.overrideWhere
        ? config.overrideParams || [siteId, utc.start, utc.end]
        : [siteId, utc.start, utc.end];
    const limitClause = config.limit ? ' LIMIT ?' : '';
    const limitParams = config.limit ? [config.limit] : [];

    const [rows] = await db.execute<RowDataPacket[]>(
        `
        SELECT ${config.columnExpr} AS ${config.columnAlias}, COUNT(*) AS count
        FROM zhijian_track_events
        WHERE ${whereClause}
        GROUP BY ${config.columnAlias}
        ORDER BY count DESC${limitClause}
    `,
        [...whereParams, ...limitParams]
    );

    const totalWhere = config.overrideTotalWhere
        ? config.overrideTotalWhere
        : config.overrideWhere
          ? config.overrideWhere
          : baseWhere;
    const totalParams = config.overrideTotalWhere
        ? config.overrideTotalParams || config.overrideParams || [siteId, utc.start, utc.end]
        : config.overrideWhere
          ? config.overrideParams || [siteId, utc.start, utc.end]
          : [siteId, utc.start, utc.end];
    const [totalRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total FROM zhijian_track_events WHERE ${totalWhere}
    `,
        totalParams
    );
    const total = Number((totalRows[0] as any)?.total) || 0;

    return (rows as any[]).map((r) => ({
        [config.columnAlias]: r[config.columnAlias],
        count: Number(r.count) || 0,
        percent: total > 0 ? Math.round((Number(r.count) / total) * 1000) / 10 : 0,
    }));
}

/*== 通用分布查询（从 daily 表查维度数据） ==*/
interface DailyDistributionConfig {
    dimName: string; // 维度名（如 source/device/browser）
    columnAlias: string; // 返回对象的 key（如 device/language/name）
    regionFilter?: string; // 省份查询时的国家过滤条件（如 '中国'）
    limit?: number;
}

async function getDistributionFromDaily(
    siteId: string,
    range: DateRange,
    config: DailyDistributionConfig
): Promise<Record<string, any>[]> {
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

    /* 整站 PV 总量（独立查询，避免子查询每行重复执行） */
    const [totalRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT SUM(pv) AS total FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'summary'
    `,
        [siteId, startDate]
    );
    const total = Number((totalRows[0] as any)?.total) || 0;

    const [rows] = await db.execute<RowDataPacket[]>(
        `
        SELECT d.dim_value AS ${config.columnAlias}, SUM(d.pv) AS count
        FROM zhijian_track_daily d
        ${regionJoin}
        WHERE d.site_id = ? AND d.date >= ? AND d.row_type = 'dim' AND d.dim_name = ?
        GROUP BY d.dim_value
        ORDER BY count DESC${limitClause}
    `,
        [...regionParams, siteId, startDate, config.dimName, ...limitParams]
    );

    return (rows as any[]).map((r) => ({
        [config.columnAlias]: r[config.columnAlias],
        count: Number(r.count) || 0,
        percent: total > 0 ? Math.round((Number(r.count) / total) * 1000) / 10 : 0,
    }));
}

/*== 设备分布 ==*/
export async function getDevices(siteId: string, range: DateRange): Promise<DeviceItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'device',
        columnAlias: 'device',
    }) as Promise<DeviceItem[]>;
}

/*== 语言分布 ==*/
export async function getLanguages(siteId: string, range: DateRange, limit = 8): Promise<LanguageItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'lang',
        columnAlias: 'language',
        limit,
    }) as Promise<LanguageItem[]>;
}

/*== 浏览器分布 ==*/
export async function getBrowsers(siteId: string, range: DateRange, limit = 8): Promise<BrowserItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'browser',
        columnAlias: 'browser',
        limit,
    }) as Promise<BrowserItem[]>;
}

/*== 操作系统分布 ==*/
export async function getOS(siteId: string, range: DateRange, limit = 8): Promise<OSItem[]> {
    return getDistributionFromDaily(siteId, range, {
        dimName: 'os',
        columnAlias: 'os',
        limit,
    }) as Promise<OSItem[]>;
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
export async function getEntryPages(siteId: string, range: DateRange, limit = 10): Promise<EntryExitItem[]> {
    return getDistribution(siteId, range, {
        columnExpr: 'path',
        columnAlias: 'path',
        extraWhere: 'AND is_session = 1',
        limit,
    }) as Promise<EntryExitItem[]>;
}

export async function getExitPages(siteId: string, range: DateRange, limit = 10): Promise<EntryExitItem[]> {
    const utc = rangeToUtcRange(range);
    return getDistribution(siteId, range, {
        columnExpr: 'path',
        columnAlias: 'path',
        overrideWhere: "site_id = ? AND type = 'leave' AND created_at >= ? AND created_at < ?",
        overrideTotalWhere: "site_id = ? AND type = 'leave' AND created_at >= ? AND created_at < ?",
        overrideParams: [siteId, utc.start, utc.end],
        overrideTotalParams: [siteId, utc.start, utc.end],
        limit,
    }) as Promise<EntryExitItem[]>;
}

/*== 访问记录 ==*/
export async function getVisits(
    siteId: string,
    range: DateRange,
    page: number,
    pageSize: number
): Promise<{ data: VisitRecord[]; total: number }> {
    const db = getDb();
    if (!db) return { data: [], total: 0 };

    const utc = rangeToUtcRange(range);
    const offset = (page - 1) * pageSize;

    /* 总数 */
    const [countRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND created_at >= ? AND created_at < ?
    `,
        [siteId, utc.start, utc.end]
    );
    const total = Number((countRows[0] as any)?.total) || 0;

    /* 分页数据 — LEFT JOIN 同一 session 的 leave 事件获取 duration
       子查询加 site_id + 日期过滤，避免全表扫描 */
    const [rows] = await db.execute<RowDataPacket[]>(
        `
        SELECT
            p.id,
            p.path,
            p.title,
            p.referrer,
            p.screen,
            p.visitor_id,
            p.session_id,
            p.is_new,
            p.is_session,
            COALESCE(l.duration, p.duration) AS duration,
            p.ip,
            p.country,
            p.region,
            p.city,
            p.lang,
            p.browser,
            p.os,
            p.created_at
        FROM zhijian_track_events p
        LEFT JOIN (
            SELECT session_id, site_id, MAX(duration) AS duration
            FROM zhijian_track_events
            WHERE type = 'leave' AND duration IS NOT NULL
              AND site_id = ? AND created_at >= ? AND created_at < ?
            GROUP BY session_id, site_id
        ) l ON l.site_id = p.site_id AND l.session_id = p.session_id
        WHERE p.site_id = ? AND p.type = 'pageview' AND p.created_at >= ? AND p.created_at < ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `,
        [siteId, utc.start, utc.end, siteId, utc.start, utc.end, pageSize, offset]
    );

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
            id: Number(r.id),
            path: r.path || '/',
            title: r.title || '',
            referrer,
            device,
            browser: r.browser || '未知',
            os: r.os || '未知',
            lang: r.lang || '未知',
            visitorId: (r.visitor_id || '').slice(0, 8),
            sessionId: (r.session_id || '').slice(0, 8),
            isNew: Number(r.is_new) === 1,
            isSession: Number(r.is_session) === 1,
            ip: r.ip || '-',
            location,
            duration: r.duration != null && Number(r.duration) > 0 ? Number(r.duration) : null,
            createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
        };
    });

    return { data, total };
}
