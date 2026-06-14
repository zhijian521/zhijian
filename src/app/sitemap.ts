import { getPublishedPosts } from '@/lib/posts';
import { toPostIsoDateTime } from '@/lib/post-shared';
import { SITE_METADATA } from '@/lib/site';

export default async function sitemap() {
    const posts = await getPublishedPosts();

    const blogPosts = posts.map((post) => ({
        url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
        lastModified: toPostIsoDateTime(post.updatedAt || post.publishedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: SITE_METADATA.siteUrl,
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${SITE_METADATA.siteUrl}/blog`,
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        ...blogPosts,
    ];
}
