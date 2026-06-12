'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

import { Pagination } from '@/components/ui/pagination';
import { Tag } from '@/components/ui/tag';
import { formatPostDate } from '@/lib/post-shared';
import type { Post } from '@/lib/post-shared';

import styles from '../page.module.css';

const PAGE_SIZE = 10;

interface BlogListClientProps {
    posts: Post[];
}

/*== 博客列表客户端组件：筛选 + 分页 ==*/
export default function BlogListClient({ posts }: BlogListClientProps) {
    const [category, setCategory] = useState<string>('全部');
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [page, setPage] = useState(1);

    /* 从数据库文章中提取用到的分类和标签 */
    const usedCategories = useMemo(() => {
        const names = new Set(posts.map((p) => p.categoryName).filter(Boolean));
        return ['全部', ...names] as string[];
    }, [posts]);

    const usedTags = useMemo(() => {
        const allTagNames = posts.flatMap((p) => p.tagNames?.map((t) => t.name) ?? []);
        return [...new Set(allTagNames)];
    }, [posts]);

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
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function toggleTag(tag: string) {
        setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
        setPage(1);
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
                            <Link className={styles.listItem} href={`/blog/${post.slug}`} key={post.id}>
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
                        <Pagination current={page} onPageChange={setPage} total={totalPages} />
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
                                        onClick={() => { setCategory(cat); setPage(1); }}
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
