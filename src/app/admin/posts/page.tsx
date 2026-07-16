/*============================================================================
  page — 文章管理列表页

  客户端组件 PostManagementClient 承接全部交互（搜索/分页/删除），
  服务端仅渲染骨架。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import PostManagementClient from '@/components/modules/admin/post-management-client';
import { listAdminPosts } from '@/lib/domain/posts';

export const metadata: Metadata = {
    title: '文章管理',
};

interface AdminPostsPageProps {
    searchParams: Promise<{ keyword?: string; page?: string; pageSize?: string; status?: string }>;
}

/*== 后台文章管理页：服务端提供首屏列表，客户端仅处理后续筛选和操作。 ==*/
export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
    const params = await searchParams;
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 10));
    const status = params.status === 'draft' || params.status === 'published' ? params.status : 'all';
    const initialData = await listAdminPosts({
        keyword: params.keyword,
        page,
        pageSize,
        status,
    });

    return (
        <PostManagementClient
            initialData={initialData}
            initialFilters={{ keyword: params.keyword || '', page, pageSize, status }}
        />
    );
}
