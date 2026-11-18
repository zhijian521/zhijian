import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getDb, getDbConnection } from '../core/db';
import { formatDate, getDaysAgo, localDateToUtcRange } from './analytics-shared';
import type { DateRange } from './analytics-shared';

/*============================================================================
  站点监控分析 — 聚合写入数据层

  职责：
  - 日聚合：将 events 表聚合到 daily 表（aggregateDaily）
  - 懒聚合补算缺失日期 + 90 天前原始 events 清理（ensureAggregated）
  - 清空站点全部统计数据（clearSiteData，事务）
============================================================================*/

/*== 日聚合：将指定日期的 events 聚合到 daily 表 ==*/
export async function aggregateDaily(siteId: string, date: string): Promise<void> {
    const db = getDb();
    if (!db) return;

    /* 范围查询：created_at >= UTC起点 AND created_at < UTC终点，利用索引
       date 是本地日期（如 "2026-06-14"），需转为 UTC 范围匹配 events 的 UTC created_at */
    const utcRange = localDateToUtcRange(date);

    /*-- 整站汇总 --*/
    /* PV/UV/sessions/new_visitors */
    const [pvRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv,
               COUNT(DISTINCT session_id) AS sessions, SUM(is_new) AS new_visitors
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'pageview'
    `,
        [siteId, utcRange.start, utcRange.end]
    );
    const pv = (pvRows[0] as any)?.pv || 0;
    const uv = (pvRows[0] as any)?.uv || 0;
    const sessions = (pvRows[0] as any)?.sessions || 0;
    const newVisitors = (pvRows[0] as any)?.new_visitors || 0;

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
        [utcRange.start, utcRange.end, siteId, utcRange.start, utcRange.end]
    );
    const bounce = (bounceRows[0] as any)?.bounce || 0;

    /* 平均停留——从 leave 事件取 duration */
    const [durRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT ROUND(AVG(duration)) AS avg_duration
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'leave' AND duration > 0
    `,
        [siteId, utcRange.start, utcRange.end]
    );
    const avgDuration = (durRows[0] as any)?.avg_duration || 0;

    if (pv > 0) {
        await db.execute(
            `
            INSERT INTO zhijian_track_daily (site_id, date, row_type, path, pv, uv, sessions, new_visitors, bounce, avg_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE pv=VALUES(pv), uv=VALUES(uv), sessions=VALUES(sessions),
                new_visitors=VALUES(new_visitors), bounce=VALUES(bounce), avg_duration=VALUES(avg_duration)
        `,
            [siteId, date, 'summary', '', pv, uv, sessions, newVisitors, bounce, avgDuration]
        );
    }

    /*-- 按页面路径聚合 --*/
    const [pageRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT
            path,
            COUNT(*) AS pv,
            COUNT(DISTINCT visitor_id) AS uv,
            COUNT(DISTINCT session_id) AS sessions,
            SUM(is_new) AS new_visitors
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'pageview'
        GROUP BY path
    `,
        [siteId, utcRange.start, utcRange.end]
    );

    /* 按路径统计 leave 事件的平均停留——直接查 leave.path，消除笛卡尔积 */
    const [pageDurRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT path, ROUND(AVG(duration)) AS avg_duration
        FROM zhijian_track_events
        WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'leave' AND duration > 0
        GROUP BY path
    `,
        [siteId, utcRange.start, utcRange.end]
    );

    const pageDurMap = new Map<string, number>();
    for (const r of pageDurRows as any[]) {
        pageDurMap.set(r.path, Number(r.avg_duration) || 0);
    }

    for (const row of pageRows as any[]) {
        const pathAvgDur = pageDurMap.get(row.path) || 0;
        await db.execute(
            `
            INSERT INTO zhijian_track_daily (site_id, date, row_type, path, pv, uv, sessions, new_visitors, bounce, avg_duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE pv=VALUES(pv), uv=VALUES(uv), sessions=VALUES(sessions),
                avg_duration=VALUES(avg_duration)
        `,
            [siteId, date, 'page', row.path, row.pv, row.uv, row.sessions, row.new_visitors || 0, 0, pathAvgDur]
        );
    }

    /*-- 维度聚合：统一循环，每个维度只存 pv（维度行不需要 uv/sessions 等冗余指标） --*/
    type DimDef = { name: string; expr: string; skipEmpty?: boolean };
    const DIMENSIONS: DimDef[] = [
        {
            name: 'source',
            expr: `CASE WHEN referrer IS NULL OR referrer = '' THEN '' ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(referrer, '://', -1), '/', 1) END`,
            skipEmpty: true, // 直接访问归入整站汇总行，不单独存维度行
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
        const [dimRows] = await db.execute<RowDataPacket[]>(
            `
            SELECT ${dim.expr} AS dim_val, COUNT(*) AS pv
            FROM zhijian_track_events
            WHERE site_id = ? AND created_at >= ? AND created_at < ? AND type = 'pageview'
            GROUP BY dim_val
        `,
            [siteId, utcRange.start, utcRange.end]
        );

        for (const row of dimRows as any[]) {
            if (dim.skipEmpty && !row.dim_val) continue;
            await db.execute(
                `
                INSERT INTO zhijian_track_daily (site_id, date, row_type, path, pv, dim_name, dim_value)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE pv=VALUES(pv)
            `,
                [siteId, date, 'dim', '', row.pv, dim.name, row.dim_val]
            );
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
    const [existingRows] = await db.execute<RowDataPacket[]>(
        `
        SELECT DISTINCT date FROM zhijian_track_daily
        WHERE site_id = ? AND date >= ? AND row_type = 'summary'
        ORDER BY date
    `,
        [siteId, startDate]
    );

    const existingDates = new Set(
        (existingRows as any[]).map((r) => (r.date instanceof Date ? formatDate(r.date) : String(r.date).slice(0, 10)))
    );

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
        await Promise.all(batch.map((d) => aggregateDaily(siteId, d)));
    }

    /* 安全清理：确认 daily 表已有聚合数据后，分批删除 90 天前的原始 events */
    const cutoffDate = formatDate(new Date(Date.now() - 90 * 86400000));

    /* 确认 daily 表中 cutoff 之前已有聚合数据 */
    const [aggCheck] = await db.execute<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS cnt FROM zhijian_track_daily
        WHERE site_id = ? AND date < ? AND row_type = 'summary'
    `,
        [siteId, cutoffDate]
    );
    const hasAggregated = ((aggCheck[0] as any)?.cnt || 0) > 0;

    if (hasAggregated) {
        /* 分批 LIMIT 5000 删除，避免长事务锁表 */
        const cutoffUtcStart = localDateToUtcRange(cutoffDate).start;
        const DELETE_LIMIT = 5000;
        let deleted = 0;
        do {
            const [result] = await db.execute(
                `DELETE FROM zhijian_track_events WHERE site_id = ? AND created_at < ? LIMIT ?`,
                [siteId, cutoffUtcStart, DELETE_LIMIT]
            );
            deleted = (result as any)?.affectedRows || 0;
        } while (deleted >= DELETE_LIMIT);
    }
}

/*== 清空站点全部统计数据 ==*/
export async function clearSiteData(siteId: string): Promise<{ events: number; daily: number }> {
    const conn = await getDbConnection();
    try {
        await conn.beginTransaction();
        const [er] = await conn.execute<ResultSetHeader>('DELETE FROM zhijian_track_events WHERE site_id = ?', [
            siteId,
        ]);
        const [dr] = await conn.execute<ResultSetHeader>('DELETE FROM zhijian_track_daily WHERE site_id = ?', [siteId]);
        await conn.commit();
        return { events: er.affectedRows, daily: dr.affectedRows };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}
