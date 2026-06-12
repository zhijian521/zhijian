import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getPublishedPosts } from '@/lib/posts';
import { SITE_METADATA } from '@/lib/site';

import BlogListClient from './_components/blog-list-client';
import styles from './page.module.css';

const BLOG_DESCRIPTION = '浏览知简的所有博客文章，涵盖技术、思考与生活。';

/*== 列表页 metadata：支持分页参数 + prev/next ==*/
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
    const { page } = await searchParams;
    const pageNum = Number(page) || 1;
    const titleSuffix = pageNum > 1 ? ` (第${pageNum}页)` : '';

    /* 计算分页数以确定是否有 next */
    const posts = await getPublishedPosts();
    const totalPages = Math.max(1, Math.ceil(posts.length / 10));

    return {
        title: `文章${titleSuffix}`,
        description: BLOG_DESCRIPTION,
        alternates: {
            canonical: pageNum > 1 ? `/blog?page=${pageNum}` : '/blog',
            ...(pageNum > 1 && { prev: pageNum > 2 ? `/blog?page=${pageNum - 1}` : '/blog' }),
            ...(pageNum < totalPages && { next: `/blog?page=${pageNum + 1}` }),
        },
        openGraph: {
            title: `文章${titleSuffix}`,
            description: BLOG_DESCRIPTION,
            url: pageNum > 1 ? `/blog?page=${pageNum}` : '/blog',
        },
    };
}

export const revalidate = 60;

/*== 博客列表页：服务端查库，客户端筛选 ==*/
export default async function BlogListPage() {
    const posts = await getPublishedPosts();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `${SITE_METADATA.title} 文章`,
        description: BLOG_DESCRIPTION,
        url: `${SITE_METADATA.siteUrl}/blog`,
        publisher: {
            '@type': 'Person',
            name: SITE_METADATA.title,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={<main className={styles.page}><p style={{ color: 'var(--muted-foreground)', padding: '2rem' }}>加载中...</p></main>}>
                <BlogListClient posts={posts} />
            </Suspense>
        </>
    );
}
