import type { Metadata } from 'next';

import { createPost } from '@/lib/posts';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: '新建文章 - Zhijian',
};

export default async function NewPostPage() {
    const post = await createPost({
        slug: `draft-${Date.now()}`,
        title: '无标题草稿',
        summary: '',
        content: '',
    });

    if (post) {
        redirect(`/admin/posts/${post.id}`);
    }

    return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            创建文章失败，请返回重试。
        </div>
    );
}
