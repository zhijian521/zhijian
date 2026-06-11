'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import type { Post, PostStatus } from '@/lib/post-shared';
import type { Category } from '@/lib/categories';
import type { Tag } from '@/lib/tags';
import { api } from '@/lib/http-client';
import { toast } from '@/components/ui/toast';
import { APP_ROUTES } from '@/lib/site';

import { EditorToolbar, type ViewMode } from './editor-toolbar';
import { MarkdownEditor } from './markdown-editor';
import { MarkdownPreview } from './markdown-preview';
import { MetadataPanel } from './metadata-panel';

import styles from './post-editor.module.css';

interface PostEditorProps {
    post: Post;
    categories: Category[];
    tags: Tag[];
}

interface FormData {
    title: string;
    slug: string;
    summary: string;
    content: string;
    status: PostStatus;
    publishedAt: string | null;
    coverImage: string | null;
    altText: string | null;
    categoryId: number | null;
    tags: number[];
}

type SaveStatus = 'saved' | 'saving' | 'unsaved';

/*== PostEditor 编辑器主组件：组装所有子组件，管理状态与自动保存。 ==*/
export default function PostEditor({ post, categories, tags }: PostEditorProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [formData, setFormData] = useState<FormData>({
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        status: post.status,
        publishedAt: post.publishedAt,
        coverImage: post.coverImage,
        altText: post.altText,
        categoryId: post.categoryId,
        tags: post.tags,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedRef = useRef(JSON.stringify(formData));

    /* 自动保存 */
    const saveDraft = useCallback(async (data: FormData) => {
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            const res = await api.patch<{ post: Post }>(`/admin/posts/${post.id}`, {
                ...data,
                publishedAt: data.publishedAt || null,
            });
            if (res.code === 0) {
                lastSavedRef.current = JSON.stringify(data);
                setSaveStatus('saved');
            } else {
                setSaveStatus('unsaved');
                toast.error(res.message || '自动保存失败');
            }
        } catch {
            setSaveStatus('unsaved');
        } finally {
            setIsSaving(false);
        }
    }, [post.id]);

    const scheduleSave = useCallback((newData: FormData) => {
        setSaveStatus('unsaved');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveDraft(newData);
        }, 3000);
    }, [saveDraft]);

    function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
        const newData = { ...formData, [key]: value };
        setFormData(newData);
        // 草稿状态或内容变更时自动保存
        if (newData.status === 'draft' || key === 'content' || key === 'title') {
            scheduleSave(newData);
        }
    }

    /* 手动保存 */
    const handleManualSave = useCallback(async () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        await saveDraft(formData);
    }, [formData, saveDraft]);

    /* 发布 / 取消发布 */
    const handleTogglePublish = useCallback(async () => {
        const newStatus: PostStatus = formData.status === 'published' ? 'draft' : 'published';
        const newData = { ...formData, status: newStatus };
        setFormData(newData);

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        await saveDraft(newData);

        if (newStatus === 'published') {
            toast.success('文章已发布');
        } else {
            toast.success('文章已取消发布');
        }
    }, [formData, saveDraft]);

    /* 返回文章列表：优先关闭当前标签页；若浏览器阻止（非脚本打开的标签页）则整页跳转，强制重新走 layout 渲染侧边栏。 */
    const handleBack = useCallback(() => {
        window.close();
        // window.close() 失败时标签页不会关闭，继续执行整页跳转
        window.location.href = APP_ROUTES.adminPosts;
    }, []);

    /* 文章内插入图片回调 */
    const handleInsertImage = useCallback((_markdown: string) => {
        // 图片已在 MarkdownEditor 内部处理了 content 更新，此处无需额外操作
    }, []);

    /* beforeunload 弹窗 */
    useEffect(() => {
        function onBeforeUnload(e: BeforeUnloadEvent) {
            if (saveStatus === 'unsaved' || saveStatus === 'saving') {
                e.preventDefault();
            }
        }
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [saveStatus]);

    /* 清理定时器 */
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    /* 获取当前分类名称和标签名称，供预览使用 */
    const categoryName = formData.categoryId
        ? categories.find((c) => c.id === formData.categoryId)?.name ?? null
        : null;
    const tagNames = formData.tags
        .map((id) => tags.find((t) => t.id === id)?.name)
        .filter(Boolean) as string[];

    return (
        <div className={styles.editor}>
            <EditorToolbar
                isSaving={isSaving}
                onBack={handleBack}
                onManualSave={handleManualSave}
                onTogglePublish={handleTogglePublish}
                onViewModeChange={setViewMode}
                saveStatus={saveStatus}
                status={formData.status}
                viewMode={viewMode}
            />

            <div className={styles.body}>
                {/* 分栏模式：编辑区 + 元数据面板 */}
                {viewMode === 'split' && (
                    <>
                        <div className={styles.contentSplit}>
                            {/* 左侧：标题 + 摘要 + 编辑/预览 */}
                            <div className={styles.editPane}>
                                <div className={styles.headerArea}>
                                    <input
                                        className={styles.titleInput}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        placeholder="文章标题"
                                        type="text"
                                        value={formData.title}
                                    />
                                    <textarea
                                        className={styles.summaryInput}
                                        onChange={(e) => updateField('summary', e.target.value)}
                                        placeholder="写一段简短的摘要..."
                                        rows={2}
                                        value={formData.summary}
                                    />
                                </div>
                                <div className={styles.contentEdit}>
                                    <MarkdownEditor
                                        content={formData.content}
                                        fullWidth={false}
                                        onContentChange={(v: string) => updateField('content', v)}
                                        onInsertImage={handleInsertImage}
                                    />
                                </div>
                            </div>

                            {/* 右侧预览 */}
                            <div className={styles.previewPane}>
                                <MarkdownPreview
                                    categoryName={categoryName}
                                    content={formData.content}
                                    coverImage={formData.coverImage}
                                    publishedAt={formData.publishedAt}
                                    tagNames={tagNames}
                                    title={formData.title}
                                    altText={formData.altText}
                                />
                            </div>
                        </div>

                        {/* 元数据面板 */}
                        <div className={styles.sidePanel}>
                            <MetadataPanel
                                altText={formData.altText}
                                categories={categories}
                                categoryId={formData.categoryId}
                                coverImage={formData.coverImage}
                                onAltTextChange={(v: string | null) => updateField('altText', v)}
                                onCategoryIdChange={(v: number | null) => updateField('categoryId', v)}
                                onCoverImageChange={(v: string | null) => updateField('coverImage', v)}
                                onPublishedAtChange={(v: string | null) => updateField('publishedAt', v)}
                                onSelectedTagsChange={(v: number[]) => updateField('tags', v)}
                                onSlugChange={(v: string) => updateField('slug', v)}
                                onStatusChange={(v: PostStatus) => updateField('status', v)}
                                publishedAt={formData.publishedAt}
                                selectedTags={formData.tags}
                                slug={formData.slug}
                                status={formData.status}
                                tags={tags}
                            />
                        </div>
                    </>
                )}

                {/* 编辑模式：全宽编辑 + 元数据面板 */}
                {viewMode === 'edit' && (
                    <>
                        <div className={styles.editPane}>
                            <div className={styles.headerArea}>
                                <input
                                    className={styles.titleInput}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="文章标题"
                                    type="text"
                                    value={formData.title}
                                />
                                <textarea
                                    className={styles.summaryInput}
                                    onChange={(e) => updateField('summary', e.target.value)}
                                    placeholder="写一段简短的摘要..."
                                    rows={2}
                                    value={formData.summary}
                                />
                            </div>
                            <div className={styles.contentEdit}>
                                <MarkdownEditor
                                    content={formData.content}
                                    fullWidth
                                    onContentChange={(v: string) => updateField('content', v)}
                                    onInsertImage={handleInsertImage}
                                />
                            </div>
                        </div>

                        {/* 元数据面板 */}
                        <div className={styles.sidePanel}>
                            <MetadataPanel
                                altText={formData.altText}
                                categories={categories}
                                categoryId={formData.categoryId}
                                coverImage={formData.coverImage}
                                onAltTextChange={(v: string | null) => updateField('altText', v)}
                                onCategoryIdChange={(v: number | null) => updateField('categoryId', v)}
                                onCoverImageChange={(v: string | null) => updateField('coverImage', v)}
                                onPublishedAtChange={(v: string | null) => updateField('publishedAt', v)}
                                onSelectedTagsChange={(v: number[]) => updateField('tags', v)}
                                onSlugChange={(v: string) => updateField('slug', v)}
                                onStatusChange={(v: PostStatus) => updateField('status', v)}
                                publishedAt={formData.publishedAt}
                                selectedTags={formData.tags}
                                slug={formData.slug}
                                status={formData.status}
                                tags={tags}
                            />
                        </div>
                    </>
                )}

                {/* 预览模式：全宽预览 */}
                {viewMode === 'preview' && (
                    <div className={styles.contentPreview}>
                        <MarkdownPreview
                            categoryName={categoryName}
                            content={formData.content}
                            coverImage={formData.coverImage}
                            publishedAt={formData.publishedAt}
                            tagNames={tagNames}
                            title={formData.title}
                            altText={formData.altText}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
