import type { Metadata } from 'next';

import PostManagementClient from '@/app/admin/_components/post-management-client';

export const metadata: Metadata = {
    title: '文章管理',
};

/*== 后台文章管理页：静态数据，不调 API。 ==*/
export default function AdminPostsPage() {
    return <PostManagementClient />;
}
