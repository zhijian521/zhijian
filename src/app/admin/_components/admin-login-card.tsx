'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';

import { UserIcon, LockIcon } from '@/components/ui/icons';
import { APP_ROUTES, STORAGE_KEYS } from '@/lib/core/site';
import { api } from '@/lib/core/http-client';
import { TextInput } from '@/components/ui/text-input';
import { SubmitButton } from '@/components/ui/submit-button';
import styles from './admin-login-card.module.css';

interface LoginFormState {
    password: string;
    remember: boolean;
    username: string;
}

interface RememberedLoginPayload {
    username: string;
}

const INITIAL_FORM: LoginFormState = {
    password: '',
    remember: false,
    username: '',
};

/*== 后台登录页主体：使用直角视觉，同时支持本地记住密码回填。 ==*/
export default function AdminLoginCard() {
    const [loginForm, setLoginForm] = useState(INITIAL_FORM);
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        try {
            const savedValue = window.localStorage.getItem(STORAGE_KEYS.adminRememberedUsername);

            if (!savedValue) {
                return;
            }

            const savedLogin = JSON.parse(savedValue) as RememberedLoginPayload;

            if (!savedLogin.username) {
                window.localStorage.removeItem(STORAGE_KEYS.adminRememberedUsername);
                return;
            }

            setLoginForm((prev) => ({
                ...prev,
                remember: true,
                username: savedLogin.username,
            }));
        } catch {
            window.localStorage.removeItem(STORAGE_KEYS.adminRememberedUsername);
        }
    }, []);

    function handleFieldChange<Key extends keyof LoginFormState>(key: Key, value: LoginFormState[Key]) {
        setLoginForm((current) => ({
            ...current,
            [key]: value,
        }));

        if (key === 'remember' && value === false) {
            window.localStorage.removeItem(STORAGE_KEYS.adminRememberedUsername);
        }
    }

    function persistRememberedLogin() {
        if (loginForm.remember) {
            window.localStorage.setItem(
                STORAGE_KEYS.adminRememberedUsername,
                JSON.stringify({
                    username: loginForm.username.trim(),
                } satisfies RememberedLoginPayload)
            );
        } else {
            window.localStorage.removeItem(STORAGE_KEYS.adminRememberedUsername);
        }
    }

    function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);

        startTransition(async () => {
            const res = await api.post<{ user: { role: string } }>('/auth/login', {
                password: loginForm.password,
                username: loginForm.username.trim(),
            });

            if (res.code !== 0) {
                setMessage(res.message || '登录失败，请检查账号和密码。');
                return;
            }

            // 非管理员无法进入后台
            if (res.data?.user?.role !== 'admin') {
                setMessage('该账号无后台管理权限。');
                return;
            }

            persistRememberedLogin();
            window.location.href = APP_ROUTES.admin;
        });
    }

    return (
        <main className={styles.page}>
            <div aria-hidden="true" className={styles.texture}>
                <div className={styles.textureGlow} />
            </div>

            <section className={styles.shell}>
                <header className={styles.brand}>
                    <Image alt="Zhijian Logo" className={styles.logo} height={56} priority src="/images/logo.webp" width={56} />
                    <h1 className={styles.title}>Zhijian Admin</h1>
                </header>

                <section className={styles.card} aria-label="后台登录表单">
                    <form className={styles.form} onSubmit={handleLoginSubmit}>
                        <TextInput
                            icon={<UserIcon />}
                            id="username"
                            label="用户名"
                            onChange={(event) => handleFieldChange('username', event.target.value)}
                            placeholder="请输入您的用户名"
                            required
                            autoComplete="username"
                            value={loginForm.username}
                        />

                        <TextInput
                            icon={<LockIcon />}
                            id="password"
                            label="密码"
                            onChange={(event) => handleFieldChange('password', event.target.value)}
                            placeholder="请输入您的密码"
                            required
                            autoComplete={loginForm.remember ? 'current-password' : 'off'}
                            type="password"
                            value={loginForm.password}
                        />

                        <label className={styles.checkboxRow} htmlFor="remember">
                            <input checked={loginForm.remember} className={styles.checkbox} id="remember" onChange={(event) => handleFieldChange('remember', event.target.checked)} type="checkbox" />
                            <span>记住用户名</span>
                        </label>

                        <SubmitButton disabled={isPending}>{isPending ? '登录中...' : '登录'}</SubmitButton>

                        <p aria-live="polite" className={styles.message}>
                            {message}
                        </p>
                    </form>
                </section>
            </section>

            <footer className={styles.footer}>
                <span className={styles.copyright}>© 2026 Zhijian. All rights reserved.</span>
            </footer>
        </main>
    );
}
