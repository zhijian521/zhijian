import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { ArticleView } from '@/components/site/article-view';
import { getPostBySlug } from '@/lib/posts';
import { SITE_METADATA } from '@/lib/site';

import { ArticleFooterActions } from './_components/article-footer-actions';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ slug: string }>;
}

const getBlogPost = cache(async (slug: string) => getPostBySlug(slug));

/*== 文章详情依赖数据库实时内容，禁用 ISR 与构建期预渲染，避免部署后先展示旧文章快照。 ==*/
export const dynamic = 'force-dynamic';

/*== 详情页 metadata：每篇文章独立的 title/description/OG/canonical。 ==*/
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const title = `${post.title} - ${SITE_METADATA.title}`;
    const description = post.summary || `${post.title} - ${SITE_METADATA.blogDescription}`;
    const ogImage = post.coverImage || undefined;
    const canonical = `${SITE_METADATA.siteUrl}/blog/${slug}`;
    const keywords = [
        ...(post.tagNames?.map((tag) => tag.name) ?? []),
        ...(post.categoryName ? [post.categoryName] : []),
        ...SITE_METADATA.keywords,
    ];

    return {
        title,
        description,
        keywords,
        authors: [{ name: SITE_METADATA.author }],
        creator: SITE_METADATA.author,
        publisher: SITE_METADATA.author,
        alternates: {
            canonical,
        },
        openGraph: {
            type: 'article',
            title,
            description,
            url: canonical,
            publishedTime: post.publishedAt || undefined,
            modifiedTime: post.updatedAt || undefined,
            authors: [SITE_METADATA.author],
            section: post.categoryName || undefined,
            tags: post.tagNames?.map((tag) => tag.name),
            ...(ogImage && { images: [{ url: ogImage, alt: post.altText || post.title }] }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(ogImage && { images: [{ url: ogImage, alt: post.altText || post.title }] }),
        },
    };
}

/*== 博客详情页：从数据库读取文章，复用 ArticleView 组件。 ==*/
export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const canonical = `${SITE_METADATA.siteUrl}/blog/${post.slug}`;
    const wordCount = post.content.trim().length;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                '@id': `${canonical}#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: '首页',
                        item: SITE_METADATA.siteUrl,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: '文章',
                        item: `${SITE_METADATA.siteUrl}/blog`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: post.title,
                        item: canonical,
                    },
                ],
            },
            {
                '@type': 'BlogPosting',
                '@id': `${canonical}#article`,
                headline: post.title,
                description: post.summary,
                ...(post.coverImage && { image: `${SITE_METADATA.siteUrl}${post.coverImage}` }),
                datePublished: post.publishedAt || undefined,
                dateModified: post.updatedAt || undefined,
                author: {
                    '@type': 'Person',
                    name: SITE_METADATA.author,
                },
                publisher: {
                    '@type': 'Person',
                    name: SITE_METADATA.author,
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': canonical,
                },
                articleSection: post.categoryName || undefined,
                keywords: post.tagNames?.map((tag) => tag.name).join(', ') || undefined,
                wordCount,
                inLanguage: 'zh-CN',
            },
        ],
    };

    return (
        <main className={styles.page}>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article className={styles.article}>
                <ArticleView
                    altText={post.altText}
                    categoryName={post.categoryName}
                    content={post.content}
                    coverImage={post.coverImage}
                    publishedAt={post.publishedAt}
                    summary={post.summary}
                    tagNames={post.tagNames}
                    title={post.title}
                />

                <footer className={styles.footer}>
                    <div className={styles.footerTags}>
                        {post.tagNames?.map((tag) => (
                            <span className={styles.footerTag} key={tag.id}>{tag.name}</span>
                        ))}
                    </div>
                    <ArticleFooterActions />
                </footer>
            </article>
        </main>
    );
}
