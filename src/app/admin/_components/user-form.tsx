'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { APP_ROUTES } from '@/lib/site';
import { api } from '@/lib/http-client';

interface UserFormData {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    status: 'active' | 'disabled';
}

interface UserFormProps {
    mode: 'create' | 'edit';
    initial?: Partial<UserFormData> & { id?: number };
}

/*== 用户创建/编辑表单。 ==*/
export default function UserForm({ mode, initial }: UserFormProps) {
    const router = useRouter();
    const [form, setForm] = useState<UserFormData>({
        username: initial?.username || '',
        email: initial?.email || '',
        password: '',
        role: initial?.role || 'user',
        status: initial?.status || 'active',
    });
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleChange<K extends keyof UserFormData>(key: K, value: UserFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setMessage(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        const body: Record<string, string> = {
            username: form.username.trim(),
            email: form.email.trim(),
            role: form.role,
            status: form.status,
        };

        if (form.password.trim()) {
            body.password = form.password.trim();
        }

        try {
            const res =
                mode === 'create'
                    ? await api.post('/admin/users', body)
                    : await api.put(`/admin/users/${initial!.id}`, body);

            if (res.code !== 0) {
                setMessage(res.message || '操作失败。');
                return;
            }

            router.push(APP_ROUTES.adminUsers);
        } catch {
            setMessage('请求失败，请稍后重试。');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            {/* 返回 */}
            <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                href={APP_ROUTES.adminUsers}
            >
                <ArrowLeft className="h-4 w-4" />
                返回用户列表
            </Link>

            <h2 className="text-xl font-semibold mb-6">
                {mode === 'create' ? '新建用户' : `编辑用户：${initial?.username || ''}`}
            </h2>

            <form className="max-w-lg space-y-5" onSubmit={handleSubmit}>
                {/* 用户名 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="username">
                        用户名
                    </label>
                    <input
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                        id="username"
                        maxLength={50}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="2-50 个字符"
                        required
                        type="text"
                        value={form.username}
                    />
                </div>

                {/* 邮箱 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                        邮箱
                    </label>
                    <input
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                        id="email"
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="user@example.com"
                        required
                        type="email"
                        value={form.email}
                    />
                </div>

                {/* 密码 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                        {mode === 'create' ? '密码' : '新密码（留空则不修改）'}
                    </label>
                    <input
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
                        id="password"
                        minLength={6}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder={mode === 'create' ? '至少 6 个字符' : '留空不修改密码'}
                        required={mode === 'create'}
                        type="password"
                        value={form.password}
                    />
                </div>

                {/* 角色 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">角色</label>
                    <div className="flex gap-3">
                        {(['admin', 'user'] as const).map((r) => (
                            <label
                                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm cursor-pointer transition-colors ${
                                    form.role === r
                                        ? 'border-black bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                key={r}
                            >
                                <input
                                    checked={form.role === r}
                                    className="sr-only"
                                    name="role"
                                    onChange={() => handleChange('role', r)}
                                    type="radio"
                                    value={r}
                                />
                                {r === 'admin' ? '🔧 管理员' : '👤 普通用户'}
                            </label>
                        ))}
                    </div>
                </div>

                {/* 状态（仅编辑模式） */}
                {mode === 'edit' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
                        <div className="flex gap-3">
                            {(['active', 'disabled'] as const).map((s) => (
                                <label
                                    className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm cursor-pointer transition-colors ${
                                        form.status === s
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    key={s}
                                >
                                    <input
                                        checked={form.status === s}
                                        className="sr-only"
                                        name="status"
                                        onChange={() => handleChange('status', s)}
                                        type="radio"
                                        value={s}
                                    />
                                    {s === 'active' ? '✅ 正常' : '🚫 已禁用'}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* 提交 */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        disabled={submitting}
                        type="submit"
                    >
                        <Save className="h-4 w-4" />
                        {submitting ? '保存中...' : mode === 'create' ? '创建用户' : '保存修改'}
                    </button>
                    <Link
                        className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                        href={APP_ROUTES.adminUsers}
                    >
                        取消
                    </Link>
                </div>

                {message && (
                    <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg" role="alert">
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}
