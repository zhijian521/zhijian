'use client';

import { useState } from 'react';

import { PencilIcon, PlusIcon, Trash2Icon } from '@/components/ui/icons';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { Pagination } from '@/components/ui/pagination';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextInput } from '@/components/ui/text-input';
import { toast } from '@/components/ui/toast';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { api } from '@/lib/http-client';
import { useCrudList } from '@/app/admin/_hooks/use-crud-list';

import styles from './tag-management.module.css';
import shared from '@/app/admin/_components/admin-shared.module.css';

interface TagItem {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

/*== 标签管理 ==*/
export default function TagManagement() {
    const list = useCrudList<TagItem>('/admin/tags', '标签');

    /* 弹窗表单状态 */
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<string | null>(null);

    const isEditing = editingId !== null;

    function handleEditClick(tag: TagItem) {
        setEditingId(tag.id);
        setFormName(tag.name);
        setFormSlug(tag.slug);
        setFormMessage(null);
        setFormOpen(true);
    }

    function openCreateForm() {
        setEditingId(null);
        setFormName('');
        setFormSlug('');
        setFormMessage(null);
        setFormOpen(true);
    }

    function handleNameChange(value: string) {
        setFormName(value);
        if (!isEditing) {
            setFormSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formName.trim()) return;

        setSubmitting(true);
        setFormMessage(null);

        try {
            const body = { name: formName.trim(), slug: formSlug };
            const res = isEditing
                ? await api.put(`/admin/tags/${editingId}`, body)
                : await api.post('/admin/tags', body);

            if (res.code !== 0) {
                setFormMessage(res.message || '操作失败。');
                return;
            }

            setFormOpen(false);
            toast.success(isEditing ? '修改成功' : '新增成功');
            list.fetchData();
        } catch {
            setFormMessage('请求失败，请稍后重试。');
        } finally {
            setSubmitting(false);
        }
    }

    const columns: DataColumn<TagItem>[] = [
        { header: '标签名', render: (tag) => tag.name },
        { header: 'Slug', render: (tag) => <span className={shared.mutedCell}>{tag.slug}</span>, hideBelow: 'sm' },
        {
            header: '操作',
            width: '6rem',
            render: (tag) => (
                <div className={shared.actionGroup}>
                    <IconButton
                        icon={<PencilIcon />}
                        onClick={() => handleEditClick(tag)}
                        size="medium"
                        title="编辑"
                    />
                    <IconButton
                        disabled={list.deleting === tag.id}
                        icon={<Trash2Icon />}
                        onClick={() => list.setDeleteTarget({ id: tag.id, name: tag.name })}
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
                description='管理文章标签，支持新增、编辑和删除。'
                eyebrow='Tags'
                tag={`${list.data.total} 个标签`}
                title='标签管理'
            />

            <div className={styles.toolbar}>
                <GhostButton
                    asButton
                    icon={<PlusIcon className={shared.btnIcon} />}
                    onClick={openCreateForm}
                    size='medium'
                    variant='primary'
                >
                    新增标签
                </GhostButton>
            </div>

            <DataTable
                columns={columns}
                emptyText={list.loading ? '加载中...' : '暂无标签'}
                rowKey={(tag) => tag.id}
                rows={list.pagedData}
            />

            <Pagination current={list.page} onPageChange={list.setPage} total={list.totalPages} />

            <ConfirmDialog
                confirmLabel='删除'
                message={`确定要删除标签「${list.deleteTarget?.name ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => list.setDeleteTarget(null)}
                onConfirm={list.handleDeleteConfirm}
                open={!!list.deleteTarget}
                loading={list.deleting !== null}
                title='确认删除'
            />

            <Dialog onClose={() => setFormOpen(false)} open={formOpen} title={isEditing ? '编辑标签' : '新增标签'}>
                <form className={shared.form} onSubmit={handleSubmit}>
                    <TextInput
                        id='tag-name'
                        label='标签名'
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder='输入标签名'
                        required
                        value={formName}
                    />
                    <TextInput
                        id='tag-slug'
                        label='Slug'
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder='url-friendly-identifier'
                        value={formSlug}
                    />
                    <div className={shared.formActions}>
                        <GhostButton asButton onClick={() => setFormOpen(false)}>取消</GhostButton>
                        <SubmitButton size='medium' disabled={submitting}>
                            {submitting ? '保存中...' : isEditing ? '保存修改' : '新增标签'}
                        </SubmitButton>
                    </div>
                    {formMessage && (
                        <p className={shared.formMessage} role="alert">{formMessage}</p>
                    )}
                </form>
            </Dialog>
        </>
    );
}