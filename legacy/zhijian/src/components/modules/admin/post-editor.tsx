'use client';

/*============================================================================
  post-editor — 全屏文章编辑器

  统一管理文章表单、自动保存与发布状态，组合元数据面板、
  Markdown 编辑器和复用真实详情结构的文章预览。
============================================================================*/

import { useState, useEffect, useRef, useCallback } from 'react';

import type { Post, PostStatus } from '@/lib/domain/post-shared';
import type { Category } from '@/lib/domain/categories';
import type { Tag } from '@/lib/domain/tags';
import { api } from '@/lib/core/http-client';
import { toast } from '@/components/ui/toast';
import { APP_ROUTES } from '@/lib/core/site';

import { EditorToolbar, type ViewMode } from './editor-toolbar';
import { MarkdownPreview } from './markdown-preview';
import { PostEditorContent, PostEditorMetadata } from './post-editor-content';

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

/*== 当前时间的 datetime-local 格式 ==*/
function nowDateTimeLocal(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
    const saveQueueRef = useRef(Promise.resolve(false));
    const saveVersionRef = useRef(0);
    /* 用 ref 追踪最新 formData，避免异步回调中闭包捕获过时值 */
    const formDataRef = useRef(formData);
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const saveDraft = useCallback(
        async (data: FormData, version: number): Promise<boolean> => {
            if (version !== saveVersionRef.current) return false;

            setIsSaving(true);
            setSaveStatus('saving');
            try {
                const res = await api.patch<{ post: Post }>(`/admin/posts/${post.id}`, {
                    ...data,
                    publishedAt: data.publishedAt || null,
                });
                if (version !== saveVersionRef.current) return false;

                if (res.code === 0) {
                    setSaveStatus('saved');
                    return true;
                }

                setSaveStatus('unsaved');
                toast.error(res.message || '自动保存失败');
            } catch {
                if (version === saveVersionRef.current) setSaveStatus('unsaved');
            } finally {
                if (version === saveVersionRef.current) setIsSaving(false);
            }

            return false;
        },
        [post.id]
    );

    const enqueueSave = useCallback(
        (data: FormData) => {
            const version = ++saveVersionRef.current;
            const nextSave = saveQueueRef.current.catch(() => false).then(() => saveDraft(data, version));
            saveQueueRef.current = nextSave;
            return nextSave;
        },
        [saveDraft]
    );

    const scheduleSave = useCallback(
        (newData: FormData) => {
            setSaveStatus('unsaved');
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                enqueueSave(newData);
            }, 3000);
        },
        [enqueueSave]
    );

    function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
        let newData = { ...formData, [key]: value };
        // 切换为已发布且无发布时间时，自动填充当前时间
        if (key === 'status' && value === 'published' && !newData.publishedAt) {
            newData = { ...newData, publishedAt: nowDateTimeLocal() };
        }
        // 删除封面图时同时清空替代文本
        if (key === 'coverImage' && value === null) {
            newData.altText = null;
        }
        setFormData(newData);
        scheduleSave(newData);
    }

    /* 手动保存 */
    const handleManualSave = useCallback(async () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        await enqueueSave(formDataRef.current);
    }, [enqueueSave]);

    /* 发布 / 取消发布 */
    const handleTogglePublish = useCallback(async () => {
        const current = formDataRef.current;
        const newStatus: PostStatus = current.status === 'published' ? 'draft' : 'published';
        const newData = { ...current, status: newStatus };
        setFormData(newData);

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        const saved = await enqueueSave(newData);
        if (!saved) return;

        if (newStatus === 'published') {
            toast.success('文章已发布');
        } else {
            toast.success('文章已取消发布');
        }
    }, [enqueueSave]);

    /* 返回文章列表：优先关闭当前标签页；若浏览器阻止（非脚本打开的标签页）则延迟跳转。 */
    const handleBack = useCallback(() => {
        window.close();
        // window.close() 成功时标签页已关闭，setTimeout 不会执行
        // 失败时（用户手动打开的标签页），200ms 后跳转回列表页
        setTimeout(() => {
            window.location.href = APP_ROUTES.adminPosts;
        }, 200);
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

    /* 预览直接消费文章模型，确保与博客详情页走同一渲染链。 */
    const categoryName = formData.categoryId
        ? categories.find((category) => category.id === formData.categoryId)?.name
        : undefined;
    const tagNames = formData.tags
        .map((id) => tags.find((tag) => tag.id === id))
        .filter((tag): tag is Tag => tag !== undefined)
        .map(({ id, name, slug }) => ({ id, name, slug }));
    const previewPost: Post = {
        ...post,
        ...formData,
        categoryName,
        tagNames,
    };

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
                {/* 分栏模式：元数据面板（左）+ 编辑/预览（右） */}
                {viewMode === 'split' && (
                    <>
                        <PostEditorMetadata
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

                        <div className={styles.contentSplit}>
                            <PostEditorContent
                                content={formData.content}
                                fullWidth={false}
                                onContentChange={(value) => updateField('content', value)}
                                onSummaryChange={(value) => updateField('summary', value)}
                                onTitleChange={(value) => updateField('title', value)}
                                summary={formData.summary}
                                title={formData.title}
                            />

                            {/* 预览区 */}
                            <div className={styles.previewPane}>
                                <MarkdownPreview post={previewPost} />
                            </div>
                        </div>
                    </>
                )}

                {/* 编辑模式：元数据面板（左）+ 全宽编辑（右） */}
                {viewMode === 'edit' && (
                    <>
                        <PostEditorMetadata
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

                        <PostEditorContent
                            content={formData.content}
                            fullWidth
                            onContentChange={(value) => updateField('content', value)}
                            onSummaryChange={(value) => updateField('summary', value)}
                            onTitleChange={(value) => updateField('title', value)}
                            summary={formData.summary}
                            title={formData.title}
                        />
                    </>
                )}

                {/* 预览模式：全宽预览 */}
                {viewMode === 'preview' && (
                    <div className={styles.contentPreview}>
                        <MarkdownPreview post={previewPost} />
                    </div>
                )}
            </div>
        </div>
    );
}
