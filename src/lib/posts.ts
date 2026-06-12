import { getDb } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

import type { Post, PostStatus } from '@/lib/post-shared';

/*== 类型定义 ==*/

/*== 更新文章的输入参数，由后台编辑表单提交后传入。 ==*/
export interface UpdatePostInput {
    slug?: string;
    title?: string;
    summary?: string;
    content?: string;
    status?: PostStatus;
    publishedAt?: string | null;
    coverImage?: string | null;
    altText?: string | null;
    categoryId?: number | null;
    tags?: number[];
}

/*== 创建新文章的输入参数，仅需提供标题即可生成草稿。 ==*/
export interface CreatePostInput {
    slug: string;
    title: string;
    summary: string;
    content: string;
    coverImage?: string | null;
    altText?: string | null;
    categoryId?: number | null;
    tags?: number[];
}

/*== 内部查询选项，统一数据库读取时的条件组合逻辑。 ==*/
interface ReadPostsOptions {
    includeDrafts: boolean;
    id?: number;
    slug?: string;
}

/*== MySQL 查询返回的原始行类型，字段名与数据库列名保持一致。 ==*/
interface PostRow extends RowDataPacket {
    id: number;
    slug: string;
    title: string;
    summary: string | null;
    content: string | null;
    cover_image: string | null;
    alt_text: string | null;
    category_id: number | null;
    category_name: string | null;
    tags: number[] | string | null; // mysql2 可能自动解析为数组，也可能是 JSON 字符串或 null
    status: PostStatus;
    published_at: string | null;
    updated_at: string | null;
}

/*== 数据库摘要字段为空时的占位文案。 ==*/
const EMPTY_SUMMARY_FALLBACK = '这篇文章还没有摘要，等你补上一段引导文字。';
/*== 数据库正文字段为空时的占位文案。 ==*/
const EMPTY_CONTENT_FALLBACK = '这篇文章还没有正文内容。';

/*== 公开查询 ==*/

/*== 获取已发布文章列表。 ==*/
export async function getPublishedPosts(): Promise<Post[]> {
    const posts = await readPostsFromDatabase({ includeDrafts: false });
    return enrichPostsWithTagNames(posts);
}

/*== 获取全部文章（含草稿），供后台管理列表使用。 ==*/
export async function getAllPosts(): Promise<Post[]> {
    const posts = await readPostsFromDatabase({ includeDrafts: true });
    return enrichPostsWithTagNames(posts);
}

/*== 按 Slug 获取单篇已发布文章，用于前台详情页。 @param slug - 文章的唯一标识符 @returns 匹配的文章，未找到时返回 null ==*/
export async function getPostBySlug(slug: string): Promise<Post | null> {
    const posts = await readPostsFromDatabase({ includeDrafts: false, slug });
    return posts[0] ?? null;
}

/*== 按 ID 获取单篇文章（含草稿），供后台编辑页使用。 @param id - 文章主键 ID @returns 匹配的文章，未找到时返回 null ==*/
export async function getPostById(id: number): Promise<Post | null> {
    const posts = await readPostsFromDatabase({ includeDrafts: true, id });
    return posts[0] ?? null;
}

/*== 写入操作 ==*/

/*== 更新指定文章。 采用动态 SET 子句，仅更新传入的字段。 ==*/
export async function updatePostById(id: number, input: UpdatePostInput): Promise<Post | null> {
    const db = getDb();

    if (!db) {
        return null;
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (input.slug !== undefined) { sets.push('slug = ?'); values.push(input.slug); }
    if (input.title !== undefined) { sets.push('title = ?'); values.push(input.title); }
    if (input.summary !== undefined) { sets.push('summary = ?'); values.push(input.summary); }
    if (input.content !== undefined) { sets.push('content = ?'); values.push(input.content); }
    if (input.status !== undefined) {
        sets.push('status = ?');
        values.push(input.status);
        const publishedAt = normalizePublishedAt(input.publishedAt ?? null, input.status);
        sets.push('published_at = ?');
        values.push(publishedAt);
    } else if (input.publishedAt !== undefined) {
        sets.push('published_at = ?');
        values.push(input.publishedAt);
    }
    if (input.coverImage !== undefined) { sets.push('cover_image = ?'); values.push(input.coverImage); }
    if (input.altText !== undefined) { sets.push('alt_text = ?'); values.push(input.altText); }
    if (input.categoryId !== undefined) { sets.push('category_id = ?'); values.push(input.categoryId); }
    if (input.tags !== undefined) { sets.push('tags = ?'); values.push(JSON.stringify(input.tags)); }

    if (sets.length === 0) {
        return getPostById(id);
    }

    sets.push('updated_at = NOW()');
    values.push(id);

    try {
        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE zhijian_blog_posts SET ${sets.join(', ')} WHERE id = ?`,
            values,
        );

        if (result.affectedRows === 0) {
            return null;
        }

        return getPostById(id);
    } catch (error) {
        console.error('Failed to update post.', { id, error });
        return null;
    }
}

/*== 创建草稿文章。 新文章默认先保存为 draft，降低后台误发布风险。 ==*/
export async function createPost(input: CreatePostInput): Promise<Post | null> {
    const db = getDb();

    if (!db) {
        return null;
    }

    try {
        const [result] = await db.execute<ResultSetHeader>(
            `
                INSERT INTO zhijian_blog_posts
                    (slug, title, summary, content, cover_image, alt_text, category_id, tags, status, published_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NULL, NOW(), NOW())
            `,
            [
                input.slug,
                input.title,
                input.summary,
                input.content,
                input.coverImage ?? null,
                input.altText ?? null,
                input.categoryId ?? null,
                input.tags ? JSON.stringify(input.tags) : null,
            ],
        );

        return getPostById(result.insertId);
    } catch (error) {
        console.error('Failed to create post.', { error });
        return null;
    }
}

/*== 删除指定文章。 ==*/
export async function deletePostById(id: number): Promise<boolean> {
    const db = getDb();
    if (!db) return false;
    const [result] = await db.execute<ResultSetHeader>(
        'DELETE FROM zhijian_blog_posts WHERE id = ?',
        [id],
    );
    return result.affectedRows > 0;
}

/*== 内部查询 ==*/

/*== 统一读取文章数据。 includeDrafts、slug、id 等条件都在这一层组合，避免查询逻辑散落到多个 route 中。 ==*/
async function readPostsFromDatabase(options: ReadPostsOptions): Promise<Post[]> {
    const db = getDb();

    if (!db) {
        return [];
    }

    const conditions: string[] = [];
    const values: Array<number | string> = [];

    if (!options.includeDrafts) {
        conditions.push('p.status = ?');
        values.push('published');
    }

    if (typeof options.id === 'number') {
        conditions.push('p.id = ?');
        values.push(options.id);
    }

    if (options.slug) {
        conditions.push('p.slug = ?');
        values.push(options.slug);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
        const [rows] = await db.query<PostRow[]>(
            `
                SELECT
                    p.id,
                    p.slug,
                    p.title,
                    p.summary,
                    p.content,
                    p.cover_image,
                    p.alt_text,
                    p.category_id,
                    p.tags,
                    p.status,
                    DATE_FORMAT(p.published_at, '%Y-%m-%d %H:%i:%s') AS published_at,
                    DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
                    c.name as category_name
                FROM zhijian_blog_posts p
                LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
                ${whereClause}
                ORDER BY p.published_at IS NULL, p.published_at DESC, p.id DESC
            `,
            values,
        );

        return rows.map((row) => {
            let tags: number[] = [];
            if (Array.isArray(row.tags)) {
                // mysql2 自动将 JSON 列解析为 JS 数组
                tags = row.tags;
            } else if (row.tags) {
                try {
                    tags = JSON.parse(row.tags as string);
                } catch {
                    tags = [];
                }
            }
            return {
                id: row.id,
                slug: row.slug,
                title: row.title,
                summary: row.summary?.trim() || EMPTY_SUMMARY_FALLBACK,
                content: row.content?.trim() || EMPTY_CONTENT_FALLBACK,
                coverImage: row.cover_image ?? null,
                altText: row.alt_text ?? null,
                categoryId: row.category_id ?? null,
                categoryName: row.category_name ?? undefined,
                tags,
                status: row.status,
                publishedAt: row.published_at,
                updatedAt: row.updated_at,
            };
        });
    } catch (error) {
        console.error('Failed to read zhijian_blog_posts.', { options, error });
        return [];
    }
}

/*== 批量查询标签名称，拼装到文章的 tagNames 字段上。查询失败时静默回退，不影响文章列表返回。 ==*/
async function enrichPostsWithTagNames(posts: Post[]): Promise<Post[]> {
    const allTagIds = posts.flatMap((p) => p.tags).filter(Boolean);
    if (allTagIds.length === 0) return posts;

    const uniqueIds = [...new Set(allTagIds)];
    const db = getDb();
    if (!db) return posts;

    try {
        const [tagRows] = await db.execute<RowDataPacket[]>(
            `SELECT id, name, slug FROM zhijian_blog_tags WHERE id IN (${uniqueIds.map(() => '?').join(', ')})`,
            uniqueIds,
        );

        const tagMap = new Map<number, { id: number; name: string; slug: string }>();
        for (const row of tagRows) {
            tagMap.set(row.id, { id: row.id, name: row.name, slug: row.slug });
        }

        return posts.map((p) => ({
            ...p,
            tagNames: p.tags.map((id) => tagMap.get(id)).filter(Boolean) as { id: number; name: string; slug: string }[],
        }));
    } catch (error) {
        console.error('Failed to enrich posts with tag names.', { error });
        return posts;
    }
}

/*== 内部工具 ==*/

/*== 判断值是否为合法的文章发布状态。 ==*/
export function isPostStatus(value: unknown): value is PostStatus {
    return value === 'draft' || value === 'published';
}

/*== 根据文章状态规范化发布时间。 ==*/
function normalizePublishedAt(value: string | null, status: PostStatus): string | null {
    if (!value && status === 'draft') return null;
    if (!value && status === 'published') return formatSqlDate(new Date());
    // value 可能来自 datetime-local（YYYY-MM-DDTHH:mm）或数据库（YYYY-MM-DD HH:mm:ss）
    const normalized = value!.replace('T', ' ');
    // 已包含秒数（数据库格式），直接使用
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) {
        return normalized;
    }
    // datetime-local 格式，补充秒数
    return normalized + ':00';
}

/*== 把 JS Date 格式化成 MySQL DATETIME 字符串。 ==*/
function formatSqlDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
