/*============================================================================
  page — 文章管理列表页

  服务端根据 URL 获取首屏列表并渲染页面头部，
  PostManagementClient 承接后续搜索、分页和管理交互。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import AdminPageHeader from '@/components/modules/admin/page-header';
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
        <>
            <AdminPageHeader
                description="集中查看全部文章，支持关键词搜索、状态筛选和快速进入编辑页。"
                eyebrow="Posts"
                title="文章管理"
            />
            <PostManagementClient
                initialData={initialData}
                initialFilters={{ keyword: params.keyword || '', page, pageSize, status }}
            />
        </>
    );
}
