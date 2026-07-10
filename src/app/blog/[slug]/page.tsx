/*============================================================================
  page — 博客详情页

  服务端组件，按 slug 获取文章，渲染面包屑 + ArticleView + 底部标签 + 相关推荐。
  服务端生成 metadata（title/description/OG/JSON-LD）。
============================================================================*/

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

/*== 组件导入 ==*/
import { Show } from '@/components/ui/show';
import { ArticleFooter } from '@/components/site/article-footer';
import { ArticleView } from '@/components/site/article-view';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { RelatedPosts } from '@/components/modules/blog/related-posts';

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';
import { toAbsoluteUrl } from '@/lib/core/utils';
import { getPostBySlug, getPublishedPosts, toPostIsoDateTime } from '@/lib/domain/posts';

/*== 样式导入 ==*/
import styles from './page.module.css';

/*== 类型定义 ==*/
interface PageProps {
    params: Promise<{ slug: string }>;
}

/*== 数据获取（cache 包裹，generateMetadata 与 render 共享查询） ==*/
const getBlogPost = cache(async (slug: string) => getPostBySlug(slug));

/*== 工具函数 ==*/
function estimateReadingMinutes(content: string): number {
    const plainTextLength = content.replace(/\s+/g, '').length;
    return Math.max(1, Math.ceil(plainTextLength / 450));
}

export const dynamic = 'force-dynamic';

/*== generateMetadata — 服务端生成 SEO 元数据 ==*/
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

/*== BlogPostPage — 服务端渲染：面包屑 + 正文 + 标签 + 相关推荐 ==*/
export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    /*-- 相关文章：查同标签文章，排除当前文章，最多 3 篇 --*/
    const tagSlugs = post.tagNames?.map((t) => t.slug) ?? [];
    const relatedPosts =
        tagSlugs.length > 0
            ? (await getPublishedPosts({ tagSlugs, limit: 5 })).filter((p) => p.id !== post.id).slice(0, 3)
            : [];

    /*-- 元数据预计算 --*/
    const canonical = `${SITE_METADATA.siteUrl}/blog/${post.slug}`;
    const articleImage = toAbsoluteUrl(post.coverImage);
    const publishedTime = toPostIsoDateTime(post.publishedAt);
    const modifiedTime = toPostIsoDateTime(post.updatedAt);
    const readingMinutes = estimateReadingMinutes(post.content);
    const wordCount = post.content.trim().length;

    /*-- JSON-LD 结构化数据 --*/
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
            <div className="bg-overlay" />
            {/*-- JSON-LD 结构化数据 --*/}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <article className={styles.article}>
                {/*-- 面包屑导航 --*/}
                <Breadcrumb
                    items={[
                        { label: SITE_METADATA.title, href: '/' },
                        { label: '文章', href: '/blog' },
                        { label: post.title },
                    ]}
                />

                {/*-- 文章正文 --*/}
                <ArticleView post={post} />

                {/*-- 底部：标签 + 操作按钮 --*/}
                <ArticleFooter post={post} />
            </article>

            {/* 相关文章推荐 */}
            <Show when={relatedPosts.length > 0}>
                <RelatedPosts posts={relatedPosts} />
            </Show>
        </main>
    );
}
