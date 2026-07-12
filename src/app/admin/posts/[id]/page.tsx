/*============================================================================
  page — 文章编辑器页

  服务端获取文章、分类、标签数据，传入 PostEditor 客户端组件。
  按文章 ID 生成动态页面标题。
============================================================================*/

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/*== 组件导入 ==*/
import PostEditor from '@/components/modules/admin/post-editor';

/*== 数据与配置 ==*/
import { getPostById } from '@/lib/domain/posts';
import { listCategories } from '@/lib/domain/categories';
import { listTags } from '@/lib/domain/tags';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) return { title: '编辑文章' };

    const post = await getPostById(postId);
    return { title: post ? `编辑：${post.title}` : '文章不存在' };
}

export default async function EditPostPage({ params }: PageProps) {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) return notFound();

    const post = await getPostById(postId);
    if (!post) return notFound();

    const [categories, tags] = await Promise.all([listCategories(), listTags()]);

    return <PostEditor categories={categories} post={post} tags={tags} />;
}
