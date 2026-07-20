'use client';

/*============================================================================
  post-management-client — 文章管理列表

  加载并筛选文章列表，提供分页、创建、编辑、删除，
  以及文章内容导出等后台管理操作。
============================================================================*/

import { DownloadIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { Pagination } from '@/components/ui/pagination';
import { PillSelect } from '@/components/ui/pill-select';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { toast } from '@/components/ui/toast';
import { api } from '@/lib/core/http-client';
import { getPageAfterDelete } from '@/lib/core/pagination';
import { APP_ROUTES } from '@/lib/core/site';
import type { AdminPostListItem, AdminPostListResult, AdminPostStatusFilter } from '@/lib/domain/posts';

import styles from './post-management-client.module.css';
import shared from '@/components/modules/admin/admin-shared.module.css';

interface PostManagementClientProps {
    initialData: AdminPostListResult;
    initialFilters: {
        keyword: string;
        page: number;
        pageSize: number;
        status: AdminPostStatusFilter;
    };
}

/*== 后台文章管理：真实 API + 搜索 + 状态筛选 + 删除操作。 ==*/
export default function PostManagementClient({ initialData, initialFilters }: PostManagementClientProps) {
    const [posts, setPosts] = useState(initialData.data);
    const [total, setTotal] = useState(initialData.total);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState(initialFilters.keyword);
    const [status, setStatus] = useState<AdminPostStatusFilter>(initialFilters.status);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(initialFilters.page);
    const [pageSize, setPageSize] = useState(initialFilters.pageSize);
    const skipInitialFetchRef = useRef(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<AdminPostListResult>('/admin/posts', { keyword, page, pageSize, status });
            if (res.code === 0 && res.data) {
                setPosts(res.data.data);
                setTotal(res.data.total);
            }
        } catch {
            toast.error('获取文章列表失败');
        } finally {
            setLoading(false);
        }
    }, [keyword, page, pageSize, status]);

    useEffect(() => {
        if (skipInitialFetchRef.current) {
            skipInitialFetchRef.current = false;
            return;
        }
        fetchData();
    }, [fetchData]);

    /* 从编辑器标签页返回时重新加载列表 */
    useEffect(() => {
        function handleFocus() {
            fetchData();
        }
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchData]);

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;

        setDeleting(deleteTarget.id);
        try {
            const res = await api.delete(`/admin/posts/${deleteTarget.id}`);
            if (res.code === 0) {
                const nextPage = getPageAfterDelete(page, posts.length);
                setPosts((previousPosts) => previousPosts.filter((post) => post.id !== deleteTarget.id));
                setTotal((prev) => prev - 1);
                setDeleteTarget(null);
                toast.success('删除成功');
                if (nextPage !== page) setPage(nextPage);
            } else {
                toast.error(res.message || '删除失败。');
            }
        } catch {
            toast.error('删除请求失败。');
        } finally {
            setDeleting(null);
        }
    }

    async function doExport(postId: number | null) {
        setExporting(true);
        try {
            const url = `/api/admin/posts/export${postId ? `?id=${postId}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || '导出失败');
            }
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `zhijian-export-${new Date().toISOString().slice(0, 10)}.zip`;
            a.click();
            URL.revokeObjectURL(blobUrl);
            toast.success('导出成功');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '导出失败');
        } finally {
            setExporting(false);
        }
    }

    function formatDate(value: string | null): string {
        if (!value) return '-';
        return value.split(' ')[0] || value;
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const columns: DataColumn<AdminPostListItem>[] = [
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
            render: (post) => <span className={shared.mutedCell}>{post.categoryName || '-'}</span>,
        },
        {
            header: '标签',
            hideBelow: 'md',
            render: (post) => (
                <div className={styles.tagList}>
                    {(post.tagNames ?? []).map((t) => (
                        <Tag key={t.id} size="mini">
                            {t.name}
                        </Tag>
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
            header: '操作',
            width: '6rem',
            render: (post) => (
                <div className={shared.actionGroup}>
                    <IconButton
                        href={`${APP_ROUTES.adminPosts}/${post.id}`}
                        icon={<PencilIcon />}
                        size="medium"
                        target="_blank"
                        title="编辑"
                    />
                    <IconButton
                        disabled={exporting}
                        icon={<DownloadIcon />}
                        onClick={() => doExport(post.id)}
                        size="medium"
                        title="导出"
                    />
                    <IconButton
                        disabled={deleting === post.id}
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
            {/* 搜索 + 筛选 + 新建 */}
            <div className={styles.toolbar}>
                <div className={styles.searchRow} role="search" aria-label="搜索文章">
                    <TextInput
                        icon={<SearchIcon />}
                        id="post-search"
                        inputSize="medium"
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(1);
                        }}
                        placeholder="搜索标题或 Slug"
                        value={keyword}
                    />
                    <PillSelect
                        onChange={(v) => {
                            setStatus(v as AdminPostStatusFilter);
                            setPage(1);
                        }}
                        options={[
                            { value: 'all', label: '全部' },
                            { value: 'published', label: '已发布' },
                            { value: 'draft', label: '草稿' },
                        ]}
                        value={status}
                    />
                </div>
                <div className={styles.actions}>
                    <span className={styles.resultCount}>{total} 篇文章</span>
                    <GhostButton
                        asButton
                        disabled={exporting}
                        icon={<DownloadIcon className={shared.btnIcon} />}
                        onClick={() => doExport(null)}
                        size="medium"
                    >
                        {exporting ? '导出中...' : '全部导出'}
                    </GhostButton>
                    <GhostButton
                        asButton
                        disabled={creating}
                        icon={<PlusIcon className={shared.btnIcon} />}
                        onClick={async () => {
                            setCreating(true);
                            try {
                                const res = await api.post<{ id: number }>('/admin/posts', {});
                                if (res.code === 0 && res.data) {
                                    window.open(`${APP_ROUTES.adminPosts}/${res.data.id}`);
                                    fetchData();
                                } else {
                                    toast.error(res.message || '新建文章失败');
                                }
                            } catch {
                                toast.error('新建文章失败');
                            } finally {
                                setCreating(false);
                            }
                        }}
                        size="medium"
                        variant="primary"
                    >
                        {creating ? '创建中...' : '新建文章'}
                    </GhostButton>
                </div>
            </div>

            <DataTable
                columns={columns}
                emptyText={loading ? '加载中...' : '暂无文章'}
                rowKey={(post) => post.id}
                rows={posts}
            />

            <Pagination
                current={page}
                onPageChange={setPage}
                total={totalPages}
                pageSize={pageSize}
                onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                }}
            />

            <ConfirmDialog
                confirmLabel="删除"
                loading={deleting !== null}
                message={`确定要删除文章「${deleteTarget?.title ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                title="确认删除"
            />
        </>
    );
}
