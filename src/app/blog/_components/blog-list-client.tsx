'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ContentImage } from '@/components/site/content-image';
import Dialog from '@/components/ui/dialog';
import { XIcon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { Tag } from '@/components/ui/tag';
import { formatPostDate } from '@/lib/domain/post-shared';
import type { Post } from '@/lib/domain/post-shared';

import styles from '../page.module.css';

interface FilterOption {
    href: string;
    label: string;
    slug: string;
}

interface ActiveFilterChip {
    label: string;
    removeHref: string;
}

interface BlogListClientProps {
    activeCategorySlug?: string;
    activeFilterChips: ActiveFilterChip[];
    activeTagSlugs: string[];
    categoryOptions: FilterOption[];
    currentPage: number;
    paginationHrefs: Record<number, string>;
    posts: Post[];
    tagOptions: FilterOption[];
    totalPages: number;
}

export default function BlogListClient({ activeCategorySlug, activeFilterChips, activeTagSlugs, categoryOptions, currentPage, paginationHrefs, posts, tagOptions, totalPages }: BlogListClientProps) {
    const [filterOpen, setFilterOpen] = useState(false);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const hasFilters = categoryOptions.length > 1 || tagOptions.length > 0;
    const hasActiveFilters = activeFilterChips.length > 0;

    /* 分类是否激活：activeCategorySlug 为空/undefined 时，空字符串 slug（全部）激活 */
    function isCategoryActive(slug: string) {
        if (!activeCategorySlug) return !slug;
        return activeCategorySlug === slug;
    }

    /* 导航到新筛选 URL，带 transition 追踪 */
    function navigateTo(url: string) {
        startTransition(() => {
            router.push(url);
        });
    }

    return (
        <main className={styles.page}>
            {/* 导航加载遮罩 */}
            {isPending ? (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingBar} />
                </div>
            ) : null}

            <div className={styles.pageContent}>
                <header className={styles.pageHeader}>
                    <div className={styles.headerRow}>
                        <div className={styles.headerLeft}>
                            <h1 className={styles.headerTitle}>文章</h1>
                            {hasActiveFilters ? (
                                <div className={styles.activeFilters}>
                                    {activeFilterChips.map((chip, i) => (
                                        <button className={styles.activeFilterChip} onClick={() => navigateTo(chip.removeHref)} key={`${i}-${chip.label}`} type="button">
                                            {chip.label}
                                            <XIcon className={styles.activeFilterClose} />
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                        {hasFilters ? (
                            <button className={styles.filterBtn} onClick={() => setFilterOpen(true)} type="button">
                                筛选
                            </button>
                        ) : null}
                    </div>
                    <Dialog maxWidth="20rem" onClose={() => setFilterOpen(false)} open={filterOpen} title="筛选">
                        <div className={styles.filterDialogBody}>
                            {categoryOptions.length > 1 ? (
                                <div className={styles.filterBlock}>
                                    <h3 className={styles.filterBlockTitle}>分类</h3>
                                    <div className={styles.categories}>
                                        {categoryOptions.map((category) => (
                                            <button
                                                className={`${styles.catBtn} ${isCategoryActive(category.slug) ? styles.catActive : ''}`}
                                                key={category.slug || 'all'}
                                                onClick={() => {
                                                    setFilterOpen(false);
                                                    navigateTo(category.href);
                                                }}
                                                type="button"
                                            >
                                                {category.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {tagOptions.length > 0 ? (
                                <div className={styles.filterBlock}>
                                    <h3 className={styles.filterBlockTitle}>标签</h3>
                                    <div className={styles.tagFilter}>
                                        {tagOptions.map((tag) => (
                                            <button
                                                className={`${styles.tagBtn} ${activeTagSlugs.includes(tag.slug) ? styles.tagActive : ''}`}
                                                key={tag.slug}
                                                onClick={() => {
                                                    setFilterOpen(false);
                                                    navigateTo(tag.href);
                                                }}
                                                type="button"
                                            >
                                                {tag.label}
                                            </button>
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
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <Link className={styles.listItem} href={`/blog/${post.slug}`} key={post.id}>
                                        <div className={styles.itemBody}>
                                            <h2 className={styles.itemTitle}>{post.title}</h2>
                                            <p className={styles.itemSummary}>{post.summary}</p>
                                            <div className={styles.itemMeta}>
                                                {post.categoryName ? <span className={styles.itemCategory}>{post.categoryName}</span> : null}
                                                {post.tagNames && post.tagNames.length > 0 ? (
                                                    <div className={styles.itemTags}>
                                                        {post.tagNames.map((tag) => (
                                                            <Tag key={tag.id} size="mini" variant="outlined">
                                                                {tag.name}
                                                            </Tag>
                                                        ))}
                                                    </div>
                                                ) : null}
                                                <span className={styles.itemDate}>{formatPostDate(post.updatedAt || post.publishedAt)}</span>
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
                                ))
                            ) : (
                                <p style={{ color: 'var(--muted-foreground)', padding: '2rem 0', fontSize: '0.9375rem' }}>没有匹配的文章。</p>
                            )}
                        </div>

                        {totalPages > 1 ? <Pagination current={currentPage} getHref={(page) => paginationHrefs[page] ?? '/blog'} total={totalPages} /> : null}
                    </section>

                    <aside className={styles.sidebar}>
                        {categoryOptions.length > 1 ? (
                            <div className={styles.sidebarCard}>
                                <h3 className={styles.sidebarTitle}>分类</h3>
                                <div className={styles.categories}>
                                    {categoryOptions.map((category) => (
                                        <button
                                            className={`${styles.catBtn} ${isCategoryActive(category.slug) ? styles.catActive : ''}`}
                                            key={category.slug || 'all'}
                                            onClick={() => navigateTo(category.href)}
                                            type="button"
                                        >
                                            {category.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {tagOptions.length > 0 ? (
                            <div className={styles.sidebarCard}>
                                <h3 className={styles.sidebarTitle}>标签</h3>
                                <div className={styles.tagFilter}>
                                    {tagOptions.map((tag) => (
                                        <button
                                            className={`${styles.tagBtn} ${activeTagSlugs.includes(tag.slug) ? styles.tagActive : ''}`}
                                            key={tag.slug}
                                            onClick={() => navigateTo(tag.href)}
                                            type="button"
                                        >
                                            {tag.label}
                                        </button>
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
