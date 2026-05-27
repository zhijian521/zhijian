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

/*== 用户创建/编辑表单：匹配博客表单风格。 ==*/
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
        if (form.password.trim()) body.password = form.password.trim();

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

    const inputClass = 'w-full px-4 py-2.5 border border-[var(--border)] bg-[#fbf9f9] text-sm focus:border-[var(--primary)] focus:outline-none transition-colors';
    const radioActive = 'border-[var(--primary)] bg-[rgba(158,0,39,0.04)] text-[var(--primary)]';
    const radioInactive = 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]';

    return (
        <div>
            <Link
                className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] mb-6 transition-colors"
                href={APP_ROUTES.adminUsers}
            >
                <ArrowLeft className="h-4 w-4" />
                返回用户列表
            </Link>

            <h2 className="font-serif text-xl font-semibold text-[var(--foreground)] mb-6">
                {mode === 'create' ? '新建用户' : `编辑用户：${initial?.username || ''}`}
            </h2>

            <form className="max-w-lg space-y-5" onSubmit={handleSubmit}>
                {/* 用户名 */}
                <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5" htmlFor="username">
                        用户名
                    </label>
                    <input
                        className={inputClass}
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
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5" htmlFor="email">
                        邮箱
                    </label>
                    <input
                        className={inputClass}
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
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5" htmlFor="password">
                        {mode === 'create' ? '密码' : '新密码（留空则不修改）'}
                    </label>
                    <input
                        className={inputClass}
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
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">角色</label>
                    <div className="flex gap-3">
                        {(['admin', 'user'] as const).map((r) => (
                            <label
                                className={`inline-flex items-center gap-2 px-4 py-2 border cursor-pointer text-sm transition-colors ${
                                    form.role === r ? radioActive : radioInactive
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
                                {r === 'admin' ? '管理员' : '普通用户'}
                            </label>
                        ))}
                    </div>
                </div>

                {/* 状态（仅编辑模式） */}
                {mode === 'edit' && (
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">状态</label>
                        <div className="flex gap-3">
                            {(['active', 'disabled'] as const).map((s) => (
                                <label
                                    className={`inline-flex items-center gap-2 px-4 py-2 border cursor-pointer text-sm transition-colors ${
                                        form.status === s ? radioActive : radioInactive
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
                                    {s === 'active' ? '正常' : '已禁用'}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* 提交 */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                        disabled={submitting}
                        type="submit"
                    >
                        <Save className="h-4 w-4" />
                        {submitting ? '保存中...' : mode === 'create' ? '创建用户' : '保存修改'}
                    </button>
                    <Link
                        className="px-5 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                        href={APP_ROUTES.adminUsers}
                    >
                        取消
                    </Link>
                </div>

                {message && (
                    <p className="text-sm text-[var(--primary)] border border-[var(--primary)] bg-[rgba(158,0,39,0.04)] px-4 py-2.5" role="alert">
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}
