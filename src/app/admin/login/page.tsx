/*============================================================================
  login — 后台登录页

  已登录 admin 重定向 /admin，普通用户重定向首页。
  未登录渲染 AdminLoginCard 登录表单。
============================================================================*/

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

/*== 组件导入 ==*/
import AdminLoginCard from '@/components/modules/admin/admin-login-card';

/*== 数据与配置 ==*/
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
