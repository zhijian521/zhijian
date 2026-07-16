'use client';

/*============================================================================
  site-management — 统计站点管理

  管理统计站点的创建、编辑、启停和删除，
  同时提供埋点接入代码的生成、展示与复制。
============================================================================*/

import { useEffect, useState, useCallback } from 'react';

import { PencilIcon, PlusIcon, Trash2Icon, CopyIcon, PauseIcon, PlayIcon } from '@/components/ui/icons';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { SubmitButton } from '@/components/ui/submit-button';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { toast } from '@/components/ui/toast';
import { getEmbedScript } from '@/lib/core/utils';
import AdminPageHeader from '@/components/modules/admin/page-header';
import { api } from '@/lib/core/http-client';
import type { ListData } from '@/lib/core/api-response';
import type { TrackSite } from '@/lib/domain/track-sites';

import styles from './site-management.module.css';
import shared from '@/components/modules/admin/admin-shared.module.css';

/*== 站点管理 ==*/
export default function SiteManagement() {
    const [data, setData] = useState<ListData<TrackSite>>({ data: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    /* 弹窗表单状态 */
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingSite, setEditingSite] = useState<TrackSite | null>(null);
    const [formName, setFormName] = useState('');
    const [formDomain, setFormDomain] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<string | null>(null);

    /* 接入代码展示弹窗 */
    const [codeDialogOpen, setCodeDialogOpen] = useState(false);
    const [codeDialogSiteId, setCodeDialogSiteId] = useState('');

    const fetchSites = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<ListData<TrackSite>>('/admin/analytics/sites');
            if (res.code === 0 && res.data) {
                setData(res.data);
            }
        } catch (err) {
            console.error('获取站点列表失败：', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSites();
    }, [fetchSites]);

    function openCreateForm() {
        setFormMode('create');
        setEditingSite(null);
        setFormName('');
        setFormDomain('');
        setFormMessage(null);
        setFormOpen(true);
    }

    function openEditForm(site: TrackSite) {
        setFormMode('edit');
        setEditingSite(site);
        setFormName(site.name);
        setFormDomain(site.domain);
        setFormMessage(null);
        setFormOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formName.trim() || !formDomain.trim()) return;

        setSubmitting(true);
        setFormMessage(null);

        try {
            const body = { name: formName.trim(), domain: formDomain.trim() };
            const res =
                formMode === 'create'
                    ? await api.post<{ site: TrackSite }>('/admin/analytics/sites', body)
                    : await api.put<{ site: TrackSite }>('/admin/analytics/sites', { id: editingSite!.id, ...body });

            if (res.code !== 0) {
                setFormMessage(res.message || '操作失败。');
                return;
            }

            setFormOpen(false);
            toast.success(formMode === 'create' ? '站点创建成功' : '修改成功');

            if (formMode === 'create' && res.data?.site?.id) {
                setCodeDialogSiteId(res.data.site.id);
                setCodeDialogOpen(true);
            }

            fetchSites();
        } catch {
            setFormMessage('请求失败，请稍后重试。');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleToggleStatus(site: TrackSite) {
        const newStatus = site.status === 'active' ? 'paused' : 'active';
        try {
            const res = await api.put('/admin/analytics/sites', { id: site.id, status: newStatus });
            if (res.code === 0) {
                toast.success(newStatus === 'active' ? '站点已启用' : '站点已暂停');
                fetchSites();
            } else {
                toast.error(res.message || '操作失败。');
            }
        } catch {
            toast.error('请求失败。');
        }
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;

        setDeleting(deleteTarget.id);
        try {
            const res = await api.delete(`/admin/analytics/sites?id=${deleteTarget.id}`);
            if (res.code === 0) {
                setData((prev) => ({
                    data: prev.data.filter((s) => s.id !== deleteTarget.id),
                    total: prev.total - 1,
                }));
                setDeleteTarget(null);
                toast.success('站点已删除');
            } else {
                toast.error(res.message || '删除失败。');
            }
        } catch {
            toast.error('删除请求失败。');
        } finally {
            setDeleting(null);
        }
    }

    async function copyEmbedCode(siteId: string) {
        const code = getEmbedScript(siteId);
        try {
            await navigator.clipboard.writeText(code);
            toast.success('接入代码已复制');
        } catch {
            toast.error('复制失败，请手动复制。');
        }
    }

    const columns: DataColumn<TrackSite>[] = [
        { header: '站点名称', render: (site) => <span className={styles.nameCell}>{site.name}</span> },
        { header: '域名', render: (site) => <span className={shared.mutedCell}>{site.domain}</span>, hideBelow: 'sm' },
        {
            header: '状态',
            render: (site) => (
                <Tag size="mini" variant={site.status === 'active' ? 'primary' : 'default'}>
                    {site.status === 'active' ? '运行中' : '已暂停'}
                </Tag>
            ),
        },
        {
            header: '站点ID',
            hideBelow: 'lg',
            render: (site) => (
                <span className={styles.idCell}>
                    {site.id}
                    <IconButton
                        icon={<CopyIcon />}
                        onClick={() => copyEmbedCode(site.id)}
                        size="small"
                        title="复制接入代码"
                    />
                </span>
            ),
        },
        {
            header: '操作',
            width: '9rem',
            render: (site) => (
                <div className={shared.actionGroup}>
                    <IconButton icon={<PencilIcon />} onClick={() => openEditForm(site)} size="medium" title="编辑" />
                    <IconButton
                        icon={site.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                        onClick={() => handleToggleStatus(site)}
                        size="medium"
                        title={site.status === 'active' ? '暂停' : '启用'}
                    />
                    <IconButton
                        icon={<Trash2Icon />}
                        onClick={() => setDeleteTarget({ id: site.id, name: site.name })}
                        size="medium"
                        title="删除"
                        variant="danger"
                        disabled={deleting === site.id}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminPageHeader
                description="管理监控站点，获取接入代码嵌入目标网站即可开始采集数据。"
                eyebrow="Analytics"
                tag={`${data.total} 个站点`}
                title="站点管理"
            />

            <div className={styles.toolbar}>
                <GhostButton
                    asButton
                    icon={<PlusIcon className={shared.btnIcon} />}
                    onClick={openCreateForm}
                    size="medium"
                    variant="primary"
                >
                    新增站点
                </GhostButton>
            </div>

            <DataTable
                columns={columns}
                emptyText={loading ? '加载中...' : '暂无站点'}
                rowKey={(site) => site.id}
                rows={data.data}
            />

            <ConfirmDialog
                confirmLabel="删除"
                message={`确定要删除站点「${deleteTarget?.name ?? ''}」吗？相关数据将保留但不再采集。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                loading={deleting !== null}
                title="确认删除"
            />

            {/* 新增/编辑弹窗 */}
            <Dialog
                onClose={() => setFormOpen(false)}
                open={formOpen}
                title={formMode === 'create' ? '新增站点' : `编辑站点：${editingSite?.name || ''}`}
            >
                <form className={shared.form} onSubmit={handleSubmit}>
                    <TextInput
                        id="site-name"
                        label="站点名称"
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="如：主站、博客"
                        required
                        value={formName}
                    />
                    <TextInput
                        id="site-domain"
                        label="站点域名"
                        onChange={(e) => setFormDomain(e.target.value)}
                        placeholder="如：yuwb.cn"
                        required
                        value={formDomain}
                    />
                    <div className={shared.formActions}>
                        <GhostButton asButton onClick={() => setFormOpen(false)}>
                            取消
                        </GhostButton>
                        <SubmitButton size="medium" disabled={submitting}>
                            {submitting ? '保存中...' : formMode === 'create' ? '创建站点' : '保存修改'}
                        </SubmitButton>
                    </div>
                    {formMessage && (
                        <p className={shared.formMessage} role="alert">
                            {formMessage}
                        </p>
                    )}
                </form>
            </Dialog>

            {/* 接入代码弹窗 */}
            <Dialog onClose={() => setCodeDialogOpen(false)} open={codeDialogOpen} title="接入代码">
                <div className={styles.codeDialogContent}>
                    <p className={styles.codeHint}>将以下代码添加到网站的 &lt;head&gt; 中即可开始采集数据：</p>
                    <div className={styles.codeBlock}>
                        <code>{getEmbedScript(codeDialogSiteId)}</code>
                    </div>
                    <div className={styles.codeActions}>
                        <GhostButton
                            asButton
                            icon={<CopyIcon />}
                            onClick={() => copyEmbedCode(codeDialogSiteId)}
                            size="medium"
                            variant="primary"
                        >
                            复制代码
                        </GhostButton>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
