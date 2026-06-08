'use client';

import { useState } from 'react';

import { PencilIcon, Trash2Icon } from '@/components/ui/icons';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { Pagination } from '@/components/ui/pagination';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextInput } from '@/components/ui/text-input';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { MOCK_TAGS, type MockTag } from '@/lib/mock-data';

import styles from './tag-management.module.css';

/*== 标签管理：左列表 + 右表单，静态数据。 ==*/
export default function TagManagement() {
    const [tags, setTags] = useState<MockTag[]>([...MOCK_TAGS]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const isEditing = editingId !== null;

    function handleEditClick(tag: MockTag) {
        setEditingId(tag.id);
        setFormName(tag.name);
        setFormSlug(tag.slug);
        setFormOpen(true);
    }

    function openCreateForm() {
        setEditingId(null);
        setFormName('');
        setFormSlug('');
        setFormOpen(true);
    }

    function handleNameChange(value: string) {
        setFormName(value);
        if (!isEditing) {
            setFormSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formName.trim()) return;

        if (isEditing) {
            setTags((prev) =>
                prev.map((t) => (t.id === editingId ? { ...t, name: formName.trim(), slug: formSlug } : t)),
            );
        } else {
            const newTag: MockTag = {
                id: Math.max(0, ...tags.map((t) => t.id)) + 1,
                name: formName.trim(),
                slug: formSlug,
                postCount: 0,
            };
            setTags((prev) => [...prev, newTag]);
            setFormName('');
            setFormSlug('');
        }
        setFormOpen(false);
    }

    function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        if (editingId === deleteTarget.id) {
            setEditingId(null);
            setFormOpen(false);
        }
        setDeleteTarget(null);
    }

    const totalPages = Math.max(1, Math.ceil(tags.length / pageSize));
    const pagedTags = tags.slice((page - 1) * pageSize, page * pageSize);

    const columns: DataColumn<MockTag>[] = [
        { header: '标签名', render: (tag) => tag.name },
        { header: 'Slug', render: (tag) => <span className={styles.mutedCell}>{tag.slug}</span>, hideBelow: 'sm' },
        { header: '文章数', render: (tag) => <span className={styles.mutedCell}>{tag.postCount}</span>, hideBelow: 'md' },
        {
            header: '操作',
            align: 'right',
            width: '6rem',
            render: (tag) => (
                <div className={styles.actionGroup}>
                    <button className={styles.actionBtn} onClick={() => handleEditClick(tag)} title="编辑">
                        <PencilIcon className={styles.actionIcon} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setDeleteTarget({ id: tag.id, name: tag.name })} title="删除">
                        <Trash2Icon className={styles.actionIcon} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminPageHeader
                description='管理文章标签，支持新增、编辑和删除。'
                eyebrow='Tags'
                tag={`${tags.length} 个标签`}
                title='标签管理'
            />

            <div className={styles.toolbar}>
                <GhostButton
                    asButton
                    icon={<PencilIcon className={styles.btnIcon} />}
                    onClick={openCreateForm}
                    size='medium'
                    variant='primary'
                >
                    新增标签
                </GhostButton>
            </div>

            <DataTable
                columns={columns}
                emptyText='暂无标签'
                rowKey={(tag) => tag.id}
                rows={pagedTags}
            />

            <Pagination current={page} onPageChange={setPage} total={totalPages} />

            <ConfirmDialog
                confirmLabel='删除'
                message={`确定要删除标签「${deleteTarget?.name ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                title='确认删除'
            />

            <Dialog onClose={() => setFormOpen(false)} open={formOpen} title={isEditing ? '编辑标签' : '新增标签'}>
                <form className={styles.form} onSubmit={handleSubmit}>
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
                    <div className={styles.formActions}>
                        <GhostButton asButton onClick={() => setFormOpen(false)}>取消</GhostButton>
                        <SubmitButton size='medium'>{isEditing ? '保存修改' : '新增标签'}</SubmitButton>
                    </div>
                </form>
            </Dialog>
        </>
    );
}