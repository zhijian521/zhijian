/*============================================================================
  feed.xml — RSS 2.0 Feed

  输出全站已发布文章供 RSS 阅读器订阅。
  路由 /feed.xml，通过根布局 alternates.types 自动发现。
============================================================================*/

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';
import { getPublishedPosts, parsePostDate } from '@/lib/domain/posts';

export async function GET() {
    const posts = await getPublishedPosts();

    const items = posts
        .map((post) => {
            const link = `${SITE_METADATA.siteUrl}/blog/${post.slug}`;
            const pubDate = parsePostDate(post.publishedAt)?.toUTCString();
            const categoryXml = (post.tagNames ?? [])
                .map((tag) => `      <category>${escapeXml(tag.name)}</category>`)
                .join('\n');

            return [
                `    <item>`,
                `      <title><![CDATA[${post.title}]]></title>`,
                `      <link>${link}</link>`,
                `      <guid isPermaLink="true">${link}</guid>`,
                `      <description><![CDATA[${post.summary}]]></description>`,
                pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
                categoryXml,
                `    </item>`,
            ]
                .filter(Boolean)
                .join('\n');
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_METADATA.brandTitle)}</title>
    <link>${SITE_METADATA.siteUrl}</link>
    <description>${escapeXml(SITE_METADATA.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_METADATA.siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}

/*-- XML 特殊字符转义，用于 channel 级 title/description 等非 CDATA 区域 --*/
function escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
