'use client';

import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import { useMemo, useState } from 'react';

import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { Pagination } from '@/components/ui/pagination';
import { PillSelect } from '@/components/ui/pill-select';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { toast } from '@/components/ui/toast';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { MOCK_POSTS, type MockPost } from '@/lib/mock-data';
import { APP_ROUTES } from '@/lib/site';

import styles from './post-management-client.module.css';
import shared from '@/app/admin/_components/admin-shared.module.css';

/*== 后台文章管理：静态数据 + 搜索 + 状态筛选 + 删除操作。 ==*/
export default function PostManagementClient() {
    const [posts, setPosts] = useState<MockPost[]>([...MOCK_POSTS]);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

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
        toast.success('删除成功');
        setDeleteTarget(null);
    }

    function formatDate(value: string | null): string {
        if (!value) return '-';
        return value.split(' ')[0] || value;
    }

    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
    const pagedPosts = filteredPosts.slice((page - 1) * pageSize, page * pageSize);

    const columns: DataColumn<MockPost>[] = [
        {
            header: '文章',
            render: (post) => (
                <>
                    <p className={styles.postTitle}>{post.title}</p>
                    <p className={styles.postSlug}>{post.slug}</p>
                </>
            ),
        },
        {
            header: '状态',
            render: (post) => (
                <Tag size="mini" variant={post.status === 'published' ? 'primary' : 'default'}>
                    {post.status === 'published' ? '已发布' : '草稿'}
                </Tag>
            ),
        },
        {
            header: '分类',
            hideBelow: 'md',
            render: (post) => <span className={shared.mutedCell}>{post.category}</span>,
        },
        {
            header: '标签',
            hideBelow: 'md',
            render: (post) => (
                <div className={styles.tagList}>
                    {post.tags.map((t) => (
                        <Tag key={t} size="mini">{t}</Tag>
                    ))}
                </div>
            ),
        },
        {
            header: '发布时间',
            hideBelow: 'lg',
            render: (post) => <span className={shared.mutedCell}>{formatDate(post.publishedAt)}</span>,
        },
        {
            header: '更新时间',
            hideBelow: 'lg',
            render: (post) => <span className={shared.mutedCell}>{formatDate(post.updatedAt)}</span>,
        },
        {
            header: '操作',
            width: '6rem',
            render: (post) => (
                <div className={shared.actionGroup}>
                    <IconButton
                        href={`${APP_ROUTES.adminPosts}/${post.id}`}
                        icon={<PencilIcon />}
                        size="medium"
                        title="编辑"
                    />
                    <IconButton
                        icon={<Trash2Icon />}
                        onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                        size="medium"
                        title="删除"
                        variant="danger"
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminPageHeader
                description='集中查看全部文章，支持关键词搜索、状态筛选和快速进入编辑页。'
                eyebrow='Posts'
                tag={`${posts.length} 篇文章`}
                title='文章管理'
            />

            {/* 搜索 + 筛选 + 新建 */}
            <div className={styles.toolbar}>
                <div className={styles.searchRow} role="search" aria-label="搜索文章">
                    <TextInput
                        icon={<SearchIcon />}
                        id='post-search'
                        inputSize='medium'
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder='搜索标题、Slug 或摘要'
                        value={keyword}
                    />
                    <PillSelect
                        name='status'
                        onChange={(v) => setStatus(v as 'all' | 'draft' | 'published')}
                        options={[
                            { value: 'all', label: '全部' },
                            { value: 'published', label: '已发布' },
                            { value: 'draft', label: '草稿' },
                        ]}
                        value={status}
                    />
                </div>
                <GhostButton
                    asButton
                    icon={<PlusIcon className={shared.btnIcon} />}
                    onClick={() => { /* TODO: navigate to create page */ }}
                    size='medium'
                    variant='primary'
                >
                    新建文章
                </GhostButton>
            </div>

            <DataTable
                columns={columns}
                emptyText='暂无文章'
                rowKey={(post) => post.id}
                rows={pagedPosts}
            />

            <Pagination current={page} onPageChange={setPage} total={totalPages} />

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
