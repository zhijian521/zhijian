/*============================================================================
  login — 后台登录页

  已登录按角色分流：
  - admin -> /admin
  - other -> /

  未登录渲染登录表单。
============================================================================*/

import type { Metadata } from 'next';

import { redirect } from 'next/navigation';

import AdminLoginCard from '@/components/modules/admin/admin-login-card';

import { getSessionFromCookies, validateSession } from '@/lib/core/auth';
import { APP_ROUTES } from '@/lib/core/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '后台登录',
};

export default async function AdminLoginPage() {
    // 查询 Session（会校验数据库，禁用/删除用户视为未登录）
    const session = await validateSession(await getSessionFromCookies());

    if (session) {
        if (session.role === 'admin') {
            redirect(APP_ROUTES.admin);
        }

        redirect(APP_ROUTES.home);
    }

    return <AdminLoginCard />;
}
