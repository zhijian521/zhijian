'use client';

import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useTransition } from 'react';

import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toDateTimeLocalValue } from '@/lib/post-shared';
import { API_ROUTES, APP_ROUTES } from '@/lib/site';

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

export default function PostEditorForm({ mode, post }: PostEditorFormProps) {
  const [form, setForm] = useState<EditorFormState>(createFormState(post));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 创建与更新共用一套表单，按 mode 决定请求目标与成功后的跳转行为。
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const response =
        mode === 'create'
          ? await fetch(API_ROUTES.adminPosts, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: form.title.trim() || undefined,
              }),
            })
          : await fetch(`${API_ROUTES.adminPosts}/${post?.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...form,
                publishedAt: form.publishedAt || null,
              }),
            });

      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.message || '保存失败，请稍后重试。');
        return;
      }

      if (mode === 'create') {
        const createdPost = payload.data as Post;
        window.location.href = `${APP_ROUTES.adminPosts}/${createdPost.id}`;
        return;
      }

      setMessage(payload.message || '保存成功。');
    });
  }

  return (
    <>
      <AdminPageHeader
        action={
          <Button asChild className='rounded-xl' variant='outline'>
            <Link href={APP_ROUTES.adminPosts}>
              <ArrowLeft className='h-4 w-4' />
              返回文章管理
            </Link>
          </Button>
        }
        description={mode === 'create' ? '先创建草稿，再进入详情页继续完善内容与发布配置。' : '在这里编辑文章正文、摘要、Slug 与发布状态。'}
        eyebrow={mode === 'create' ? 'New Post' : 'Post Editor'}
        tag={mode === 'create' ? '草稿创建' : post?.status === 'published' ? '已发布' : '草稿'}
        title={mode === 'create' ? '新建文章' : `编辑：${post?.title ?? '文章'}`}
      />

      <Card className='admin-panel border-slate-200 bg-white/92 shadow-sm'>
        <CardContent className='p-6'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div className='grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px]'>
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>文章标题</Label>
                  <Input
                    className='admin-input'
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
                    <div className='space-y-2'>
                      <Label htmlFor='summary'>文章摘要</Label>
                      <Textarea
                        className='admin-input min-h-28'
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

                    <div className='space-y-2'>
                      <Label htmlFor='content'>正文内容</Label>
                      <Textarea
                        className='admin-input min-h-[480px]'
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

              <div className='space-y-6'>
                <div className='admin-panel-muted space-y-4'>
                  <p className='text-sm font-medium text-slate-950'>发布信息</p>

                  {mode === 'edit' ? (
                    <>
                      <div className='space-y-2'>
                        <Label htmlFor='slug'>Slug</Label>
                        <Input
                          className='admin-input'
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

                      <div className='space-y-2'>
                        <Label htmlFor='status'>发布状态</Label>
                        <select
                          className='admin-input flex h-10 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20'
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

                      <div className='space-y-2'>
                        <Label htmlFor='publishedAt'>发布时间</Label>
                        <Input
                          className='admin-input'
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
                    <p className='text-sm leading-7 text-slate-600'>创建成功后将自动跳转到文章编辑页，在那里继续完善 Slug、摘要、正文和发布配置。</p>
                  )}
                </div>

                <div className='admin-panel-muted space-y-4'>
                  <p className='text-sm font-medium text-slate-950'>保存说明</p>
                  <p className='text-sm leading-7 text-slate-600'>
                    {message || (mode === 'create' ? '创建成功后会自动进入对应文章编辑页。' : '点击保存后会直接更新数据库中的文章内容。')}
                  </p>

                  <Button className='w-full rounded-xl' disabled={isPending} type='submit'>
                    <Save className='h-4 w-4' />
                    {isPending ? '保存中...' : mode === 'create' ? '创建文章' : '保存修改'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
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
