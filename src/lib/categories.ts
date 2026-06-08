import type { RowDataPacket } from 'mysql2';
import { getDb } from '@/lib/db';

/*== 分类类型 ==*/
export interface Category {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}

/*== 获取全部分类（按 sort_order 排序） ==*/
export async function listCategories(): Promise<Category[]> {
    const db = getDb();
    if (!db) return [];

    const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT c.*
         FROM zhijian_blog_categories c
         ORDER BY c.sort_order ASC, c.id ASC`,
    );
    return rows as Category[];
}

/*== 根据 ID 获取单个分类 ==*/
export async function getCategoryById(id: number): Promise<Category | null> {
    const db = getDb();
    if (!db) return null;

    const [rows] = await db.execute<RowDataPacket[]>(
        'SELECT c.* FROM zhijian_blog_categories c WHERE c.id = ?',
        [id],
    );
    return (rows[0] as Category) ?? null;
}

/*== 创建分类 ==*/
export async function createCategory(data: { name: string; slug: string; sort_order: number }): Promise<Category> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const [result] = await db.execute(
        'INSERT INTO zhijian_blog_categories (name, slug, sort_order) VALUES (?, ?, ?)',
        [data.name, data.slug, data.sort_order],
    );

    const id = (result as any).insertId;
    const created = await getCategoryById(id);
    return created!;
}

/*== 更新分类 ==*/
export async function updateCategory(
    id: number,
    fields: Partial<Pick<Category, 'name' | 'slug' | 'sort_order'>>,
): Promise<Category> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const sets: string[] = [];
    const values: unknown[] = [];

    if (fields.name !== undefined) { sets.push('name = ?'); values.push(fields.name); }
    if (fields.slug !== undefined) { sets.push('slug = ?'); values.push(fields.slug); }
    if (fields.sort_order !== undefined) { sets.push('sort_order = ?'); values.push(fields.sort_order); }

    if (sets.length === 0) {
        const existing = await getCategoryById(id);
        if (!existing) throw new Error('分类不存在');
        return existing;
    }

    values.push(id);
    await db.execute(`UPDATE zhijian_blog_categories SET ${sets.join(', ')} WHERE id = ?`, values);

    const updated = await getCategoryById(id);
    return updated!;
}

/*== 删除分类 ==*/
export async function deleteCategory(id: number): Promise<boolean> {
    const db = getDb();
    if (!db) return false;

    const [result] = await db.execute('DELETE FROM zhijian_blog_categories WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
}
