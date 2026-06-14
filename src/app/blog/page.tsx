import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getPublishedPosts } from '@/lib/posts';
import { SITE_METADATA } from '@/lib/site';

import BlogListClient from './_components/blog-list-client';
import styles from './page.module.css';

const BLOG_DESCRIPTION = SITE_METADATA.blogDescription;

/*== 列表页 metadata：支持分页参数 + prev/next。 ==*/
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const { page } = await searchParams;
    const pageNum = Number(page) || 1;
    const pageTitle = pageNum > 1
        ? `${SITE_METADATA.blogTitle} 第${pageNum}页 - ${SITE_METADATA.title}`
        : `${SITE_METADATA.blogTitle} - ${SITE_METADATA.title}`;
    const pageDescription = pageNum > 1
        ? `${BLOG_DESCRIPTION} 当前为第${pageNum}页。`
        : BLOG_DESCRIPTION;

    const posts = await getPublishedPosts();
    const totalPages = Math.max(1, Math.ceil(posts.length / 10));

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: [...SITE_METADATA.keywords],
        authors: [{ name: SITE_METADATA.author }],
        creator: SITE_METADATA.author,
        publisher: SITE_METADATA.author,
        alternates: {
            canonical: pageNum > 1 ? `${SITE_METADATA.siteUrl}/blog?page=${pageNum}` : `${SITE_METADATA.siteUrl}/blog`,
            ...(pageNum > 1 && { prev: pageNum > 2 ? `/blog?page=${pageNum - 1}` : '/blog' }),
            ...(pageNum < totalPages && { next: `/blog?page=${pageNum + 1}` }),
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: pageNum > 1 ? `${SITE_METADATA.siteUrl}/blog?page=${pageNum}` : `${SITE_METADATA.siteUrl}/blog`,
            images: [{ url: SITE_METADATA.ogImage, alt: SITE_METADATA.blogTitle }],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            images: [SITE_METADATA.ogImage],
        },
    };
}

/*== 博客列表依赖实时文章数据，禁用 ISR，避免部署后先命中构建期缓存。 ==*/
export const dynamic = 'force-dynamic';

/*== 博客列表页：服务端查库，客户端筛选。 ==*/
export default async function BlogListPage() {
    const posts = await getPublishedPosts();
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${SITE_METADATA.siteUrl}/blog#page`,
                url: `${SITE_METADATA.siteUrl}/blog`,
                name: `${SITE_METADATA.blogTitle} - ${SITE_METADATA.title}`,
                description: BLOG_DESCRIPTION,
                inLanguage: 'zh-CN',
            },
            {
                '@type': 'ItemList',
                '@id': `${SITE_METADATA.siteUrl}/blog#list`,
                name: `${SITE_METADATA.blogTitle}列表`,
                itemListOrder: 'https://schema.org/ItemListOrderDescending',
                numberOfItems: posts.length,
                itemListElement: posts.map((post, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
                    name: post.title,
                    description: post.summary,
                })),
            },
        ],
    };

    return (
        <>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={<main className={styles.page}><p style={{ color: 'var(--muted-foreground)', padding: '2rem' }}>加载中...</p></main>}>
                <BlogListClient posts={posts} />
            </Suspense>
        </>
    );
}
