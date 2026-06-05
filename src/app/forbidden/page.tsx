import type { Metadata } from 'next';
import Link from 'next/link';

import { APP_ROUTES } from '@/lib/site';

export const metadata: Metadata = {
    title: '403 禁止访问 - Zhijian',
};

/*== 403 页面：非管理员尝试访问后台时展示。 ==*/
export default function ForbiddenPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-6xl mb-4">🚫</p>
                <h1 className="text-2xl font-semibold mb-2">无权访问</h1>
                <p className="text-gray-500 mb-6">你当前的账号没有访问该页面的权限。</p>
                <div className="flex items-center justify-center gap-3">
                    <Link
                        className="px-5 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                        href={APP_ROUTES.home}
                    >
                        返回首页
                    </Link>
                    <Link
                        className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                        href={APP_ROUTES.adminLogin}
                    >
                        切换账号
                    </Link>
                </div>
            </div>
        </main>
    );
}
