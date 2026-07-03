import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { ArticleView } from '@/components/site/article-view';
import { getPostBySlug, getPublishedPosts } from '@/lib/posts';
import { formatPostDate, toPostIsoDateTime } from '@/lib/posts';
import { SITE_METADATA } from '@/lib/site';
import { toAbsoluteUrl } from '@/lib/utils';

import { ArticleFooterActions } from './_components/article-footer-actions';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ slug: string }>;
}

const getBlogPost = cache(async (slug: string) => getPostBySlug(slug));

function estimateReadingMinutes(content: string): number {
    const plainTextLength = content.replace(/\s+/g, '').length;
    return Math.max(1, Math.ceil(plainTextLength / 450));
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const title = post.title;
    const fullTitle = `${title} - ${SITE_METADATA.brandTitle}`;
    const description = post.summary || `${post.title} - ${SITE_METADATA.blogDescription}`;
    const ogImage = toAbsoluteUrl(post.coverImage);
    const canonical = `${SITE_METADATA.siteUrl}/blog/${slug}`;
    const publishedTime = toPostIsoDateTime(post.publishedAt);
    const modifiedTime = toPostIsoDateTime(post.updatedAt);
    const keywords = [...(post.tagNames?.map((tag) => tag.name) ?? []), ...(post.categoryName ? [post.categoryName] : []), ...SITE_METADATA.keywords];

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
            title: fullTitle,
            description,
            url: canonical,
            publishedTime,
            modifiedTime,
            authors: [SITE_METADATA.author],
            section: post.categoryName || undefined,
            tags: post.tagNames?.map((tag) => tag.name),
            ...(ogImage && { images: [{ url: ogImage, alt: post.altText || post.title }] }),
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            ...(ogImage && { images: [{ url: ogImage, alt: post.altText || post.title }] }),
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    /* 相关文章：查同标签文章，排除当前文章，最多 3 篇 */
    const tagSlugs = post.tagNames?.map((t) => t.slug) ?? [];
    const relatedPosts = tagSlugs.length > 0 ? (await getPublishedPosts({ tagSlugs, limit: 5 })).filter((p) => p.id !== post.id).slice(0, 3) : [];

    const canonical = `${SITE_METADATA.siteUrl}/blog/${post.slug}`;
    const articleImage = toAbsoluteUrl(post.coverImage);
    const publishedTime = toPostIsoDateTime(post.publishedAt);
    const modifiedTime = toPostIsoDateTime(post.updatedAt);
    const readingMinutes = estimateReadingMinutes(post.content);
    const wordCount = post.content.trim().length;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${SITE_METADATA.siteUrl}#website`,
                url: SITE_METADATA.siteUrl,
                name: SITE_METADATA.title,
            },
            {
                '@type': 'Person',
                '@id': `${SITE_METADATA.siteUrl}/#about-me`,
                name: SITE_METADATA.author,
                url: `${SITE_METADATA.siteUrl}/#about-me`,
            },
            {
                '@type': 'Organization',
                '@id': `${SITE_METADATA.siteUrl}#publisher`,
                name: SITE_METADATA.title,
                url: SITE_METADATA.siteUrl,
                logo: {
                    '@type': 'ImageObject',
                    url: toAbsoluteUrl('/images/logo.png'),
                },
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${canonical}#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: SITE_METADATA.title,
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
                ...(articleImage && { image: articleImage }),
                datePublished: publishedTime,
                dateModified: modifiedTime,
                author: {
                    '@id': `${SITE_METADATA.siteUrl}/#about-me`,
                },
                publisher: {
                    '@id': `${SITE_METADATA.siteUrl}#publisher`,
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': canonical,
                    isPartOf: {
                        '@id': `${SITE_METADATA.siteUrl}#website`,
                    },
                },
                articleSection: post.categoryName || undefined,
                keywords: post.tagNames?.map((tag) => tag.name).join(', ') || undefined,
                timeRequired: `PT${readingMinutes}M`,
                wordCount,
                inLanguage: 'zh-CN',
            },
        ],
    };

    return (
        <main className={styles.page}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <article className={styles.article}>
                {/* 面包屑导航 */}
                <nav aria-label="面包屑" className={styles.breadcrumb}>
                    <ol className={styles.breadcrumbList}>
                        <li className={styles.breadcrumbItem}>
                            <Link className={styles.breadcrumbLink} href="/">
                                {SITE_METADATA.title}
                            </Link>
                        </li>
                        <li className={styles.breadcrumbItem}>
                            <span className={styles.breadcrumbSep} aria-hidden>
                                /
                            </span>
                            <Link className={styles.breadcrumbLink} href="/blog">
                                文章
                            </Link>
                        </li>
                        <li className={styles.breadcrumbItem}>
                            <span className={styles.breadcrumbSep} aria-hidden>
                                /
                            </span>
                            <span className={styles.breadcrumbCurrent} aria-current="page" title={post.title}>
                                {post.title}
                            </span>
                        </li>
                    </ol>
                </nav>

                <ArticleView
                    altText={post.altText}
                    categoryName={post.categoryName}
                    content={post.content}
                    coverImage={post.coverImage}
                    publishedAt={post.publishedAt}
                    summary={post.summary}
                    tagNames={post.tagNames}
                    title={post.title}
                    updatedAt={post.updatedAt}
                />

                <footer className={styles.footer}>
                    <div className={styles.footerTags}>
                        {post.tagNames?.map((tag) => (
                            <span className={styles.footerTag} key={tag.id}>
                                {tag.name}
                            </span>
                        ))}
                    </div>
                    <ArticleFooterActions />
                </footer>
            </article>

            {/* 相关文章推荐 */}
            {relatedPosts.length > 0 ? (
                <section className={styles.related}>
                    <h2 className={styles.relatedTitle}>相关文章</h2>
                    <div className={styles.relatedGrid}>
                        {relatedPosts.map((rp) => (
                            <Link className={styles.relatedCard} href={`/blog/${rp.slug}`} key={rp.id}>
                                <h3 className={styles.relatedCardTitle}>{rp.title}</h3>
                                {rp.tagNames && rp.tagNames.length > 0 ? (
                                    <div className={styles.relatedCardTags}>
                                        {rp.tagNames.slice(0, 3).map((tag) => (
                                            <span className={styles.relatedCardTag} key={tag.id}>
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                <div className={styles.relatedCardMeta}>
                                    {rp.categoryName ? <span className={styles.relatedCardCategory}>{rp.categoryName}</span> : null}
                                    <span>{formatPostDate(rp.publishedAt)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}
        </main>
    );
}
