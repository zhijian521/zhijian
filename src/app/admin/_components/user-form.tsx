'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { APP_ROUTES } from '@/lib/site';
import { api } from '@/lib/http-client';
import styles from './user-form.module.css';

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

    return (
        <div>
            <Link className={styles.backLink} href={APP_ROUTES.adminUsers}>
                <ArrowLeftIcon className={styles.backIcon} />
                返回用户列表
            </Link>

            <h2 className={styles.pageTitle}>
                {mode === 'create' ? '新建用户' : `编辑用户：${initial?.username || ''}`}
            </h2>

            <form className={styles.form} onSubmit={handleSubmit}>
                {/* 用户名 */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="username">用户名</label>
                    <input
                        className={styles.input}
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
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">邮箱</label>
                    <input
                        className={styles.input}
                        id="email"
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="user@example.com"
                        required
                        type="email"
                        value={form.email}
                    />
                </div>

                {/* 密码 */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">
                        {mode === 'create' ? '密码' : '新密码（留空则不修改）'}
                    </label>
                    <input
                        className={styles.input}
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
                <div className={styles.field}>
                    <label className={styles.labelInline}>角色</label>
                    <div className={styles.radioGroup}>
                        {(['admin', 'user'] as const).map((r) => (
                            <label
                                className={form.role === r ? styles.radioActive : styles.radioInactive}
                                key={r}
                            >
                                <input
                                    checked={form.role === r}
                                    className={styles.radioInput}
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
                    <div className={styles.field}>
                        <label className={styles.labelInline}>状态</label>
                        <div className={styles.radioGroup}>
                            {(['active', 'disabled'] as const).map((s) => (
                                <label
                                    className={form.status === s ? styles.radioActive : styles.radioInactive}
                                    key={s}
                                >
                                    <input
                                        checked={form.status === s}
                                        className={styles.radioInput}
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
                <div className={styles.submitRow}>
                    <button className={styles.submitBtn} disabled={submitting} type="submit">
                        <SaveIcon className={styles.submitIcon} />
                        {submitting ? '保存中...' : mode === 'create' ? '创建用户' : '保存修改'}
                    </button>
                    <Link className={styles.cancelLink} href={APP_ROUTES.adminUsers}>
                        取消
                    </Link>
                </div>

                {message && (
                    <p className={styles.message} role="alert">
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}