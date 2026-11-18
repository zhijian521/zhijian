import type { RowDataPacket } from 'mysql2';
import { getDb } from '../core/db';

/*== 标签类型 ==*/
export interface Tag {
    id: number;
    name: string;
    slug: string;
    created_at: Date;
    updated_at: Date;
}

/*== 获取全部标签（按 id 排序） ==*/
export async function listTags(): Promise<Tag[]> {
    const db = getDb();
    if (!db) return [];

    const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT t.*
         FROM zhijian_blog_tags t
         ORDER BY t.id ASC`
    );
    return rows as Tag[];
}

/*== 根据 ID 获取单个标签 ==*/
export async function getTagById(id: number): Promise<Tag | null> {
    const db = getDb();
    if (!db) return null;

    const [rows] = await db.execute<RowDataPacket[]>('SELECT t.* FROM zhijian_blog_tags t WHERE t.id = ?', [id]);
    return (rows[0] as Tag) ?? null;
}

/*== 创建标签 ==*/
export async function createTag(data: { name: string; slug: string }): Promise<Tag> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const [result] = await db.execute('INSERT INTO zhijian_blog_tags (name, slug) VALUES (?, ?)', [
        data.name,
        data.slug,
    ]);

    const id = (result as any).insertId;
    const created = await getTagById(id);
    return created!;
}

/*== 更新标签 ==*/
export async function updateTag(id: number, fields: Partial<Pick<Tag, 'name' | 'slug'>>): Promise<Tag> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const sets: string[] = [];
    const values: unknown[] = [];

    if (fields.name !== undefined) {
        sets.push('name = ?');
        values.push(fields.name);
    }
    if (fields.slug !== undefined) {
        sets.push('slug = ?');
        values.push(fields.slug);
    }

    if (sets.length === 0) {
        const existing = await getTagById(id);
        if (!existing) throw new Error('标签不存在');
        return existing;
    }

    values.push(id);
    await db.execute(`UPDATE zhijian_blog_tags SET ${sets.join(', ')} WHERE id = ?`, values);

    const updated = await getTagById(id);
    return updated!;
}

/*== 删除标签 ==*/
export async function deleteTag(id: number): Promise<boolean> {
    const db = getDb();
    if (!db) return false;

    const [result] = await db.execute('DELETE FROM zhijian_blog_tags WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
}
