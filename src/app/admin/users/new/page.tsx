import type { Metadata } from 'next';

import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import UserForm from '@/app/admin/_components/user-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '新建用户 - Zhijian Admin',
};

/*== 后台新建用户页。 ==*/
export default function AdminUserCreatePage() {
    return (
        <div>
            <AdminPageHeader description="创建新的用户账号，可选择角色和初始密码。" title="新建用户" />
            <UserForm mode="create" />
        </div>
    );
}
