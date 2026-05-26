import type { Metadata } from 'next';

import BlogListClient from './_components/blog-list-client';

export const metadata: Metadata = {
    title: '文章 - Zhijian',
};

/*== 博客列表页 ==*/
export default function BlogListPage() {
    return <BlogListClient />;
}
