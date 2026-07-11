import type { Metadata } from 'next';

import AdminPageHeader from '@/components/modules/admin/page-header';
import UserListClient from '@/app/admin/_components/user-list-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '用户管理',
};

/*== 后台用户列表页。 ==*/
export default function AdminUsersPage() {
    return (
        <div>
            <AdminPageHeader
                description="管理系统中的所有用户账号，包括管理员和普通用户。"
                eyebrow="Users"
                tag="账号管理"
                title="用户管理"
            />
            <UserListClient />
        </div>
    );
}
