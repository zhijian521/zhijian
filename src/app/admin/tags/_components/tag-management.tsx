'use client';

import { PencilIcon, Trash2Icon } from '@/components/ui/icons';
import { useState } from 'react';

import ConfirmDialog from '@/components/ui/confirm-dialog';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import SplitPanelLayout from '@/app/admin/_components/split-panel-layout';
import { MOCK_TAGS, type MockTag } from '@/lib/mock-data';
import styles from './tag-management.module.css';

function cn(...classes: (string | false | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}

/*== 标签管理：左列表 + 右表单，静态数据。 ==*/
export default function TagManagement() {
    const [tags, setTags] = useState<MockTag[]>([...MOCK_TAGS]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    const isEditing = editingId !== null;
    const formTitle = isEditing ? '编辑标签' : '新增标签';

    function handleEditClick(tag: MockTag) {
        setEditingId(tag.id);
        setFormName(tag.name);
        setFormSlug(tag.slug);
    }

    function handleCancelEdit() {
        setEditingId(null);
        setFormName('');
        setFormSlug('');
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
            handleCancelEdit();
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
    }

    function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        if (editingId === deleteTarget.id) handleCancelEdit();
        setDeleteTarget(null);
    }

    const listContent = (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.thead}>
                        <th className={styles.th}>标签名</th>
                        <th className={styles.th}>Slug</th>
                        <th className={styles.th}>文章数</th>
                        <th className={styles.th} style={{ textAlign: 'right', width: '5rem' }}>操作</th>
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    {tags.length === 0 ? (
                        <tr>
                            <td className={styles.emptyRow} colSpan={4}>暂无标签</td>
                        </tr>
                    ) : (
                        tags.map((tag) => (
                            <tr key={tag.id}>
                                <td className={styles.td}>{tag.name}</td>
                                <td className={styles.tdMuted}>{tag.slug}</td>
                                <td className={styles.tdMuted}>{tag.postCount}</td>
                                <td className={styles.tdAction}>
                                    <button className={styles.actionBtn} onClick={() => handleEditClick(tag)} title='编辑' type='button'>
                                        <PencilIcon className={styles.actionIcon} />
                                    </button>
                                    <button className={cn(styles.actionBtn, styles.actionBtnDanger)} onClick={() => setDeleteTarget({ id: tag.id, name: tag.name })} title='删除' type='button'>
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
                    <label className={styles.label} htmlFor='tag-name'>标签名</label>
                    <input className={styles.input} id='tag-name' onChange={(e) => handleNameChange(e.target.value)} placeholder='输入标签名' required type='text' value={formName} />
                </div>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor='tag-slug'>Slug</label>
                    <input className={styles.input} id='tag-slug' onChange={(e) => setFormSlug(e.target.value)} placeholder='url-friendly-identifier' type='text' value={formSlug} />
                </div>
                <button className={styles.submitBtn} type='submit'>{isEditing ? '保存修改' : '新增标签'}</button>
                {isEditing && <button className={styles.cancelBtn} onClick={handleCancelEdit} type='button'>取消编辑</button>}
            </form>
        </div>
    );

    return (
        <>
            <AdminPageHeader
                description='管理文章标签，支持新增、编辑和删除。'
                eyebrow='Tags'
                tag={`${tags.length} 个标签`}
                title='标签管理'
            />
            <SplitPanelLayout form={formContent} formTitle={formTitle} list={listContent} />
            <ConfirmDialog
                confirmLabel='删除'
                message={`确定要删除标签「${deleteTarget?.name ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                title='确认删除'
            />
        </>
    );
}
