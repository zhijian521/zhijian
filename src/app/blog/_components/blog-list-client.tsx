'use client';

import { useState } from 'react';
import Link from 'next/link';

import { ContentImage } from '@/components/site/content-image';
import Dialog from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { Tag } from '@/components/ui/tag';
import { formatPostDate } from '@/lib/post-shared';
import type { Post } from '@/lib/post-shared';

import styles from '../page.module.css';

interface FilterOption {
    href: string;
    label: string;
    slug: string;
}

interface BlogListClientProps {
    activeCategorySlug: string;
    activeTagSlugs: string[];
    categoryOptions: FilterOption[];
    currentPage: number;
    paginationHrefs: Record<number, string>;
    posts: Post[];
    tagOptions: FilterOption[];
    totalPages: number;
}

export default function BlogListClient({
    activeCategorySlug,
    activeTagSlugs,
    categoryOptions,
    currentPage,
    paginationHrefs,
    posts,
    tagOptions,
    totalPages,
}: BlogListClientProps) {
    const activeTagSet = new Set(activeTagSlugs);
    const [filterOpen, setFilterOpen] = useState(false);
    const hasFilters = categoryOptions.length > 1 || tagOptions.length > 0;

    return (
        <main className={styles.page}>
            <div className={styles.pageContent}>
                <header className={styles.pageHeader}>
                    <div className={styles.headerRow}>
                        <h1 className={styles.headerTitle}>文章</h1>
                    {hasFilters ? (
                        <button
                            className={styles.filterBtn}
                            onClick={() => setFilterOpen(true)}
                            type="button"
                        >
                            筛选
                        </button>
                    ) : null}
                </div>
                <Dialog
                    maxWidth="20rem"
                    onClose={() => setFilterOpen(false)}
                    open={filterOpen}
                    title="筛选"
                >
                    <div className={styles.filterDialogBody}>
                        {categoryOptions.length > 1 ? (
                            <div className={styles.filterBlock}>
                                <h3 className={styles.filterBlockTitle}>分类</h3>
                                <div className={styles.categories}>
                                    {categoryOptions.map((category) => (
                                        <Link
                                            className={`${styles.catBtn} ${activeCategorySlug === category.slug ? styles.catActive : ''}`}
                                            href={category.href}
                                            key={category.slug || 'all'}
                                            onClick={() => setFilterOpen(false)}
                                        >
                                            {category.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {tagOptions.length > 0 ? (
                            <div className={styles.filterBlock}>
                                <h3 className={styles.filterBlockTitle}>标签</h3>
                                <div className={styles.tagFilter}>
                                    {tagOptions.map((tag) => (
                                        <Link
                                            className={`${styles.tagBtn} ${activeTagSet.has(tag.slug) ? styles.tagActive : ''}`}
                                            href={tag.href}
                                            key={tag.slug}
                                            onClick={() => setFilterOpen(false)}
                                        >
                                            {tag.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </Dialog>
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
                                            {post.tagNames && post.tagNames.length > 0 ? (
                                                <div className={styles.itemTags}>
                                                    {post.tagNames.map((tag) => (
                                                        <Tag key={tag.id} size='mini' variant='outlined'>{tag.name}</Tag>
                                                    ))}
                                                </div>
                                            ) : null}
                                            <span className={styles.itemDate}>{formatPostDate(post.publishedAt)}</span>
                                        </div>
                                    </div>
                                    {post.coverImage ? (
                                        <div className={styles.itemCover}>
                                            <ContentImage
                                                alt={post.altText || post.title}
                                                sizes="(max-width: 640px) 100vw, 180px"
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
                            <Pagination current={currentPage} getHref={(page) => paginationHrefs[page] ?? '/blog'} total={totalPages} />
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
                                            href={category.href}
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
                                            href={tag.href}
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
            </div>
        </main>
    );
}
