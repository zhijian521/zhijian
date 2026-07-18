/*============================================================================
  page — 用户管理页

  服务端读取用户首屏数据并渲染页面头部，
  UserListClient 承接后续搜索、分页和 CRUD 交互。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import AdminPageHeader from '@/components/modules/admin/page-header';
import UserListClient from '@/components/modules/admin/user-list-client';

/*== 数据与配置 ==*/
import { listUsers } from '@/lib/core/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '用户管理',
};

/*== 后台用户列表页。 ==*/
export default async function AdminUsersPage() {
    const result = await listUsers({ page: 1, pageSize: 10 });
    const initialData = {
        data: result.users.map(({ id, username, email, role, status, created_at }) => ({
            id,
            username,
            email,
            role,
            status,
            created_at: created_at.toISOString(),
        })),
        total: result.total,
    };

    return (
        <div>
            <AdminPageHeader
                description="管理系统中的所有用户账号，包括管理员和普通用户。"
                eyebrow="Users"
                tag="账号管理"
                title="用户管理"
            />
            <UserListClient initialData={initialData} />
        </div>
    );
}
