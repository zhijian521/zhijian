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
import { MOCK_CATEGORIES, type MockCategory } from '@/lib/mock-data';

import styles from './category-management.module.css';

/*== 分类管理：左列表 + 右表单，静态数据。 ==*/
export default function CategoryManagement() {
    const [categories, setCategories] = useState<MockCategory[]>([...MOCK_CATEGORIES]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formSortOrder, setFormSortOrder] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const isEditing = editingId !== null;

    function handleEditClick(cat: MockCategory) {
        setEditingId(cat.id);
        setFormName(cat.name);
        setFormSlug(cat.slug);
        setFormSortOrder(cat.sortOrder);
        setFormOpen(true);
    }

    function openCreateForm() {
        setEditingId(null);
        setFormName('');
        setFormSlug('');
        setFormSortOrder(categories.length + 1);
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
            setCategories((prev) =>
                prev.map((c) => (c.id === editingId ? { ...c, name: formName.trim(), slug: formSlug, sortOrder: formSortOrder } : c)),
            );
        } else {
            const newCat: MockCategory = {
                id: Math.max(0, ...categories.map((c) => c.id)) + 1,
                name: formName.trim(),
                slug: formSlug,
                postCount: 0,
                sortOrder: formSortOrder,
            };
            setCategories((prev) => [...prev, newCat]);
            setFormName('');
            setFormSlug('');
            setFormSortOrder(categories.length + 2);
        }
        setFormOpen(false);
    }

    function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        if (editingId === deleteTarget.id) {
            setEditingId(null);
            setFormOpen(false);
        }
        setDeleteTarget(null);
    }

    const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
    const pagedCategories = categories.slice((page - 1) * pageSize, page * pageSize);

    const columns: DataColumn<MockCategory>[] = [
        { header: '分类名', render: (cat) => cat.name },
        { header: 'Slug', render: (cat) => <span className={styles.mutedCell}>{cat.slug}</span>, hideBelow: 'sm' },
        { header: '文章数', render: (cat) => <span className={styles.mutedCell}>{cat.postCount}</span>, hideBelow: 'md' },
        { header: '排序', render: (cat) => <span className={styles.mutedCell}>{cat.sortOrder}</span>, hideBelow: 'lg' },
        {
            header: '操作',
            align: 'right',
            width: '6rem',
            render: (cat) => (
                <div className={styles.actionGroup}>
                    <button className={styles.actionBtn} onClick={() => handleEditClick(cat)} title="编辑">
                        <PencilIcon className={styles.actionIcon} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })} title="删除">
                        <Trash2Icon className={styles.actionIcon} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminPageHeader
                description='管理文章分类，支持新增、编辑和删除。'
                eyebrow='Categories'
                tag={`${categories.length} 个分类`}
                title='分类管理'
            />

            <div className={styles.toolbar}>
                <GhostButton
                    asButton
                    icon={<PencilIcon className={styles.btnIcon} />}
                    onClick={openCreateForm}
                    size='medium'
                    variant='primary'
                >
                    新增分类
                </GhostButton>
            </div>

            <DataTable
                columns={columns}
                emptyText='暂无分类'
                rowKey={(cat) => cat.id}
                rows={pagedCategories}
            />

            <Pagination current={page} onPageChange={setPage} total={totalPages} />

            <ConfirmDialog
                confirmLabel='删除'
                message={`确定要删除分类「${deleteTarget?.name ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                title='确认删除'
            />

            <Dialog onClose={() => setFormOpen(false)} open={formOpen} title={isEditing ? '编辑分类' : '新增分类'}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <TextInput
                        id='cat-name'
                        label='分类名'
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder='输入分类名'
                        required
                        value={formName}
                    />
                    <TextInput
                        id='cat-slug'
                        label='Slug'
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder='url-friendly-identifier'
                        value={formSlug}
                    />
                    <TextInput
                        id='cat-sort'
                        label='排序号'
                        onChange={(e) => setFormSortOrder(Number(e.target.value))}
                        placeholder='1'
                        type='number'
                        value={String(formSortOrder)}
                    />
                    <div className={styles.formActions}>
                        <GhostButton asButton onClick={() => setFormOpen(false)}>取消</GhostButton>
                        <SubmitButton size='medium'>{isEditing ? '保存修改' : '新增分类'}</SubmitButton>
                    </div>
                </form>
            </Dialog>
        </>
    );
}