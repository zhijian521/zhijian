import type { RowDataPacket } from 'mysql2';
import { getDb } from '../core/db';

/*== 事件写入行（对应 zhijian_track_events 19 个业务列，调用方负责截断与白名单过滤） ==*/
export interface TrackEventRow {
    site_id: string;
    type: string;
    path: string;
    referrer: string | null;
    title: string | null;
    duration: number | null;
    screen: string | null;
    lang: string | null;
    is_new: number;
    is_session: number;
    visitor_id: string | null;
    session_id: string | null;
    ip: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    ua: string | null;
    browser: string | null;
    os: string | null;
}

/*== 校验站点存在且状态为启用；数据库不可用时返回 null（与「站点不存在」区分） ==*/
export async function isTrackSiteActive(siteId: string): Promise<boolean | null> {
    const db = getDb();
    if (!db) return null;

    const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM zhijian_track_sites WHERE id = ? AND status = ?',
        [siteId, 'active']
    );
    return rows.length > 0;
}

/*== 批量写入埋点事件（单行 19 列，热路径仅一次 INSERT，无额外查询） ==*/
export async function insertTrackEvents(rows: TrackEventRow[]): Promise<void> {
    if (rows.length === 0) return;

    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const placeholders = rows
        .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .join(', ');
    const values = rows.flatMap((r) => [
        r.site_id,
        r.type,
        r.path,
        r.referrer,
        r.title,
        r.duration,
        r.screen,
        r.lang,
        r.is_new,
        r.is_session,
        r.visitor_id,
        r.session_id,
        r.ip,
        r.country,
        r.region,
        r.city,
        r.ua,
        r.browser,
        r.os,
    ]);

    await db.execute(
        `INSERT INTO zhijian_track_events (site_id, type, path, referrer, title, duration, screen, lang, is_new, is_session, visitor_id, session_id, ip, country, region, city, ua, browser, os) VALUES ${placeholders}`,
        values
    );
}
