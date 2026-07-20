import { unstable_noStore as noStore } from 'next/cache';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

/*== 数据与配置 ==*/
import { getDb } from '@/lib/core/db';
import type { Post, PostStatus } from './post-shared';
export type { Post, PostStatus } from './post-shared';
export {
    formatPostDate,
    formatPostDateTime,
    parsePostDate,
    splitPostContent,
    toDateTimeLocalValue,
    toPostIsoDateTime,
} from './post-shared';

/*== 类型定义 ==*/

/*-- 更新文章的输入参数，由后台编辑表单提交后传入 --*/
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

/*-- 创建新文章的输入参数，仅需提供标题即可生成草稿 --*/
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

/*-- 前台文章列表查询参数：支持分类、标签服务端过滤和数量限制；includeContent 默认 false，列表不查询正文 --*/
export interface PublishedPostFilter {
    categorySlug?: string;
    tagSlugs?: string[];
    limit?: number;
    /*-- 是否查询正文。默认 false，仅导出等确需正文的场景显式开启 --*/
    includeContent?: boolean;
}

export type AdminPostStatusFilter = 'all' | PostStatus;

export interface AdminPostListQuery {
    keyword?: string;
    page?: number;
    pageSize?: number;
    status?: AdminPostStatusFilter;
}

export interface AdminPostListItem {
    id: number;
    slug: string;
    title: string;
    status: PostStatus;
    categoryName: string | null;
    tagNames: { id: number; name: string; slug: string }[];
    publishedAt: string | null;
    updatedAt: string | null;
}

export interface AdminPostListResult {
    data: AdminPostListItem[];
    total: number;
}

/*-- 内部查询选项，统一数据库读取时的条件组合逻辑。includeContent 默认 true，保持单篇与后台读取现状 --*/
interface ReadPostsOptions {
    includeDrafts: boolean;
    id?: number;
    slug?: string;
    categorySlug?: string;
    tagSlugs?: string[];
    limit?: number;
    includeContent?: boolean;
}

/*-- MySQL 查询返回的原始行类型，字段名与数据库列名保持一致 --*/
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
    category_slug: string | null;
    tags: number[] | string | null;
    status: PostStatus;
    published_at: string | null;
    updated_at: string | null;
}

interface AdminPostListRow extends RowDataPacket {
    id: number;
    slug: string;
    title: string;
    category_name: string | null;
    tags: number[] | string | null;
    status: PostStatus;
    published_at: string | null;
    updated_at: string | null;
}

const EMPTY_SUMMARY_FALLBACK = '这篇文章还没有摘要，等你补上一段引导文字。';
const EMPTY_CONTENT_FALLBACK = '这篇文章还没有正文内容。';

/*== 公开查询 ==*/

/*-- 获取已发布文章列表。默认不查询正文（content 为空字符串），需要正文时显式传 includeContent: true --*/
export async function getPublishedPosts(filter: PublishedPostFilter = {}): Promise<Post[]> {
    noStore();
    const posts = await readPostsFromDatabase({
        includeDrafts: false,
        categorySlug: filter.categorySlug,
        tagSlugs: filter.tagSlugs,
        limit: filter.limit,
        includeContent: filter.includeContent === true,
    });
    return enrichPostsWithTagNames(posts);
}

/*-- 分页获取已发布文章列表。SQL 层完成分页且不查询正文，列表与计数并行查询 --*/
export async function listPublishedPostsPage(
    filter: PublishedPostFilter & { page: number; pageSize: number }
): Promise<{ posts: Post[]; total: number }> {
    noStore();
    const db = getDb();
    if (!db) return { posts: [], total: 0 };

    const page = Math.max(1, Math.floor(filter.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(filter.pageSize || 10)));
    const offset = (page - 1) * pageSize;

    const publishedFilter = buildPublishedFilter(filter);
    const conditions = ['p.status = ?', ...publishedFilter.conditions];
    const values: Array<number | string> = ['published', ...publishedFilter.values];
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    try {
        const [[countRows], [rows]] = await Promise.all([
            db.query<RowDataPacket[]>(
                `
                    SELECT COUNT(*) AS total
                    FROM zhijian_blog_posts p
                    LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
                    ${whereClause}
                `,
                values
            ),
            db.query<PostRow[]>(
                `
                    SELECT
                        p.id,
                        p.slug,
                        p.title,
                        p.summary,
                        p.cover_image,
                        p.alt_text,
                        p.category_id,
                        p.tags,
                        p.status,
                        DATE_FORMAT(p.published_at, '%Y-%m-%d %H:%i:%s') AS published_at,
                        DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
                        c.name AS category_name,
                        c.slug AS category_slug
                    FROM zhijian_blog_posts p
                    LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
                    ${whereClause}
                    ORDER BY p.updated_at IS NULL, p.updated_at DESC, p.published_at IS NULL, p.published_at DESC, p.id DESC
                    LIMIT ? OFFSET ?
                `,
                [...values, pageSize, offset]
            ),
        ]);

        const posts = await enrichPostsWithTagNames(rows.map((row) => mapPostRow(row, false)));
        return { posts, total: Number(countRows[0]?.total || 0) };
    } catch (error) {
        console.error('Failed to list published posts page.', { filter, error });
        return { posts: [], total: 0 };
    }
}

/*-- 获取全部文章（含草稿），供后台管理列表使用 --*/
export async function getAllPosts(): Promise<Post[]> {
    noStore();
    const posts = await readPostsFromDatabase({ includeDrafts: true });
    return enrichPostsWithTagNames(posts);
}

/*-- 获取后台文章列表。仅返回列表所需字段，并在数据库层完成筛选和分页。 --*/
export async function listAdminPosts(query: AdminPostListQuery = {}): Promise<AdminPostListResult> {
    noStore();
    const db = getDb();
    if (!db) return { data: [], total: 0 };

    const page = Math.max(1, Math.floor(query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(query.pageSize || 10)));
    const conditions: string[] = [];
    const values: Array<number | string> = [];
    const keyword = query.keyword?.trim();

    if (keyword) {
        conditions.push('(p.title LIKE ? OR p.slug LIKE ?)');
        const likeKeyword = `%${keyword}%`;
        values.push(likeKeyword, likeKeyword);
    }

    if (query.status === 'draft' || query.status === 'published') {
        conditions.push('p.status = ?');
        values.push(query.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    try {
        const [countRows] = await db.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total FROM zhijian_blog_posts p ${whereClause}`,
            values
        );
        const [rows] = await db.execute<AdminPostListRow[]>(
            `
                SELECT
                    p.id,
                    p.slug,
                    p.title,
                    p.tags,
                    p.status,
                    DATE_FORMAT(p.published_at, '%Y-%m-%d %H:%i:%s') AS published_at,
                    DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
                    c.name AS category_name
                FROM zhijian_blog_posts p
                LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
                ${whereClause}
                ORDER BY p.updated_at IS NULL, p.updated_at DESC, p.published_at IS NULL, p.published_at DESC, p.id DESC
                LIMIT ? OFFSET ?
            `,
            [...values, pageSize, offset]
        );
        const tagMap = await getTagNameMap(rows.flatMap((row) => parsePostTags(row.tags)));

        return {
            data: rows.map((row) => {
                const tags = parsePostTags(row.tags);
                return {
                    id: row.id,
                    slug: row.slug,
                    title: row.title,
                    status: row.status,
                    categoryName: row.category_name,
                    tagNames: tags.map((id) => tagMap.get(id)).filter(Boolean) as AdminPostListItem['tagNames'],
                    publishedAt: row.published_at,
                    updatedAt: row.updated_at,
                };
            }),
            total: Number(countRows[0]?.total || 0),
        };
    } catch (error) {
        console.error('Failed to list admin posts.', { query, error });
        return { data: [], total: 0 };
    }
}

/*-- 按 Slug 获取单篇已发布文章，用于前台详情页。未找到时返回 null --*/
export async function getPostBySlug(slug: string): Promise<Post | null> {
    noStore();
    const posts = await readPostsFromDatabase({ includeDrafts: false, slug });
    if (posts.length === 0) return null;
    return (await enrichPostsWithTagNames([posts[0]]))[0] ?? null;
}

/*-- 按 ID 获取单篇文章（含草稿），供后台编辑页使用。未找到时返回 null --*/
export async function getPostById(id: number): Promise<Post | null> {
    noStore();
    const posts = await readPostsFromDatabase({ includeDrafts: true, id });
    if (posts.length === 0) return null;
    return (await enrichPostsWithTagNames([posts[0]]))[0] ?? null;
}

/*== 写入操作 ==*/

/*-- 更新指定文章。采用动态 SET 子句，仅更新传入的字段 --*/
export async function updatePostById(id: number, input: UpdatePostInput): Promise<Post | null> {
    const db = getDb();

    if (!db) {
        return null;
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (input.slug !== undefined) {
        sets.push('slug = ?');
        values.push(input.slug);
    }
    if (input.title !== undefined) {
        sets.push('title = ?');
        values.push(input.title);
    }
    if (input.summary !== undefined) {
        sets.push('summary = ?');
        values.push(input.summary);
    }
    if (input.content !== undefined) {
        sets.push('content = ?');
        values.push(input.content);
    }
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
    if (input.coverImage !== undefined) {
        sets.push('cover_image = ?');
        values.push(input.coverImage);
    }
    if (input.altText !== undefined) {
        sets.push('alt_text = ?');
        values.push(input.altText);
    }
    if (input.categoryId !== undefined) {
        sets.push('category_id = ?');
        values.push(input.categoryId);
    }
    if (input.tags !== undefined) {
        sets.push('tags = ?');
        values.push(JSON.stringify(input.tags));
    }

    if (sets.length === 0) {
        return getPostById(id);
    }

    sets.push('updated_at = NOW()');
    values.push(id);

    try {
        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE zhijian_blog_posts SET ${sets.join(', ')} WHERE id = ?`,
            values
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

/*-- 创建草稿文章。新文章默认先保存为 draft，降低后台误发布风险 --*/
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
            ]
        );

        return getPostById(result.insertId);
    } catch (error) {
        console.error('Failed to create post.', { error });
        return null;
    }
}

/*-- 删除指定文章 --*/
export async function deletePostById(id: number): Promise<boolean> {
    const db = getDb();
    if (!db) return false;
    const [result] = await db.execute<ResultSetHeader>('DELETE FROM zhijian_blog_posts WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

/*== 内部查询 ==*/

/*-- 统一读取文章数据。includeDrafts、slug、id、分类、标签等条件都在这一层组合 --*/
async function readPostsFromDatabase(options: ReadPostsOptions): Promise<Post[]> {
    const db = getDb();

    if (!db) {
        return [];
    }

    const includeContent = options.includeContent !== false;
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

    const publishedFilter = buildPublishedFilter(options);
    conditions.push(...publishedFilter.conditions);
    values.push(...publishedFilter.values);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const withLimit = typeof options.limit === 'number' && options.limit > 0;
    const limitClause = withLimit ? 'LIMIT ?' : '';
    const contentColumn = includeContent ? 'p.content,' : '';

    try {
        const [rows] = await db.query<PostRow[]>(
            `
                SELECT
                    p.id,
                    p.slug,
                    p.title,
                    p.summary,
                    ${contentColumn}
                    p.cover_image,
                    p.alt_text,
                    p.category_id,
                    p.tags,
                    p.status,
                    DATE_FORMAT(p.published_at, '%Y-%m-%d %H:%i:%s') AS published_at,
                    DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
                    c.name AS category_name,
                    c.slug AS category_slug
                FROM zhijian_blog_posts p
                LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
                ${whereClause}
                ORDER BY p.updated_at IS NULL, p.updated_at DESC, p.published_at IS NULL, p.published_at DESC, p.id DESC
                ${limitClause}
            `,
            withLimit ? [...values, Math.floor(options.limit!)] : values
        );

        return rows.map((row) => mapPostRow(row, includeContent));
    } catch (error) {
        console.error('Failed to read zhijian_blog_posts.', { options, error });
        return [];
    }
}

/*-- 构建已发布文章列表的筛选条件（分类 + 标签），列表查询与分页计数共用 --*/
function buildPublishedFilter(filter: { categorySlug?: string; tagSlugs?: string[] }): {
    conditions: string[];
    values: Array<number | string>;
} {
    const conditions: string[] = [];
    const values: Array<number | string> = [];

    if (filter.categorySlug) {
        conditions.push('c.slug = ?');
        values.push(filter.categorySlug);
    }

    if (filter.tagSlugs && filter.tagSlugs.length > 0) {
        conditions.push(`
            EXISTS (
                SELECT 1
                FROM zhijian_blog_tags filter_t
                WHERE filter_t.slug IN (${filter.tagSlugs.map(() => '?').join(', ')})
                    AND JSON_CONTAINS(p.tags, CAST(filter_t.id AS JSON), '$')
            )
        `);
        values.push(...filter.tagSlugs);
    }

    return { conditions, values };
}

/*-- 把数据库行映射为 Post。列表查询不取正文时 content 置为空字符串 --*/
function mapPostRow(row: PostRow, includeContent: boolean): Post {
    const content = includeContent ? row.content?.trim() || EMPTY_CONTENT_FALLBACK : '';

    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary?.trim() || EMPTY_SUMMARY_FALLBACK,
        content,
        coverImage: row.cover_image ?? null,
        altText: row.alt_text ?? null,
        categoryId: row.category_id ?? null,
        categoryName: row.category_name ?? undefined,
        tags: parsePostTags(row.tags),
        status: row.status,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
    };
}

/*-- 批量查询标签名称，拼装到文章的 tagNames 字段中。查询失败时静默回退，不影响文章列表返回 --*/
async function enrichPostsWithTagNames(posts: Post[]): Promise<Post[]> {
    const allTagIds = posts.flatMap((post) => post.tags).filter(Boolean);
    if (allTagIds.length === 0) return posts.map((post) => ({ ...post, tagNames: [] }));

    const tagMap = await getTagNameMap(allTagIds);
    if (tagMap.size === 0) return posts.map((post) => ({ ...post, tagNames: [] }));

    return posts.map((post) => ({
        ...post,
        tagNames: post.tags.map((id) => tagMap.get(id)).filter(Boolean) as {
            id: number;
            name: string;
            slug: string;
        }[],
    }));
}

async function getTagNameMap(tagIds: number[]): Promise<Map<number, { id: number; name: string; slug: string }>> {
    const uniqueIds = [...new Set(tagIds)];
    if (uniqueIds.length === 0) return new Map();

    const db = getDb();
    if (!db) return new Map();

    try {
        const [tagRows] = await db.execute<RowDataPacket[]>(
            `SELECT id, name, slug FROM zhijian_blog_tags WHERE id IN (${uniqueIds.map(() => '?').join(', ')})`,
            uniqueIds
        );

        const tagMap = new Map<number, { id: number; name: string; slug: string }>();
        for (const row of tagRows) {
            tagMap.set(row.id, { id: row.id, name: row.name, slug: row.slug });
        }

        return tagMap;
    } catch (error) {
        console.error('Failed to enrich posts with tag names.', { error });
        return new Map();
    }
}

function parsePostTags(value: number[] | string | null): number[] {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
        const tags = JSON.parse(value) as unknown;
        return Array.isArray(tags) && tags.every(Number.isInteger) ? tags : [];
    } catch {
        return [];
    }
}

/*== 内部工具 ==*/

/*-- 判断值是否为合法的文章发布状态 --*/
export function isPostStatus(value: unknown): value is PostStatus {
    return value === 'draft' || value === 'published';
}

/*-- 根据文章状态规范化发布时间 --*/
function normalizePublishedAt(value: string | null, status: PostStatus): string | null {
    if (!value && status === 'draft') return null;
    if (!value && status === 'published') return formatSqlDate(new Date());
    const normalized = (value as string).replace('T', ' ');
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) return normalized;
    return normalized + ':00';
}

/*-- 把 JS Date 格式化成 MySQL DATETIME 字符串（本地时间） --*/
function formatSqlDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/*-- 从 Markdown 正文中提取所有 /uploads/ 图片路径并去重 --*/
export function extractImagePaths(content: string): string[] {
    const regex = /!\[.*?\]\((\/uploads\/[^\s)]+)\)/g;
    const paths: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        paths.push(match[1]);
    }
    return [...new Set(paths)];
}
