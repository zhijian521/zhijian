/*============================================================================
  feed.xml - RSS 2.0 文章订阅

  只输出已发布文章的摘要和站内详情链接，不暴露 Markdown 正文。
============================================================================*/

import { SITE_METADATA } from "@/config/metadata";
import { getErrorLogContext, isServiceUnavailableError } from "@/lib/core/errors";
import { getPublishedPostsForDistribution } from "@/lib/domain/post-distribution";
import type { PublishedPostDistribution } from "@/types/post";

/*== MySQL 驱动依赖 Node.js 运行时 ==*/
export const runtime = "nodejs";

export async function GET(): Promise<Response> {
    try {
        const posts = await getPublishedPostsForDistribution();
        const latestDate = posts[0]?.updatedAt ?? posts[0]?.publishedAt;
        const items = posts.map(toRssItem).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_METADATA.brandTitle)}</title>
    <link>${escapeXml(SITE_METADATA.siteUrl.toString())}</link>
    <description>${escapeXml(SITE_METADATA.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${toRssDate(latestDate) ?? new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(getFeedUrl())}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

        return new Response(xml, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                "Content-Type": "application/rss+xml; charset=utf-8",
            },
        });
    } catch (error) {
        if (isServiceUnavailableError(error)) {
            console.error("RSS 暂不可用：", getErrorLogContext(error));
            return new Response("RSS 暂不可用，请稍后再试。", {
                headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
                status: 503,
            });
        }

        throw error;
    }
}

function toRssItem(post: PublishedPostDistribution): string {
    const url = getPostUrl(post.slug);
    const categories = post.tags.map((tag) => `      <category>${escapeXml(tag.name)}</category>`).join("\n");
    const publishedDate = toRssDate(post.publishedAt);

    return [
        "    <item>",
        `      <title>${escapeCdata(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <description>${escapeCdata(post.summary ?? "")}</description>`,
        ...(publishedDate ? [`      <pubDate>${publishedDate}</pubDate>`] : []),
        ...(categories ? [categories] : []),
        "    </item>",
    ].join("\n");
}

function getPostUrl(slug: string): string {
    return new URL(`/blog/${slug}`, SITE_METADATA.siteUrl).toString();
}

function getFeedUrl(): string {
    return new URL("/feed.xml", SITE_METADATA.siteUrl).toString();
}

function toRssDate(value: string | null | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    const date = new Date(`${value.replace(" ", "T")}+08:00`);
    return Number.isNaN(date.getTime()) ? undefined : date.toUTCString();
}

function escapeCdata(value: string): string {
    return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function escapeXml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}
