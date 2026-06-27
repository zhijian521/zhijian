import { getPublishedPosts } from '@/lib/posts';
import { toPostIsoDateTime } from '@/lib/posts';
import { SITE_METADATA } from '@/lib/site';

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
