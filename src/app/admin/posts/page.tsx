/*============================================================================
  page — 文章管理列表页

  客户端组件 PostManagementClient 承接全部交互（搜索/分页/删除），
  服务端仅渲染骨架。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import PostManagementClient from '@/components/modules/admin/post-management-client';

export const metadata: Metadata = {
    title: '文章管理',
};

/*== 后台文章管理页：静态数据，不调 API。 ==*/
export default function AdminPostsPage() {
    return <PostManagementClient />;
}
