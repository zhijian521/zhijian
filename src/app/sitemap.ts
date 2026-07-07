/*============================================================================
  sitemap — sitemap.xml 生成器

  Next.js 文件约定，构建时自动生成 /sitemap.xml。
  包含首页、博客列表页、所有已发布文章，按 priority 分层。
============================================================================*/

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';
import { getPublishedPosts, toPostIsoDateTime } from '@/lib/domain/posts';

export default async function sitemap() {
    const posts = await getPublishedPosts();
    const latestPostDate = posts[0]?.updatedAt || posts[0]?.publishedAt;

    const blogPosts = posts.map((post) => ({
        url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
        lastModified: toPostIsoDateTime(post.updatedAt || post.publishedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: SITE_METADATA.siteUrl,
            lastModified: toPostIsoDateTime(latestPostDate),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${SITE_METADATA.siteUrl}/blog`,
            lastModified: toPostIsoDateTime(latestPostDate),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        ...blogPosts,
    ];
}
