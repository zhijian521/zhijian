'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { toDateTimeLocalValue } from '@/lib/post-shared';
import { APP_ROUTES } from '@/lib/site';
import { api } from '@/lib/http-client';
import styles from './post-editor-form.module.css';

type PostStatus = 'draft' | 'published';

interface Post {
    id: number;
    slug: string;
    title: string;
    summary: string;
    content: string;
    status: PostStatus;
    publishedAt: string | null;
}

interface PostEditorFormProps {
    mode: 'create' | 'edit';
    post?: Post;
}

interface EditorFormState {
    title: string;
    slug: string;
    summary: string;
    content: string;
    status: PostStatus;
    publishedAt: string;
}

const EMPTY_FORM: EditorFormState = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    status: 'draft',
    publishedAt: '',
};

/*== 文章编辑器表单：创建与编辑共用一套表单，按 mode 决定请求目标与成功后的跳转行为。 ==*/
export default function PostEditorForm({ mode, post }: PostEditorFormProps) {
    const [form, setForm] = useState<EditorFormState>(createFormState(post));
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);
        setIsError(false);

        startTransition(async () => {
            const res =
                mode === 'create'
                    ? await api.post<Post>('/admin/posts', { title: form.title.trim() || undefined })
                    : await api.patch<Post>(`/admin/posts/${post?.id}`, {
                            ...form,
                            publishedAt: form.publishedAt || null,
                        });

            if (res.code !== 0) {
                setMessage(res.message || '保存失败，请稍后重试。');
                setIsError(true);
                return;
            }

            if (mode === 'create') {
                window.location.href = `${APP_ROUTES.adminPosts}/${res.data!.id}`;
                return;
            }

            setMessage(res.message || '保存成功。');
        });
    }

    return (
        <>
            <AdminPageHeader
                action={
                    <Link className={styles.backLink} href={APP_ROUTES.adminPosts}>
                        <ArrowLeftIcon className={styles.backIcon} />
                        返回文章管理
                    </Link>
                }
                description={mode === 'create' ? '先创建草稿，再进入详情页继续完善内容与发布配置。' : '在这里编辑文章正文、摘要、Slug 与发布状态。'}
                eyebrow={mode === 'create' ? 'New Post' : 'Post Editor'}
                tag={mode === 'create' ? '草稿创建' : post?.status === 'published' ? '已发布' : '草稿'}
                title={mode === 'create' ? '新建文章' : `编辑：${post?.title ?? '文章'}`}
            />

            <div className={`${styles.panel} admin-panel`}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.grid}>
                        <div className={styles.main}>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor='title'>文章标题</label>
                                <input
                                    className={`${styles.input} admin-input`}
                                    id='title'
                                    onChange={(event) => {
                                        setForm((current) => ({
                                            ...current,
                                            title: event.target.value,
                                        }));
                                    }}
                                    placeholder='输入标题后即可创建草稿'
                                    value={form.title}
                                />
                            </div>

                            {mode === 'edit' ? (
                                <>
                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor='summary'>文章摘要</label>
                                        <textarea
                                            className={`${styles.textarea} admin-input`}
                                            id='summary'
                                            onChange={(event) => {
                                                setForm((current) => ({
                                                    ...current,
                                                    summary: event.target.value,
                                                }));
                                            }}
                                            value={form.summary}
                                        />
                                    </div>

                                    <div className={styles.field}>
                                        <label className={styles.label} htmlFor='content'>正文内容</label>
                                        <textarea
                                            className={`${styles.textareaLarge} admin-input`}
                                            id='content'
                                            onChange={(event) => {
                                                setForm((current) => ({
                                                    ...current,
                                                    content: event.target.value,
                                                }));
                                            }}
                                            value={form.content}
                                        />
                                    </div>
                                </>
                            ) : null}
                        </div>

                        <div className={styles.sidebar}>
                            <div className={`${styles.sideSection} admin-panel-muted`}>
                                <p className={styles.sideTitle}>发布信息</p>

                                {mode === 'edit' ? (
                                    <>
                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor='slug'>Slug</label>
                                            <input
                                                className={`${styles.input} admin-input`}
                                                id='slug'
                                                onChange={(event) => {
                                                    setForm((current) => ({
                                                        ...current,
                                                        slug: event.target.value,
                                                    }));
                                                }}
                                                value={form.slug}
                                            />
                                        </div>

                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor='status'>发布状态</label>
                                            <select
                                                className={`${styles.select} admin-input`}
                                                id='status'
                                                onChange={(event) => {
                                                    setForm((current) => ({
                                                        ...current,
                                                        status: event.target.value as PostStatus,
                                                    }));
                                                }}
                                                value={form.status}
                                            >
                                                <option value='draft'>草稿</option>
                                                <option value='published'>已发布</option>
                                            </select>
                                        </div>

                                        <div className={styles.field}>
                                            <label className={styles.label} htmlFor='publishedAt'>发布时间</label>
                                            <input
                                                className={`${styles.input} admin-input`}
                                                id='publishedAt'
                                                onChange={(event) => {
                                                    setForm((current) => ({
                                                        ...current,
                                                        publishedAt: event.target.value,
                                                    }));
                                                }}
                                                type='datetime-local'
                                                value={form.publishedAt}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.hintText}>创建成功后将自动跳转到文章编辑页，在那里继续完善 Slug、摘要、正文和发布配置。</p>
                                )}
                            </div>

                            <div className={`${styles.sideSection} admin-panel-muted`}>
                                <p className={styles.sideTitle}>保存说明</p>
                                <p className={message ? (isError ? styles.messageError : styles.messageSuccess) : styles.hintText}>
                                    {message || (mode === 'create' ? '创建成功后会自动进入对应文章编辑页。' : '点击保存后会直接更新数据库中的文章内容。')}
                                </p>

                                <button className={styles.submitBtn} disabled={isPending} type='submit'>
                                    <SaveIcon className={styles.submitIcon} />
                                    {isPending ? '保存中...' : mode === 'create' ? '创建文章' : '保存修改'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

function createFormState(post?: Post): EditorFormState {
    if (!post) {
        return EMPTY_FORM;
    }

    return {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        status: post.status,
        publishedAt: toDateTimeLocalValue(post.publishedAt),
    };
}
