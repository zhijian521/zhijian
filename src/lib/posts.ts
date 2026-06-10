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
    tags: string | null; // JSON 字符串
    status: PostStatus;
    published_at: string | null;
    updated_at: string | null;
}

/*== 默认数据 ==*/

/*== 数据库摘要字段为空时的占位文案。 ==*/
const EMPTY_SUMMARY_FALLBACK = '这篇文章还没有摘要，等你补上一段引导文字。';
/*== 数据库正文字段为空时的占位文案。 ==*/
const EMPTY_CONTENT_FALLBACK = '这篇文章还没有正文内容。';

/*== 数据库未连接时，页面仍可使用这组示例数据预览结构与样式。 ==*/
const FALLBACK_POSTS: Post[] = [
    {
        id: 1,
        slug: 'build-a-next-fullstack-personal-site',
        title: '先把博客搭起来，再把它长成你的个人网站',
        summary: '用 Next.js 自带的页面、接口和服务端能力，先把博客做好，后续再接备忘录、导航和作品页。',
        content: [
            '对个人网站来说，最核心的是内容持续发布，而不是一开始就把系统拆得很重。',
            '把博客、后台管理和接口放进同一个 Next.js 项目里，开发和部署路径都会更短，也更适合个人长期维护。',
            '等博客稳定后，再逐步补充备忘录、导航首页、项目陈列和关于页，会比一开始铺太大更从容。',
        ].join('\n\n'),
        coverImage: null,
        altText: null,
        categoryId: null,
        tags: [],
        status: 'published',
        publishedAt: '2026-05-24 09:30:00',
        updatedAt: '2026-05-24 09:30:00',
    },
    {
        id: 2,
        slug: 'why-self-hosted-admin-can-be-simpler',
        title: '为什么个人站的后台，自己做反而更轻',
        summary: '内容模型稳定时，自己做一个轻后台，通常会比引入额外 CMS 更贴近需求，也更方便部署。',
        content: [
            '博客后台最常见的需求就是登录、查看文章、修改文章和发布状态控制，这些能力并不复杂。',
            '当页面结构、字段模型和权限边界都很清晰时，直接在 Next.js 里封装接口，会有更高的掌控感。',
            '这样后续扩展新模块时，也可以继续沿用同一套页面、接口和数据库连接方式，不需要维护两套系统。',
        ].join('\n\n'),
        coverImage: null,
        altText: null,
        categoryId: null,
        tags: [],
        status: 'published',
        publishedAt: '2026-05-20 20:15:00',
        updatedAt: '2026-05-20 20:15:00',
    },
];

/*== 公开查询 ==*/

/*== 获取已发布文章列表。 数据库无数据时回退到内置示例数据，保证页面始终可渲染。 ==*/
export async function getPublishedPosts(): Promise<Post[]> {
    const zhijian_blog_posts = await readPostsFromDatabase({ includeDrafts: false });

    if (zhijian_blog_posts.length > 0) {
        return zhijian_blog_posts;
    }

    return FALLBACK_POSTS.filter((post) => post.status === 'published');
}

/*== 获取全部文章（含草稿），供后台管理列表使用。 数据库无数据时回退到完整示例数据。 ==*/
export async function getAllPosts(): Promise<Post[]> {
    const zhijian_blog_posts = await readPostsFromDatabase({ includeDrafts: true });

    if (zhijian_blog_posts.length > 0) {
        return zhijian_blog_posts;
    }

    return FALLBACK_POSTS;
}

/*== 按 Slug 获取单篇已发布文章，用于前台详情页。 @param slug - 文章的唯一标识符 @returns 匹配的文章，未找到时返回 null ==*/
export async function getPostBySlug(slug: string): Promise<Post | null> {
    const zhijian_blog_posts = await readPostsFromDatabase({ includeDrafts: false, slug });

    if (zhijian_blog_posts.length > 0) {
        return zhijian_blog_posts[0] ?? null;
    }

    return FALLBACK_POSTS.find((post) => post.slug === slug && post.status === 'published') ?? null;
}

/*== 按 ID 获取单篇文章（含草稿），供后台编辑页使用。 @param id - 文章主键 ID @returns 匹配的文章，未找到时返回 null ==*/
export async function getPostById(id: number): Promise<Post | null> {
    const zhijian_blog_posts = await readPostsFromDatabase({ includeDrafts: true, id });

    if (zhijian_blog_posts.length > 0) {
        return zhijian_blog_posts[0] ?? null;
    }

    return FALLBACK_POSTS.find((post) => post.id === id) ?? null;
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
        conditions.push('status = ?');
        values.push('published');
    }

    if (typeof options.id === 'number') {
        conditions.push('id = ?');
        values.push(options.id);
    }

    if (options.slug) {
        conditions.push('slug = ?');
        values.push(options.slug);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
        const [rows] = await db.query<PostRow[]>(
            `
                SELECT
                    id,
                    slug,
                    title,
                    summary,
                    content,
                    cover_image,
                    alt_text,
                    category_id,
                    tags,
                    status,
                    DATE_FORMAT(published_at, '%Y-%m-%d %H:%i:%s') AS published_at,
                    DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
                FROM zhijian_blog_posts
                ${whereClause}
                ORDER BY published_at IS NULL, published_at DESC, id DESC
            `,
            values,
        );

        return rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            title: row.title,
            summary: row.summary?.trim() || EMPTY_SUMMARY_FALLBACK,
            content: row.content?.trim() || EMPTY_CONTENT_FALLBACK,
            coverImage: row.cover_image ?? null,
            altText: row.alt_text ?? null,
            categoryId: row.category_id ?? null,
            tags: row.tags ? JSON.parse(row.tags) : [],
            status: row.status,
            publishedAt: row.published_at,
            updatedAt: row.updated_at,
        }));
    } catch (error) {
        console.error('Failed to read zhijian_blog_posts.', { options, error });
        return [];
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
    // 此时 value 必不为 null（status ∈ {draft, published} 已全覆盖）
    return value!.replace('T', ' ') + ':00';
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
