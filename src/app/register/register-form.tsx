'use client';

import { Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { APP_ROUTES } from '@/lib/site';
import { api } from '@/lib/http-client';

/*== 公开注册表单组件。 仅允许注册 user 角色。 ==*/
export default function RegisterForm() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleChange(key: string, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setMessage(null);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);

        if (form.password !== form.confirmPassword) {
            setMessage('两次输入的密码不一致。');
            return;
        }

        startTransition(async () => {
            const res = await api.post('/auth/register', {
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            if (res.code !== 0) {
                setMessage(res.message || '注册失败。');
                return;
            }

            // 注册成功，跳转到登录页
            router.push(`${APP_ROUTES.login}?registered=1`);
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
                <h1 className="text-xl font-semibold">注册 Zhijian</h1>
                <p className="text-sm text-gray-500 mt-1">创建你的账号</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-username">
                        用户名
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            autoComplete="username"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                            id="reg-username"
                            maxLength={50}
                            onChange={(e) => handleChange('username', e.target.value)}
                            placeholder="2-50 个字符"
                            required
                            type="text"
                            value={form.username}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-email">
                        邮箱
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            autoComplete="email"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                            id="reg-email"
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="user@example.com"
                            required
                            type="email"
                            value={form.email}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-password">
                        密码
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            autoComplete="new-password"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                            id="reg-password"
                            minLength={6}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="至少 6 个字符"
                            required
                            type="password"
                            value={form.password}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-confirm-password">
                        确认密码
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            autoComplete="new-password"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                            id="reg-confirm-password"
                            minLength={6}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            placeholder="再次输入密码"
                            required
                            type="password"
                            value={form.confirmPassword}
                        />
                    </div>
                </div>

                <button
                    className="w-full py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    disabled={isPending}
                    type="submit"
                >
                    {isPending ? '注册中...' : '注册'}
                </button>

                {message && (
                    <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg" role="alert">
                        {message}
                    </p>
                )}
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                已有账号？{' '}
                <Link className="text-black font-medium hover:underline" href={APP_ROUTES.login}>
                    立即登录
                </Link>
            </p>
        </div>
    );
}
