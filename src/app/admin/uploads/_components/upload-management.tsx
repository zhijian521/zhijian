'use client';

import { useState, useEffect, useCallback } from 'react';

import { CheckIcon, CopyIcon, DownloadIcon, PencilIcon, Trash2Icon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextInput } from '@/components/ui/text-input';
import { api } from '@/lib/core/http-client';
import { toast } from '@/components/ui/toast';
import AdminPageHeader from '@/components/modules/admin/admin-page-header/admin-page-header';

import styles from './upload-management.module.css';
import shared from '@/app/admin/_components/admin-shared.module.css';

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

const DEFAULT_PAGE_SIZE = 10;

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

    /* 重命名弹窗 */
    const [renameTarget, setRenameTarget] = useState<UploadItem | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [renaming, setRenaming] = useState(false);

    /* 同步弹窗 */
    const [syncOpen, setSyncOpen] = useState(false);
    const [syncCopied, setSyncCopied] = useState(false);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    /* 加载图片列表 */
    const fetchUploads = useCallback(
        async (p: number) => {
            setLoading(true);
            try {
                const res = await api.get<{ data: UploadItem[]; total: number }>(`/admin/uploads?page=${p}&pageSize=${pageSize}`);
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
        },
        [pageSize]
    );

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

    /* 重命名图片 */
    const handleRename = useCallback(async () => {
        if (!renameTarget || !renameValue.trim()) return;
        setRenaming(true);
        try {
            const res = await api.patch(`/admin/uploads/${renameTarget.id}`, {
                original: renameValue.trim(),
            });
            if (res.code === 0) {
                toast.success('名称已修改');
                setRenameTarget(null);
                fetchUploads(page);
            } else {
                toast.error(res.message || '修改失败');
            }
        } catch {
            toast.error('网络错误');
        } finally {
            setRenaming(false);
        }
    }, [renameTarget, renameValue, page, fetchUploads]);

    return (
        <div className={styles.management}>
            <AdminPageHeader
                description="上传和管理文章图片，支持复制 Markdown 路径和同步到本地开发环境。"
                eyebrow="Uploads"
                tag={`${total} 张图片`}
                title="图片管理"
                action={
                    <GhostButton asButton icon={<DownloadIcon className={shared.btnIcon} />} onClick={() => setSyncOpen(true)} size="small">
                        同步到本地
                    </GhostButton>
                }
            />

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
                                        aria-label="修改名称"
                                        className={styles.iconBtn}
                                        onClick={() => {
                                            setRenameTarget(upload);
                                            setRenameValue(upload.original);
                                        }}
                                        type="button"
                                    >
                                        <PencilIcon className={styles.iconSmall} />
                                    </button>
                                    <button aria-label="复制 Markdown" className={styles.iconBtn} onClick={() => handleCopy(upload)} type="button">
                                        {copiedId === upload.id ? <CheckIcon className={styles.iconSmall} /> : <CopyIcon className={styles.iconSmall} />}
                                    </button>
                                    <button aria-label="删除图片" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setDeleteTarget(upload)} type="button">
                                        <Trash2Icon className={styles.iconSmall} />
                                    </button>
                                </div>
                                {/* eslint-disable-next-line @next/next/no-img-element -- 上传缩略图不走 next/image 优化 */}
                                <img alt={upload.alt || upload.original} className={styles.thumbnail} loading="lazy" src={upload.path} />
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
                            onPageSizeChange={(s) => {
                                setPageSize(s);
                                setPage(1);
                            }}
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

            {/* 同步到本地弹窗 */}
            <Dialog onClose={() => setSyncOpen(false)} open={syncOpen} title="同步到本地">
                <div className={styles.syncBody}>
                    <p className={styles.syncDesc}>
                        将服务器上的图片文件同步到本地 <code className={styles.syncCode}>public/uploads/</code> 目录，用于开发环境预览。
                    </p>
                    <p className={styles.syncStep}>在项目根目录运行以下命令：</p>
                    <div className={styles.syncCmdRow}>
                        <code className={styles.syncCmd}>node src/scripts/sync-uploads.mjs</code>
                        <button
                            aria-label="复制命令"
                            className={styles.syncCopyBtn}
                            onClick={() => {
                                navigator.clipboard.writeText('node src/scripts/sync-uploads.mjs');
                                setSyncCopied(true);
                                setTimeout(() => setSyncCopied(false), 1500);
                            }}
                            type="button"
                        >
                            {syncCopied ? <CheckIcon className={styles.syncCopyIcon} /> : <CopyIcon className={styles.syncCopyIcon} />}
                        </button>
                    </div>
                    <p className={styles.syncHint}>
                        可选参数：<code className={styles.syncCode}>--server &lt;url&gt;</code> 指定服务器地址，
                        <code className={styles.syncCode}>--username</code> / <code className={styles.syncCode}>--password</code> 跳过交互式输入。
                    </p>
                </div>
            </Dialog>

            {/* 重命名弹窗 */}
            <Dialog onClose={() => setRenameTarget(null)} open={renameTarget !== null} title="修改名称">
                <form
                    className={shared.form}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleRename();
                    }}
                >
                    <TextInput id="rename-original" label="文件名" onChange={(e) => setRenameValue(e.target.value)} placeholder="输入新名称" required value={renameValue} />
                    <div className={shared.formActions}>
                        <GhostButton asButton onClick={() => setRenameTarget(null)}>
                            取消
                        </GhostButton>
                        <SubmitButton size="medium" disabled={renaming}>
                            {renaming ? '保存中...' : '保存'}
                        </SubmitButton>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
