'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';

import { Pagination } from '@/components/ui/pagination';
import { Tag } from '@/components/ui/tag';
import { formatPostDate } from '@/lib/post-shared';
import type { Post } from '@/lib/post-shared';

import styles from '../page.module.css';

const PAGE_SIZE = 10;

interface BlogListClientProps {
    posts: Post[];
}

/*== 博客列表客户端组件：筛选 + URL 参数分页 + prev/next SEO link ==*/
export default function BlogListClient({ posts }: BlogListClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawPage = Number(searchParams.get('page')) || 1;
    const category = searchParams.get('category') || '全部';

    /* 从数据库文章中提取用到的分类和标签 */
    const usedCategories = useMemo(() => {
        const names = new Set(posts.map((p) => p.categoryName).filter(Boolean));
        return ['全部', ...names] as string[];
    }, [posts]);

    const usedTags = useMemo(() => {
        const allTagNames = posts.flatMap((p) => p.tagNames?.map((t) => t.name) ?? []);
        return [...new Set(allTagNames)];
    }, [posts]);

    const activeTags = useMemo(() => {
        const t = searchParams.get('tags');
        return t ? t.split(',').filter(Boolean) : [];
    }, [searchParams]);

    const filtered = useMemo(() => {
        let result = posts;

        if (category !== '全部') {
            result = result.filter((p) => p.categoryName === category);
        }

        if (activeTags.length > 0) {
            result = result.filter((p) =>
                activeTags.some((t) => p.tagNames?.some((pt) => pt.name === t)),
            );
        }

        return result;
    }, [posts, category, activeTags]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const page = Math.min(Math.max(rawPage, 1), totalPages);
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    /* 统一的 URL 参数更新函数 */
    const updateParams = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === '全部') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }
        const qs = params.toString();
        router.push(qs ? `/blog?${qs}` : '/blog');
    }, [searchParams, router]);

    function handlePageChange(newPage: number) {
        updateParams({ page: newPage > 1 ? String(newPage) : null });
    }

    function handleCategoryChange(cat: string) {
        updateParams({ category: cat !== '全部' ? cat : null, page: null });
    }

    function toggleTag(tag: string) {
        const next = activeTags.includes(tag)
            ? activeTags.filter((t) => t !== tag)
            : [...activeTags, tag];
        updateParams({ tags: next.length > 0 ? next.join(',') : null, page: null });
    }

    return (
        <main className={styles.page}>
            <header className={styles.pageHeader}>
                <h1 className={styles.headerTitle}>文章</h1>
            </header>

            <div className={styles.layout}>
                <section className={styles.main}>
                    <div className={styles.list}>
                        {paged.length > 0 ? paged.map((post) => (
                            <Link className={styles.listItem} href={`/blog/${post.slug}`} key={post.id} prefetch={false}>
                                <div className={styles.itemBody}>
                                    <h2 className={styles.itemTitle}>{post.title}</h2>
                                    <p className={styles.itemSummary}>{post.summary}</p>
                                    <div className={styles.itemMeta}>
                                        {post.categoryName && (
                                            <span className={styles.itemCategory}>{post.categoryName}</span>
                                        )}
                                        {post.tagNames?.map((t) => (
                                            <Tag variant="outlined" size="mini" key={t.id}>{t.name}</Tag>
                                        ))}
                                        <span className={styles.itemDate}>
                                            {formatPostDate(post.publishedAt)}
                                        </span>
                                    </div>
                                </div>
                                {post.coverImage ? (
                                    <div className={styles.itemCover}>
                                        <img alt={post.altText || post.title} src={post.coverImage} />
                                    </div>
                                ) : null}
                            </Link>
                        )) : (
                            <p style={{ color: 'var(--muted-foreground)', padding: '2rem 0', fontSize: '0.9375rem' }}>
                                没有匹配的文章。
                            </p>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <Pagination current={page} onPageChange={handlePageChange} total={totalPages} />
                    )}
                </section>

                <aside className={styles.sidebar}>
                    {usedCategories.length > 1 && (
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sidebarTitle}>分类</h3>
                            <div className={styles.categories}>
                                {usedCategories.map((cat) => (
                                    <button
                                        className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                                        key={cat}
                                        onClick={() => handleCategoryChange(cat)}
                                        type="button"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {usedTags.length > 0 && (
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sidebarTitle}>标签</h3>
                            <div className={styles.tagFilter}>
                                {usedTags.map((tag) => (
                                    <button
                                        className={`${styles.tagBtn} ${activeTags.includes(tag) ? styles.tagActive : ''}`}
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        type="button"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </main>
    );
}
