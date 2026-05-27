'use client';

import { Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { APP_ROUTES } from '@/lib/site';
import { api } from '@/lib/http-client';

/*== 公开登录表单组件。 ==*/
export default function LoginForm() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || APP_ROUTES.home;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);

        startTransition(async () => {
            const res = await api.post<{ user: { role: string } }>('/auth/login', {
                username: username.trim(),
                password,
            });

            if (res.code !== 0) {
                setMessage(res.message || '登录失败。');
                return;
            }

            // 根据角色跳转
            if (res.data?.user?.role === 'admin') {
                window.location.href = APP_ROUTES.admin;
            } else {
                window.location.href = redirectTo;
            }
        });
    }

    return (
        <div className="w-full max-w-sm mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Logo */}
            <div className="text-center mb-8">
                <img
                    alt="Zhijian"
                    className="w-14 h-14 mx-auto mb-3 rounded-xl"
                    src="/images/logo.png"
                />
                <h1 className="text-xl font-semibold">登录 Zhijian</h1>
                <p className="text-sm text-gray-500 mt-1">欢迎回来</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="login-username">
                        用户名
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            autoComplete="username"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                            id="login-username"
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="请输入用户名"
                            required
                            type="text"
                            value={username}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="login-password">
                        密码
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            autoComplete="current-password"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                            id="login-password"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            required
                            type="password"
                            value={password}
                        />
                    </div>
                </div>

                <button
                    className="w-full py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    disabled={isPending}
                    type="submit"
                >
                    {isPending ? '登录中...' : '登录'}
                </button>

                {message && (
                    <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg" role="alert">
                        {message}
                    </p>
                )}
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                还没有账号？{' '}
                <Link className="text-black font-medium hover:underline" href={APP_ROUTES.register}>
                    立即注册
                </Link>
            </p>
        </div>
    );
}
