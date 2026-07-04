'use client';

import { DownloadIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { Pagination } from '@/components/ui/pagination';
import { PillSelect } from '@/components/ui/pill-select';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { toast } from '@/components/ui/toast';
import AdminPageHeader from '@/components/modules/admin/admin-page-header/admin-page-header';
import { api } from '@/lib/core/http-client';
import { APP_ROUTES } from '@/lib/core/site';

import styles from './post-management-client.module.css';
import shared from '@/app/admin/_components/admin-shared.module.css';

/*== 文章列表项：API 返回的列表数据，不含 content（太重），含分类/标签名称。 ==*/
interface PostListItem {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    categoryName: string | null;
    tagNames: { id: number; name: string; slug: string }[] | null;
    publishedAt: string | null;
    updatedAt: string | null;
}

/*== 后台文章管理：真实 API + 搜索 + 状态筛选 + 删除操作。 ==*/
export default function PostManagementClient() {
    const [posts, setPosts] = useState<PostListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<PostListItem[]>('/admin/posts');
            if (res.code === 0 && res.data) {
                setPosts(res.data);
                // API 不分页，total 直接取数组长度
                setTotal(res.data.length);
            }
        } catch {
            toast.error('获取文章列表失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
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

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const q = keyword.trim().toLowerCase();
            const matchesKeyword = !q || [post.title, post.slug].some((f) => f?.toLowerCase().includes(q));
            const matchesStatus = status === 'all' || post.status === status;
            return matchesKeyword && matchesStatus;
        });
    }, [posts, keyword, status]);

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;

        setDeleting(deleteTarget.id);
        try {
            const res = await api.delete(`/admin/posts/${deleteTarget.id}`);
            if (res.code === 0) {
                setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
                setTotal((prev) => prev - 1);
                setDeleteTarget(null);
                toast.success('删除成功');
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
        } catch (e: any) {
            toast.error(e.message || '导出失败');
        } finally {
            setExporting(false);
        }
    }

    function formatDate(value: string | null): string {
        if (!value) return '-';
        return value.split(' ')[0] || value;
    }

    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
    const pagedPosts = filteredPosts.slice((page - 1) * pageSize, page * pageSize);

    const columns: DataColumn<PostListItem>[] = [
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
                    {post.tagNames?.map((t) => (
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
                    <IconButton href={`${APP_ROUTES.adminPosts}/${post.id}`} icon={<PencilIcon />} size="medium" target="_blank" title="编辑" />
                    <IconButton disabled={exporting} icon={<DownloadIcon />} onClick={() => doExport(post.id)} size="medium" title="导出" />
                    <IconButton disabled={deleting === post.id} icon={<Trash2Icon />} onClick={() => setDeleteTarget({ id: post.id, title: post.title })} size="medium" title="删除" variant="danger" />
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminPageHeader description="集中查看全部文章，支持关键词搜索、状态筛选和快速进入编辑页。" eyebrow="Posts" tag={`${total} 篇文章`} title="文章管理" />

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
                        name="status"
                        onChange={(v) => {
                            setStatus(v as 'all' | 'draft' | 'published');
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
                <GhostButton asButton disabled={exporting} icon={<DownloadIcon className={shared.btnIcon} />} onClick={() => doExport(null)} size="medium">
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

            <DataTable columns={columns} emptyText={loading ? '加载中...' : '暂无文章'} rowKey={(post) => post.id} rows={pagedPosts} />

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
