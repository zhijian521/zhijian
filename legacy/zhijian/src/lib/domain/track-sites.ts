import type { RowDataPacket } from 'mysql2';
import { getDb } from '../core/db';

/*== 站点类型 ==*/
export interface TrackSite {
    id: string;
    name: string;
    domain: string;
    status: 'active' | 'paused' | 'deleted';
    created_at: string;
    updated_at: string;
}

/*== 生成唯一 8 位站点 ID（小写字母+数字），查库去重，最多重试 5 次 ==*/
export async function generateSiteId(): Promise<string> {
    const db = getDb();
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let attempt = 0; attempt < 5; attempt++) {
        let id = '';
        for (let i = 0; i < 8; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        if (db) {
            const [rows] = await db.execute<RowDataPacket[]>('SELECT id FROM zhijian_track_sites WHERE id = ?', [id]);
            if ((rows as any[]).length === 0) return id;
        } else {
            return id;
        }
    }
    throw new Error('无法生成唯一站点 ID');
}

/*== 获取全部站点（排除已删除） ==*/
export async function listTrackSites(): Promise<TrackSite[]> {
    const db = getDb();
    if (!db) return [];

    const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT * FROM zhijian_track_sites WHERE status != 'deleted' ORDER BY created_at DESC`
    );
    return rows as TrackSite[];
}

/*== 根据 ID 获取单个站点 ==*/
export async function getTrackSiteById(id: string): Promise<TrackSite | null> {
    const db = getDb();
    if (!db) return null;

    const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM zhijian_track_sites WHERE id = ?', [id]);
    return (rows[0] as TrackSite) ?? null;
}

/*== 创建站点（自动生成 ID） ==*/
export async function createTrackSite(data: { name: string; domain: string }): Promise<TrackSite> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const id = await generateSiteId();
    await db.execute('INSERT INTO zhijian_track_sites (id, name, domain) VALUES (?, ?, ?)', [
        id,
        data.name,
        data.domain,
    ]);

    const created = await getTrackSiteById(id);
    return created!;
}

/*== 更新站点 ==*/
export async function updateTrackSite(
    id: string,
    fields: Partial<Pick<TrackSite, 'name' | 'domain' | 'status'>>
): Promise<TrackSite> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const sets: string[] = [];
    const values: unknown[] = [];

    if (fields.name !== undefined) {
        sets.push('name = ?');
        values.push(fields.name);
    }
    if (fields.domain !== undefined) {
        sets.push('domain = ?');
        values.push(fields.domain);
    }
    if (fields.status !== undefined) {
        sets.push('status = ?');
        values.push(fields.status);
    }

    if (sets.length === 0) {
        const existing = await getTrackSiteById(id);
        if (!existing) throw new Error('站点不存在');
        return existing;
    }

    values.push(id);
    await db.execute(`UPDATE zhijian_track_sites SET ${sets.join(', ')} WHERE id = ?`, values);

    const updated = await getTrackSiteById(id);
    return updated!;
}

/*== 删除站点（软删除） ==*/
export async function deleteTrackSite(id: string): Promise<boolean> {
    const db = getDb();
    if (!db) return false;

    const [result] = await db.execute("UPDATE zhijian_track_sites SET status = 'deleted' WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
}
