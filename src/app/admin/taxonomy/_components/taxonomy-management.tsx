'use client';

import { useState } from 'react';

import { PlusIcon } from '@/components/ui/icons';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextInput } from '@/components/ui/text-input';
import { toast } from '@/components/ui/toast';
import AdminPageHeader from '@/components/modules/admin/admin-page-header/admin-page-header';
import shared from '@/app/admin/_components/admin-shared.module.css';
import { api } from '@/lib/core/http-client';
import { useCrudList } from '@/app/admin/_hooks/use-crud-list';

import TaxonomyCard from './taxonomy-card';
import styles from './taxonomy-management.module.css';

/*== 类型定义 ==*/

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
}

interface TagItem {
    id: number;
    name: string;
    slug: string;
}

/*-- 统一删除目标：区分分类与标签 --*/
type DeleteTarget = { kind: 'cat' | 'tag'; id: number; name: string } | null;

/*== 分类与标签合并管理 ==*/

export default function TaxonomyManagement() {
    const catList = useCrudList<CategoryItem>('/admin/categories', '分类');
    const tagList = useCrudList<TagItem>('/admin/tags', '标签');

    /*-- 统一删除目标 --*/
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
    const deleteLoading =
        (deleteTarget?.kind === 'cat' && catList.deleting !== null) ||
        (deleteTarget?.kind === 'tag' && tagList.deleting !== null);

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.kind === 'cat') {
                catList.setDeleteTarget({ id: deleteTarget.id, name: deleteTarget.name });
                await catList.handleDeleteConfirm();
            } else {
                tagList.setDeleteTarget({ id: deleteTarget.id, name: deleteTarget.name });
                await tagList.handleDeleteConfirm();
            }
        } finally {
            setDeleteTarget(null);
        }
    }

    /*-- 分类弹窗表单状态 --*/
    const [catFormOpen, setCatFormOpen] = useState(false);
    const [catEditingId, setCatEditingId] = useState<number | null>(null);
    const [catFormName, setCatFormName] = useState('');
    const [catFormSlug, setCatFormSlug] = useState('');
    const [catFormSortOrder, setCatFormSortOrder] = useState(1);
    const [catSubmitting, setCatSubmitting] = useState(false);
    const [catFormMessage, setCatFormMessage] = useState<string | null>(null);
    const catIsEditing = catEditingId !== null;

    /*-- 标签弹窗表单状态 --*/
    const [tagFormOpen, setTagFormOpen] = useState(false);
    const [tagEditingId, setTagEditingId] = useState<number | null>(null);
    const [tagFormName, setTagFormName] = useState('');
    const [tagFormSlug, setTagFormSlug] = useState('');
    const [tagSubmitting, setTagSubmitting] = useState(false);
    const [tagFormMessage, setTagFormMessage] = useState<string | null>(null);
    const tagIsEditing = tagEditingId !== null;

    /*-- 分类操作 --*/

    function handleCatEditClick(cat: CategoryItem) {
        setCatEditingId(cat.id);
        setCatFormName(cat.name);
        setCatFormSlug(cat.slug);
        setCatFormSortOrder(cat.sort_order);
        setCatFormMessage(null);
        setCatFormOpen(true);
    }

    function openCatCreateForm() {
        setCatEditingId(null);
        setCatFormName('');
        setCatFormSlug('');
        setCatFormSortOrder(catList.data.data.length + 1);
        setCatFormMessage(null);
        setCatFormOpen(true);
    }

    function handleCatNameChange(value: string) {
        setCatFormName(value);
        if (!catIsEditing) {
            setCatFormSlug(
                value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]/g, '')
            );
        }
    }

    async function handleCatSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!catFormName.trim()) return;

        setCatSubmitting(true);
        setCatFormMessage(null);

        try {
            const body = {
                name: catFormName.trim(),
                slug: catFormSlug,
                sort_order: Math.max(1, Math.round(catFormSortOrder)),
            };
            const res = catIsEditing
                ? await api.put(`/admin/categories/${catEditingId}`, body)
                : await api.post('/admin/categories', body);

            if (res.code !== 0) {
                setCatFormMessage(res.message || '操作失败。');
                return;
            }

            setCatFormOpen(false);
            toast.success(catIsEditing ? '修改成功' : '新增成功');
            catList.fetchData();
        } catch {
            setCatFormMessage('请求失败，请稍后重试。');
        } finally {
            setCatSubmitting(false);
        }
    }

    /*-- 标签操作 --*/

    function handleTagEditClick(tag: TagItem) {
        setTagEditingId(tag.id);
        setTagFormName(tag.name);
        setTagFormSlug(tag.slug);
        setTagFormMessage(null);
        setTagFormOpen(true);
    }

    function openTagCreateForm() {
        setTagEditingId(null);
        setTagFormName('');
        setTagFormSlug('');
        setTagFormMessage(null);
        setTagFormOpen(true);
    }

    function handleTagNameChange(value: string) {
        setTagFormName(value);
        if (!tagIsEditing) {
            setTagFormSlug(
                value
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]/g, '')
            );
        }
    }

    async function handleTagSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!tagFormName.trim()) return;

        setTagSubmitting(true);
        setTagFormMessage(null);

        try {
            const body = { name: tagFormName.trim(), slug: tagFormSlug };
            const res = tagIsEditing
                ? await api.put(`/admin/tags/${tagEditingId}`, body)
                : await api.post('/admin/tags', body);

            if (res.code !== 0) {
                setTagFormMessage(res.message || '操作失败。');
                return;
            }

            setTagFormOpen(false);
            toast.success(tagIsEditing ? '修改成功' : '新增成功');
            tagList.fetchData();
        } catch {
            setTagFormMessage('请求失败，请稍后重试。');
        } finally {
            setTagSubmitting(false);
        }
    }

    /*-- 渲染 --*/

    return (
        <>
            <AdminPageHeader
                description="管理文章分类与标签，支持新增、编辑和删除。"
                eyebrow="Categories & Tags"
                tag={`${catList.data.total} 个分类 · ${tagList.data.total} 个标签`}
                title="分类标签"
            />

            <div className={styles.columns}>
                {/*-- 左栏：分类 --*/}
                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <div className={styles.columnLabel}>
                            <span className={styles.columnTitle}>分类</span>
                            <span className={styles.columnSub}>Categories</span>
                        </div>
                        <GhostButton
                            asButton
                            icon={<PlusIcon className={shared.btnIcon} />}
                            onClick={openCatCreateForm}
                            size="small"
                            variant="primary"
                        >
                            新增
                        </GhostButton>
                    </div>
                    <div className={styles.cardList} role="list" aria-label="分类列表">
                        {catList.loading ? (
                            <p className={styles.empty}>加载中...</p>
                        ) : catList.data.data.length === 0 ? (
                            <p className={styles.empty}>暂无分类</p>
                        ) : (
                            catList.data.data.map((cat) => (
                                <TaxonomyCard
                                    key={cat.id}
                                    name={cat.name}
                                    sortOrder={cat.sort_order}
                                    tone="cat"
                                    deleting={catList.deleting === cat.id}
                                    onEdit={() => handleCatEditClick(cat)}
                                    onDelete={() => setDeleteTarget({ kind: 'cat', id: cat.id, name: cat.name })}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/*-- 右栏：标签 --*/}
                <div className={styles.column}>
                    <div className={styles.columnHeader}>
                        <div className={styles.columnLabel}>
                            <span className={styles.columnTitle}>标签</span>
                            <span className={styles.columnSub}>Tags</span>
                        </div>
                        <GhostButton
                            asButton
                            icon={<PlusIcon className={shared.btnIcon} />}
                            onClick={openTagCreateForm}
                            size="small"
                            variant="primary"
                        >
                            新增
                        </GhostButton>
                    </div>
                    <div className={styles.cardList} role="list" aria-label="标签列表">
                        {tagList.loading ? (
                            <p className={styles.empty}>加载中...</p>
                        ) : tagList.data.data.length === 0 ? (
                            <p className={styles.empty}>暂无标签</p>
                        ) : (
                            tagList.data.data.map((tag) => (
                                <TaxonomyCard
                                    key={tag.id}
                                    name={tag.name}
                                    tone="tag"
                                    deleting={tagList.deleting === tag.id}
                                    onEdit={() => handleTagEditClick(tag)}
                                    onDelete={() => setDeleteTarget({ kind: 'tag', id: tag.id, name: tag.name })}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/*-- 分类 Dialog --*/}
            <Dialog
                onClose={() => setCatFormOpen(false)}
                open={catFormOpen}
                title={catIsEditing ? '编辑分类' : '新增分类'}
            >
                <form className={shared.form} onSubmit={handleCatSubmit}>
                    <TextInput
                        id="cat-name"
                        label="分类名"
                        onChange={(e) => handleCatNameChange(e.target.value)}
                        placeholder="输入分类名"
                        required
                        value={catFormName}
                    />
                    <TextInput
                        id="cat-slug"
                        label="Slug"
                        onChange={(e) => setCatFormSlug(e.target.value)}
                        placeholder="url-friendly-identifier"
                        value={catFormSlug}
                    />
                    <TextInput
                        id="cat-sort"
                        label="排序号"
                        onChange={(e) => setCatFormSortOrder(Number(e.target.value))}
                        placeholder="1"
                        type="number"
                        value={String(catFormSortOrder)}
                    />
                    <div className={shared.formActions}>
                        <GhostButton asButton onClick={() => setCatFormOpen(false)}>
                            取消
                        </GhostButton>
                        <SubmitButton size="medium" disabled={catSubmitting}>
                            {catSubmitting ? '保存中...' : catIsEditing ? '保存修改' : '新增分类'}
                        </SubmitButton>
                    </div>
                    {catFormMessage && (
                        <p className={shared.formMessage} role="alert">
                            {catFormMessage}
                        </p>
                    )}
                </form>
            </Dialog>

            {/*-- 标签 Dialog --*/}
            <Dialog
                onClose={() => setTagFormOpen(false)}
                open={tagFormOpen}
                title={tagIsEditing ? '编辑标签' : '新增标签'}
            >
                <form className={shared.form} onSubmit={handleTagSubmit}>
                    <TextInput
                        id="tag-name"
                        label="标签名"
                        onChange={(e) => handleTagNameChange(e.target.value)}
                        placeholder="输入标签名"
                        required
                        value={tagFormName}
                    />
                    <TextInput
                        id="tag-slug"
                        label="Slug"
                        onChange={(e) => setTagFormSlug(e.target.value)}
                        placeholder="url-friendly-identifier"
                        value={tagFormSlug}
                    />
                    <div className={shared.formActions}>
                        <GhostButton asButton onClick={() => setTagFormOpen(false)}>
                            取消
                        </GhostButton>
                        <SubmitButton size="medium" disabled={tagSubmitting}>
                            {tagSubmitting ? '保存中...' : tagIsEditing ? '保存修改' : '新增标签'}
                        </SubmitButton>
                    </div>
                    {tagFormMessage && (
                        <p className={shared.formMessage} role="alert">
                            {tagFormMessage}
                        </p>
                    )}
                </form>
            </Dialog>

            {/*-- 删除确认 --*/}
            <ConfirmDialog
                confirmLabel="删除"
                message={`确定要删除「${deleteTarget?.name ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                loading={deleteLoading}
                title="确认删除"
            />
        </>
    );
}
