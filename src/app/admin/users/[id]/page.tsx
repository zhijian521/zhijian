import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import UserForm from '@/app/admin/_components/user-form';
import { getUserById } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface EditUserPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditUserPageProps): Promise<Metadata> {
    const { id } = await params;
    return { title: `编辑用户 #${id} - Zhijian Admin` };
}

/*== 后台编辑用户页。 服务端获取用户数据，传给客户端表单。 ==*/
export default async function EditUserPage({ params }: EditUserPageProps) {
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) notFound();

    const user = await getUserById(userId);
    if (!user) notFound();

    return (
        <div>
            <AdminPageHeader description="修改用户信息、角色、状态或重置密码。" title="编辑用户" />
            <UserForm
                initial={{
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                }}
                mode="edit"
            />
        </div>
    );
}
