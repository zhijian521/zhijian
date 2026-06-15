'use client';

import { useState, useEffect, useCallback } from 'react';

import { CheckIcon, CopyIcon, Trash2Icon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { api } from '@/lib/http-client';
import { toast } from '@/components/ui/toast';

import styles from './upload-management.module.css';

interface UploadItem {
    id: number;
    filename: string;
    original: string;
    path: string;
    size: number;
    mime: string;
    alt: string;
    createdAt: string;
}

const DEFAULT_PAGE_SIZE = 20;

/*== 格式化文件大小 ==*/
function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/*== UploadManagement 图片管理页面组件 ==*/
export default function UploadManagement() {
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    /* 删除确认弹窗 */
    const [deleteTarget, setDeleteTarget] = useState<UploadItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    /* 加载图片列表 */
    const fetchUploads = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await api.get<{ data: UploadItem[]; total: number }>(
                `/admin/uploads?page=${p}&pageSize=${pageSize}`,
            );
            if (res.code === 0 && res.data) {
                setUploads(res.data.data);
                setTotal(res.data.total);
            } else {
                toast.error(res.message || '获取图片列表失败');
            }
        } catch {
            toast.error('网络错误');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchUploads(page);
    }, [page, fetchUploads]);

    /* 复制 Markdown */
    const handleCopy = useCallback(async (upload: UploadItem) => {
        const markdown = `![](${upload.path})`;
        try {
            await navigator.clipboard.writeText(markdown);
            setCopiedId(upload.id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            toast.error('复制失败');
        }
    }, []);

    /* 删除图片 */
    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await api.delete(`/admin/uploads/${deleteTarget.id}`);
            if (res.code === 0) {
                toast.success('图片已删除');
                setDeleteTarget(null);
                fetchUploads(page);
            } else {
                toast.error(res.message || '删除失败');
            }
        } catch {
            toast.error('网络错误');
        } finally {
            setDeleting(false);
        }
    }, [deleteTarget, page, fetchUploads]);

    return (
        <div className={styles.management}>
            <div className={styles.header}>
                <h1 className={styles.title}>图片管理</h1>
                <span className={styles.total}>共 {total} 张</span>
            </div>

            {loading ? (
                <div className={styles.empty}>加载中...</div>
            ) : uploads.length === 0 ? (
                <div className={styles.empty}>暂无图片，上传后将在此显示。</div>
            ) : (
                <>
                    <div className={styles.grid}>
                        {uploads.map((upload) => (
                            <div className={styles.card} key={upload.id}>
                                <div className={styles.cardActions}>
                                    <button
                                        aria-label="复制 Markdown"
                                        className={styles.iconBtn}
                                        onClick={() => handleCopy(upload)}
                                        type="button"
                                    >
                                        {copiedId === upload.id
                                            ? <CheckIcon className={styles.iconSmall} />
                                            : <CopyIcon className={styles.iconSmall} />
                                        }
                                    </button>
                                    <button
                                        aria-label="删除图片"
                                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                        onClick={() => setDeleteTarget(upload)}
                                        type="button"
                                    >
                                        <Trash2Icon className={styles.iconSmall} />
                                    </button>
                                </div>
                                <img
                                    alt={upload.alt || upload.original}
                                    className={styles.thumbnail}
                                    loading="lazy"
                                    src={upload.path}
                                />
                                <div className={styles.info}>
                                    <span className={styles.filename} title={upload.original}>
                                        {upload.original}
                                    </span>
                                    <span className={styles.meta}>
                                        {formatSize(upload.size)} · {upload.createdAt}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.paginationWrap}>
                        <Pagination
                            current={page}
                            onPageChange={setPage}
                            total={totalPages}
                            pageSize={pageSize}
                            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                        />
                    </div>
                </>
            )}

            {/* 删除确认弹窗 */}
            <ConfirmDialog
                cancelLabel="取消"
                confirmLabel="删除"
                loading={deleting}
                message={`确定要删除图片「${deleteTarget?.original ?? ''}」吗？删除后无法恢复。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                open={deleteTarget !== null}
                title="删除图片"
            />
        </div>
    );
}