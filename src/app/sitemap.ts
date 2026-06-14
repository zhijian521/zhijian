import { getPublishedPosts } from '@/lib/posts';
import { SITE_METADATA } from '@/lib/site';

function toIsoDate(value: string | null): string | undefined {
    if (!value) {
        return undefined;
    }

    const normalized = value.replace(' ', 'T');
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return date.toISOString();
}

export default async function sitemap() {
    const posts = await getPublishedPosts();

    const blogPosts = posts.map((post) => ({
        url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
        lastModified: toIsoDate(post.updatedAt || post.publishedAt),
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
