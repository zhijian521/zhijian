/*============================================================================
  sitemap - sitemap.xml 生成器

  仅包含当前可公开访问的首页、博客列表、导航页和已发布文章。
============================================================================*/

import type { MetadataRoute } from "next";

import { SITE_METADATA } from "@/config/metadata";
import { toPostIsoDateTime } from "@/lib/core/date";
import { getPublishedPostsForDistribution } from "@/lib/domain/post-distribution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getPublishedPostsForDistribution();
    const latestPostDate = posts[0]?.updatedAt ?? posts[0]?.publishedAt;

    return [
        {
            url: SITE_METADATA.siteUrl.toString(),
            lastModified: toPostIsoDateTime(latestPostDate),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: new URL("/blog", SITE_METADATA.siteUrl).toString(),
            lastModified: toPostIsoDateTime(latestPostDate),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: new URL("/nav", SITE_METADATA.siteUrl).toString(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        ...posts.map((post) => ({
            url: new URL(`/blog/${post.slug}`, SITE_METADATA.siteUrl).toString(),
            lastModified: toPostIsoDateTime(post.updatedAt ?? post.publishedAt),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        })),
    ];
}
