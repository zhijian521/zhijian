'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { ContentImage } from '@/components/site/content-image';
import { Pagination } from '@/components/ui/pagination';
import { Tag } from '@/components/ui/tag';
import { formatPostDate } from '@/lib/post-shared';
import type { Post } from '@/lib/post-shared';

import styles from '../page.module.css';

interface FilterOption {
    label: string;
    slug: string;
}

interface BlogListClientProps {
    activeCategorySlug: string;
    activeTagSlugs: string[];
    categoryOptions: FilterOption[];
    currentPage: number;
    posts: Post[];
    tagOptions: FilterOption[];
    totalPages: number;
}

export default function BlogListClient({
    activeCategorySlug,
    activeTagSlugs,
    categoryOptions,
    currentPage,
    posts,
    tagOptions,
    totalPages,
}: BlogListClientProps) {
    const activeTagSet = useMemo(() => new Set(activeTagSlugs), [activeTagSlugs]);

    function buildBlogHref(updates: { page?: number | null; category?: string | null; tags?: string[] | null }) {
        const params = new URLSearchParams();
        const nextCategory = updates.category === undefined ? activeCategorySlug : updates.category;
        const nextTags = updates.tags === undefined ? activeTagSlugs : updates.tags;
        const nextPage = updates.page === undefined ? currentPage : updates.page;

        if (nextCategory) {
            params.set('category', nextCategory);
        }

        if (nextTags && nextTags.length > 0) {
            params.set('tags', nextTags.join(','));
        }

        if (nextPage && nextPage > 1) {
            params.set('page', String(nextPage));
        }

        const query = params.toString();
        return query ? `/blog?${query}` : '/blog';
    }

    function buildCategoryHref(categorySlug: string) {
        return buildBlogHref({
            category: categorySlug || null,
            page: null,
        });
    }

    function buildTagHref(tagSlug: string) {
        const nextTags = activeTagSet.has(tagSlug)
            ? activeTagSlugs.filter((activeTag) => activeTag !== tagSlug)
            : [...activeTagSlugs, tagSlug];

        return buildBlogHref({
            tags: nextTags,
            page: null,
        });
    }

    function buildPaginationHref(page: number) {
        return buildBlogHref({ page });
    }

    return (
        <main className={styles.page}>
            <header className={styles.pageHeader}>
                <h1 className={styles.headerTitle}>文章</h1>
            </header>

            <div className={styles.layout}>
                <section className={styles.main}>
                    <div className={styles.list}>
                        {posts.length > 0 ? posts.map((post) => (
                            <Link className={styles.listItem} href={`/blog/${post.slug}`} key={post.id}>
                                <div className={styles.itemBody}>
                                    <h2 className={styles.itemTitle}>{post.title}</h2>
                                    <p className={styles.itemSummary}>{post.summary}</p>
                                    <div className={styles.itemMeta}>
                                        {post.categoryName ? (
                                            <span className={styles.itemCategory}>{post.categoryName}</span>
                                        ) : null}
                                        {post.tagNames?.map((tag) => (
                                            <Tag key={tag.id} size='mini' variant='outlined'>{tag.name}</Tag>
                                        ))}
                                        <span className={styles.itemDate}>{formatPostDate(post.publishedAt)}</span>
                                    </div>
                                </div>
                                {post.coverImage ? (
                                    <div className={styles.itemCover}>
                                        <ContentImage
                                            alt={post.altText || post.title}
                                            sizes='180px'
                                            src={post.coverImage}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ) : null}
                            </Link>
                        )) : (
                            <p style={{ color: 'var(--muted-foreground)', padding: '2rem 0', fontSize: '0.9375rem' }}>
                                没有匹配的文章。
                            </p>
                        )}
                    </div>

                    {totalPages > 1 ? (
                        <Pagination current={currentPage} getHref={buildPaginationHref} total={totalPages} />
                    ) : null}
                </section>

                <aside className={styles.sidebar}>
                    {categoryOptions.length > 1 ? (
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sidebarTitle}>分类</h3>
                            <div className={styles.categories}>
                                {categoryOptions.map((category) => (
                                    <Link
                                        className={`${styles.catBtn} ${activeCategorySlug === category.slug ? styles.catActive : ''}`}
                                        href={buildCategoryHref(category.slug)}
                                        key={category.slug || 'all'}
                                    >
                                        {category.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {tagOptions.length > 0 ? (
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sidebarTitle}>标签</h3>
                            <div className={styles.tagFilter}>
                                {tagOptions.map((tag) => (
                                    <Link
                                        className={`${styles.tagBtn} ${activeTagSet.has(tag.slug) ? styles.tagActive : ''}`}
                                        href={buildTagHref(tag.slug)}
                                        key={tag.slug}
                                    >
                                        {tag.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </aside>
            </div>
        </main>
    );
}
