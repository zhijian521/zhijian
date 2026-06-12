import { SITE_METADATA } from '@/lib/site';
import { getPublishedPosts } from '@/lib/posts';

export default async function sitemap() {
    const posts = await getPublishedPosts();

    const blogPosts = posts.map((post) => ({
        url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
        lastModified: (post.updatedAt || post.publishedAt)?.replace(' ', 'T') || undefined,
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
