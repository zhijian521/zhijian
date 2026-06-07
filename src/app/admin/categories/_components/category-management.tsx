'use client';

import { PencilIcon, Trash2Icon } from '@/components/ui/icons';
import { useState } from 'react';

import ConfirmDialog from '@/components/ui/confirm-dialog';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import SplitPanelLayout from '@/app/admin/_components/split-panel-layout';
import { MOCK_CATEGORIES, type MockCategory } from '@/lib/mock-data';
import styles from './category-management.module.css';

function cn(...classes: (string | false | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}

/*== 分类管理：左列表 + 右表单，静态数据。 ==*/
export default function CategoryManagement() {
    const [categories, setCategories] = useState<MockCategory[]>([...MOCK_CATEGORIES]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formSortOrder, setFormSortOrder] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    const isEditing = editingId !== null;
    const formTitle = isEditing ? '编辑分类' : '新增分类';

    function handleEditClick(cat: MockCategory) {
        setEditingId(cat.id);
        setFormName(cat.name);
        setFormSlug(cat.slug);
        setFormSortOrder(cat.sortOrder);
    }

    function handleCancelEdit() {
        setEditingId(null);
        setFormName('');
        setFormSlug('');
        setFormSortOrder(categories.length + 1);
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
            handleCancelEdit();
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
    }

    function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        if (editingId === deleteTarget.id) handleCancelEdit();
        setDeleteTarget(null);
    }

    const listContent = (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.thead}>
                        <th className={styles.th}>分类名</th>
                        <th className={styles.th}>Slug</th>
                        <th className={styles.th}>文章数</th>
                        <th className={styles.th}>排序</th>
                        <th className={styles.th} style={{ textAlign: 'right', width: '5rem' }}>操作</th>
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    {categories.length === 0 ? (
                        <tr>
                            <td className={styles.emptyRow} colSpan={5}>暂无分类</td>
                        </tr>
                    ) : (
                        categories.map((cat) => (
                            <tr key={cat.id}>
                                <td className={styles.td}>{cat.name}</td>
                                <td className={styles.tdMuted}>{cat.slug}</td>
                                <td className={styles.tdMuted}>{cat.postCount}</td>
                                <td className={styles.tdMuted}>{cat.sortOrder}</td>
                                <td className={styles.tdAction}>
                                    <button className={styles.actionBtn} onClick={() => handleEditClick(cat)} title='编辑' type='button'>
                                        <PencilIcon className={styles.actionIcon} />
                                    </button>
                                    <button className={cn(styles.actionBtn, styles.actionBtnDanger)} onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })} title='删除' type='button'>
                                        <Trash2Icon className={styles.actionIcon} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const formContent = (
        <div className={styles.formPanel}>
            <form className={styles.fieldGroup} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor='cat-name'>分类名</label>
                    <input className={styles.input} id='cat-name' onChange={(e) => handleNameChange(e.target.value)} placeholder='输入分类名' required type='text' value={formName} />
                </div>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor='cat-slug'>Slug</label>
                    <input className={styles.input} id='cat-slug' onChange={(e) => setFormSlug(e.target.value)} placeholder='url-friendly-identifier' type='text' value={formSlug} />
                </div>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor='cat-sort'>排序号</label>
                    <input className={styles.input} id='cat-sort' min={1} onChange={(e) => setFormSortOrder(Number(e.target.value))} type='number' value={formSortOrder} />
                </div>
                <button className={styles.submitBtn} type='submit'>{isEditing ? '保存修改' : '新增分类'}</button>
                {isEditing && <button className={styles.cancelBtn} onClick={handleCancelEdit} type='button'>取消编辑</button>}
            </form>
        </div>
    );

    return (
        <>
            <AdminPageHeader
                description='管理文章分类，支持新增、编辑和删除。'
                eyebrow='Categories'
                tag={`${categories.length} 个分类`}
                title='分类管理'
            />
            <SplitPanelLayout form={formContent} formTitle={formTitle} list={listContent} />
            <ConfirmDialog
                confirmLabel='删除'
                message={`确定要删除分类「${deleteTarget?.name ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                title='确认删除'
            />
        </>
    );
}
