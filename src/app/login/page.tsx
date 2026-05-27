import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSessionFromCookies } from '@/lib/auth';
import { APP_ROUTES } from '@/lib/site';
import LoginForm from './login-form';

export const metadata: Metadata = {
    title: '登录 - Zhijian',
};

/*== 公开登录页。 已登录用户直接跳转。 ==*/
export default async function LoginPage() {
    const session = await getSessionFromCookies();

    if (session) {
        redirect(APP_ROUTES.home);
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <LoginForm />
        </main>
    );
}
