'use client';

import { useEffect, useState, useCallback } from 'react';

import { PencilIcon, Trash2Icon } from '@/components/ui/icons';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { Pagination } from '@/components/ui/pagination';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextInput } from '@/components/ui/text-input';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { api } from '@/lib/http-client';
import type { ListData } from '@/lib/api-response';

import styles from './category-management.module.css';
import shared from '@/app/admin/_components/admin-shared.module.css';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

/*== 分类管理 ==*/
export default function CategoryManagement() {
    const [data, setData] = useState<ListData<CategoryItem>>({ data: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    /* 弹窗表单状态 */
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formSortOrder, setFormSortOrder] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<string | null>(null);

    const isEditing = editingId !== null;

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<ListData<CategoryItem>>('/admin/categories');
            if (res.code === 0 && res.data) {
                setData(res.data);
            }
        } catch (err) {
            console.error('获取分类列表失败：', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    function handleEditClick(cat: CategoryItem) {
        setEditingId(cat.id);
        setFormName(cat.name);
        setFormSlug(cat.slug);
        setFormSortOrder(cat.sort_order);
        setFormMessage(null);
        setFormOpen(true);
    }

    function openCreateForm() {
        setEditingId(null);
        setFormName('');
        setFormSlug('');
        setFormSortOrder(data.data.length + 1);
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
            const body = { name: formName.trim(), slug: formSlug, sort_order: formSortOrder };
            const res = isEditing
                ? await api.put(`/admin/categories/${editingId}`, body)
                : await api.post('/admin/categories', body);

            if (res.code !== 0) {
                setFormMessage(res.message || '操作失败。');
                return;
            }

            setFormOpen(false);
            fetchCategories();
        } catch {
            setFormMessage('请求失败，请稍后重试。');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;

        setDeleting(deleteTarget.id);
        try {
            const res = await api.delete(`/admin/categories/${deleteTarget.id}`);
            if (res.code === 0) {
                setData((prev) => ({
                    data: prev.data.filter((c) => c.id !== deleteTarget.id),
                    total: prev.total - 1,
                }));
                if (editingId === deleteTarget.id) {
                    setEditingId(null);
                    setFormOpen(false);
                }
                setDeleteTarget(null);
            } else {
                alert(res.message || '删除失败。');
            }
        } catch {
            alert('删除请求失败。');
        } finally {
            setDeleting(null);
        }
    }

    const totalPages = Math.max(1, Math.ceil(data.total / pageSize));
    const pagedCategories = data.data.slice((page - 1) * pageSize, page * pageSize);

    const columns: DataColumn<CategoryItem>[] = [
        { header: '分类名', render: (cat) => cat.name },
        { header: 'Slug', render: (cat) => <span className={shared.mutedCell}>{cat.slug}</span>, hideBelow: 'sm' },
        { header: '排序', render: (cat) => <span className={shared.mutedCell}>{cat.sort_order}</span>, hideBelow: 'lg' },
        {
            header: '操作',
            align: 'right',
            width: '6rem',
            render: (cat) => (
                <div className={shared.actionGroup}>
                    <button className={shared.actionBtn} onClick={() => handleEditClick(cat)} title="编辑">
                        <PencilIcon className={shared.actionIcon} />
                    </button>
                    <button
                        className={`${shared.actionBtn} ${shared.actionBtnDanger}`}
                        disabled={deleting === cat.id}
                        onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                        title="删除"
                    >
                        <Trash2Icon className={shared.actionIcon} />
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
                tag={`${data.total} 个分类`}
                title='分类管理'
            />

            <div className={styles.toolbar}>
                <GhostButton
                    asButton
                    icon={<PencilIcon className={shared.btnIcon} />}
                    onClick={openCreateForm}
                    size='medium'
                    variant='primary'
                >
                    新增分类
                </GhostButton>
            </div>

            <DataTable
                columns={columns}
                emptyText={loading ? '加载中...' : '暂无分类'}
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
                loading={deleting !== null}
                title='确认删除'
            />

            <Dialog onClose={() => setFormOpen(false)} open={formOpen} title={isEditing ? '编辑分类' : '新增分类'}>
                <form className={shared.form} onSubmit={handleSubmit}>
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
                    <div className={shared.formActions}>
                        <GhostButton asButton onClick={() => setFormOpen(false)}>取消</GhostButton>
                        <SubmitButton size='medium' disabled={submitting}>
                            {submitting ? '保存中...' : isEditing ? '保存修改' : '新增分类'}
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