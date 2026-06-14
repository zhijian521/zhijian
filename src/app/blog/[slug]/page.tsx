import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleView } from '@/components/site/article-view';
import { getPostBySlug } from '@/lib/posts';
import { SITE_METADATA } from '@/lib/site';
import { ArticleFooterActions } from './_components/article-footer-actions';

import styles from './page.module.css';

interface PageProps {
    params: Promise<{ slug: string }>;
}

/*== 文章详情依赖数据库实时内容，禁用 ISR 与构建期预渲染，避免部署后先展示旧文章快照。 ==*/
export const dynamic = 'force-dynamic';

/*== 详情页 metadata：每篇文章独立的 title/description/OG/canonical ==*/
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) notFound();

    const title = post.title;
    const description = post.summary || `${post.title} — ${SITE_METADATA.title}`;
    const ogImage = post.coverImage || undefined;

    return {
        title,
        description,
        alternates: { canonical: `/blog/${slug}` },
        openGraph: {
            type: 'article',
            title,
            description,
            url: `/blog/${slug}`,
            publishedTime: post.publishedAt || undefined,
            authors: [SITE_METADATA.title],
            tags: post.tagNames?.map((t) => t.name),
            ...(ogImage && { images: [{ url: ogImage, alt: post.altText || title }] }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(ogImage && { images: [{ url: ogImage, alt: post.altText || title }] }),
        },
    };
}

/*== 博客详情页：从数据库读取文章，复用 ArticleView 组件 ==*/
export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.summary,
        ...(post.coverImage && { image: `${SITE_METADATA.siteUrl}${post.coverImage}` }),
        datePublished: post.publishedAt || undefined,
        dateModified: post.updatedAt || undefined,
        author: {
            '@type': 'Person',
            name: SITE_METADATA.title,
        },
        publisher: {
            '@type': 'Person',
            name: SITE_METADATA.title,
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
        },
    };

    return (
        <main className={styles.page}>
            <script
                type="application/ld+json"
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

                {/* 文章底部 */}
                <footer className={styles.footer}>
                    <div className={styles.footerTags}>
                        {post.tagNames?.map((t) => (
                            <span className={styles.footerTag} key={t.id}>{t.name}</span>
                        ))}
                    </div>
                    <ArticleFooterActions />
                </footer>
            </article>
        </main>
    );
}
