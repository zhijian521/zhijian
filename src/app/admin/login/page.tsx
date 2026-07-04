import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import AdminLoginCard from '@/app/admin/_components/admin-login-card';
import { getSessionFromCookies } from '@/lib/core/auth';
import { APP_ROUTES } from '@/lib/core/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Login',
};

/*== 后台登录页：已登录管理员直接进入后台，普通用户跳转首页。 ==*/
export default async function AdminLoginPage() {
    const session = await getSessionFromCookies();

    if (session) {
        if (session.role === 'admin') {
            redirect(APP_ROUTES.admin);
        }
        redirect(APP_ROUTES.home);
    }

    return <AdminLoginCard />;
}
