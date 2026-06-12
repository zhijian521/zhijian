import type { Metadata } from 'next';

import { getPublishedPosts } from '@/lib/posts';

import BlogListClient from './_components/blog-list-client';

export const metadata: Metadata = {
    title: '文章 - Zhijian',
};

export const revalidate = 60;

/*== 博客列表页：服务端查库，客户端筛选 ==*/
export default async function BlogListPage() {
    const posts = await getPublishedPosts();

    return <BlogListClient posts={posts} />;
}
