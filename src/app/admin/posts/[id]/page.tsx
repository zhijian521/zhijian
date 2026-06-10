import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPostById } from '@/lib/posts';
import { listCategories } from '@/lib/categories';
import { listTags } from '@/lib/tags';
import PostEditor from './_components/post-editor';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) return { title: '编辑文章 - Zhijian' };

    const post = await getPostById(postId);
    return { title: post ? `编辑：${post.title} - Zhijian` : '文章不存在 - Zhijian' };
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
