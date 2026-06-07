'use client';

import Link from 'next/link';
import { PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import { useMemo, useState } from 'react';

import ConfirmDialog from '@/components/ui/confirm-dialog';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { MOCK_POSTS, type MockPost } from '@/lib/mock-data';
import { APP_ROUTES } from '@/lib/site';
import styles from './post-management-client.module.css';

function cn(...classes: (string | false | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}

/*== 后台文章管理：静态数据 + 搜索 + 状态筛选 + 删除操作。 ==*/
export default function PostManagementClient() {
    const [posts, setPosts] = useState<MockPost[]>([...MOCK_POSTS]);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const q = keyword.trim().toLowerCase();
            const matchesKeyword = !q || [post.title, post.slug, post.summary].some((f) => f.toLowerCase().includes(q));
            const matchesStatus = status === 'all' || post.status === status;
            return matchesKeyword && matchesStatus;
        });
    }, [posts, keyword, status]);

    function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
    }

    function formatDate(value: string | null): string {
        if (!value) return '-';
        return value.split(' ')[0] || value;
    }

    return (
        <>
            <AdminPageHeader
                action={
                    <Link className={styles.createLink} href={APP_ROUTES.adminPostCreate}>
                        <PlusIcon className={styles.iconSmall} />
                        新建文章
                    </Link>
                }
                description='集中查看全部文章，支持关键词搜索、状态筛选和快速进入编辑页。'
                eyebrow='Posts'
                tag={`${posts.length} 篇文章`}
                title='文章管理'
            />

            {/* 搜索 + 筛选 */}
            <div className={styles.toolbar}>
                <div className={styles.searchWrapper}>
                    <SearchIcon className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder='搜索标题、Slug 或摘要'
                        type='text'
                        value={keyword}
                    />
                </div>
                <div className={styles.filterTabs}>
                    {(['all', 'published', 'draft'] as const).map((s) => (
                        <button
                            className={cn(styles.filterTab, status === s && styles.filterTabActive)}
                            key={s}
                            onClick={() => setStatus(s)}
                            type='button'
                        >
                            {s === 'all' ? '全部' : s === 'published' ? '已发布' : '草稿'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 表格 */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.thead}>
                            <th className={styles.th}>文章</th>
                            <th className={styles.th}>状态</th>
                            <th className={cn(styles.th, styles.hideMd)}>分类</th>
                            <th className={cn(styles.th, styles.hideMd)}>标签</th>
                            <th className={cn(styles.th, styles.hideLg)}>发布时间</th>
                            <th className={cn(styles.th, styles.hideLg)}>更新时间</th>
                            <th className={styles.thAction}>操作</th>
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {filteredPosts.map((post) => (
                            <tr key={post.id}>
                                <td className={styles.td}>
                                    <p className={styles.postTitle}>{post.title}</p>
                                    <p className={styles.postSlug}>{post.slug}</p>
                                </td>
                                <td className={styles.td}>
                                    <span className={cn(styles.badge, post.status === 'published' ? styles.badgePublished : styles.badgeDraft)}>
                                        {post.status === 'published' ? '已发布' : '草稿'}
                                    </span>
                                </td>
                                <td className={cn(styles.tdMuted, styles.hideMd)}>{post.category}</td>
                                <td className={cn(styles.td, styles.hideMd)}>
                                    <div className={styles.tagList}>
                                        {post.tags.map((t) => (
                                            <span className={styles.miniTag} key={t}>{t}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className={cn(styles.tdMuted, styles.hideLg)}>{formatDate(post.publishedAt)}</td>
                                <td className={cn(styles.tdMuted, styles.hideLg)}>{formatDate(post.updatedAt)}</td>
                                <td className={styles.tdAction}>
                                    <Link className={styles.editLink} href={`${APP_ROUTES.adminPosts}/${post.id}`}>编辑</Link>
                                    <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ id: post.id, title: post.title })} title='删除' type='button'>
                                        <Trash2Icon className={styles.iconSmall} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                confirmLabel='删除'
                message={`确定要删除文章「${deleteTarget?.title ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                title='确认删除'
            />
        </>
    );
}
