/*============================================================================
  post-distribution - 公开文章分发数据

  RSS 与 Sitemap 只读取已发布文章的公开字段，不携带 Markdown 正文。
============================================================================*/

import "server-only";

import { unstable_cache } from "next/cache";
import type { RowDataPacket } from "mysql2";
import type { Pool } from "mysql2/promise";

import { getDb } from "@/lib/core/db";
import { ServiceUnavailableError } from "@/lib/core/errors";
import type { PostFilterOption, PublishedPostDistribution } from "@/types/post";

import { PUBLISHED_POSTS_CACHE_SECONDS } from "./posts";

const MAX_POST_TAGS = 20;

interface DistributionPostRow extends RowDataPacket {
    slug: string;
    title: string;
    summary: string | null;
    published_at: string | null;
    updated_at: string | null;
    tags: number[] | string | null;
}

interface PostTagRow extends RowDataPacket {
    id: number;
    name: string;
    slug: string;
}

/*== RSS 与 Sitemap 使用同一份缓存，避免各自重复读取文章和标签 ==*/
export const getPublishedPostsForDistribution = unstable_cache(queryPublishedPostsForDistribution, [
    "published-post-distribution",
], {
    revalidate: PUBLISHED_POSTS_CACHE_SECONDS,
    tags: ["published-post-distribution"],
});

async function queryPublishedPostsForDistribution(): Promise<PublishedPostDistribution[]> {
    const db = getDb();

    if (!db) {
        throw new ServiceUnavailableError();
    }

    try {
        const [rows] = await db.execute<DistributionPostRow[]>(`
            SELECT
                p.slug,
                p.title,
                p.summary,
                DATE_FORMAT(p.published_at, '%Y-%m-%d %H:%i:%s') AS published_at,
                DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
                p.tags
            FROM zhijian_blog_posts p
            WHERE p.status = ?
            ORDER BY p.updated_at DESC, p.published_at DESC, p.id DESC
        `, ["published"]);

        const tagsByPost = await getPostTags(db, rows.map((row) => parseTagIds(row.tags)));

        return rows.map((row, index) => ({
            slug: row.slug,
            title: row.title,
            summary: row.summary,
            publishedAt: row.published_at,
            updatedAt: row.updated_at,
            tags: tagsByPost[index],
        }));
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

/*== 批量补充标签名称，保持文章顺序并避免每篇文章单独查库 ==*/
async function getPostTags(db: Pool, postTagIds: number[][]): Promise<PostFilterOption[][]> {
    const tagIds = [...new Set(postTagIds.flat())];

    if (tagIds.length === 0) {
        return postTagIds.map(() => []);
    }

    const [rows] = await db.execute<PostTagRow[]>(
        `SELECT id, name, slug FROM zhijian_blog_tags WHERE id IN (${tagIds.map(() => "?").join(", ")})`,
        tagIds,
    );
    const tagsById = new Map(rows.map((tag) => [tag.id, { name: tag.name, slug: tag.slug }]));

    return postTagIds.map((ids) => ids.flatMap((id) => {
        const tag = tagsById.get(id);
        return tag ? [tag] : [];
    }));
}

/*== 标签 JSON 来自后台字段，分发层只接受有限的正整数 ID ==*/
function parseTagIds(value: number[] | string | null): number[] {
    let rawValue: unknown = value;

    if (typeof value === "string") {
        try {
            rawValue = JSON.parse(value);
        } catch {
            return [];
        }
    }

    if (!Array.isArray(rawValue)) {
        return [];
    }

    const ids = new Set<number>();

    for (const value of rawValue) {
        if (!Number.isSafeInteger(value) || value < 1) {
            continue;
        }

        ids.add(value);

        if (ids.size === MAX_POST_TAGS) {
            break;
        }
    }

    return [...ids];
}
