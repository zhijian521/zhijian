'use client';

/*============================================================================
  admin-login-card — 后台登录卡片

  负责管理员账号登录、用户名记忆和错误反馈。
  普通用户登录后保留当前页面并提示无后台权限。
============================================================================*/

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { SubmitButton } from '@/components/ui/submit-button';
import { LockIcon, UserIcon } from '@/components/ui/icons';
import { TextInput } from '@/components/ui/text-input';

import { api } from '@/lib/core/http-client';
import { APP_ROUTES, SITE_METADATA, STORAGE_KEYS } from '@/lib/core/site';

import styles from './admin-login-card.module.css';

interface LoginFormState {
    password: string;
    remember: boolean;
    username: string;
}

interface RememberedLoginPayload {
    username: string;
}

interface LoginResponse {
    user: {
        role: 'admin' | 'user';
    };
}

const INITIAL_FORM: LoginFormState = {
    password: '',
    remember: false,
    username: '',
};

const LOGIN_MESSAGE_ID = 'admin-login-message';

function isRememberedLoginPayload(value: unknown): value is RememberedLoginPayload {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return typeof (value as Record<string, unknown>).username === 'string';
}

function removeRememberedLogin() {
    try {
        window.localStorage.removeItem(STORAGE_KEYS.adminRememberedUsername);
    } catch {
        // 浏览器禁用存储时无需清理，登录态由 HttpOnly Cookie 维护
    }
}

export default function AdminLoginCard() {
    const [loginForm, setLoginForm] = useState(INITIAL_FORM);
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        try {
            const savedValue = window.localStorage.getItem(STORAGE_KEYS.adminRememberedUsername);

            if (!savedValue) {
                return;
            }

            const savedLogin: unknown = JSON.parse(savedValue);

            if (!isRememberedLoginPayload(savedLogin) || !savedLogin.username.trim()) {
                removeRememberedLogin();
                return;
            }

            setLoginForm((prev) => ({
                ...prev,
                remember: true,
                username: savedLogin.username,
            }));
        } catch {
            removeRememberedLogin();
        }
    }, []);

    function handleFieldChange<Key extends keyof LoginFormState>(key: Key, value: LoginFormState[Key]) {
        setLoginForm((current) => ({
            ...current,
            [key]: value,
        }));
        setMessage(null);

        if (key === 'remember' && value === false) {
            removeRememberedLogin();
        }
    }

    function persistRememberedLogin() {
        try {
            if (loginForm.remember) {
                window.localStorage.setItem(
                    STORAGE_KEYS.adminRememberedUsername,
                    JSON.stringify({
                        username: loginForm.username.trim(),
                    } satisfies RememberedLoginPayload)
                );
                return;
            }

            removeRememberedLogin();
        } catch {
            // 登录态由 HttpOnly Cookie 维护，本地偏好写入失败不应阻断登录
        }
    }

    async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setMessage(null);
        setIsSubmitting(true);

        const response = await api.post<LoginResponse>('/auth/login', {
            password: loginForm.password,
            username: loginForm.username.trim(),
        });

        if (response.code !== 0) {
            setMessage(response.message || '登录失败，请检查账号和密码。');
            setIsSubmitting(false);
            return;
        }

        if (response.data?.user.role !== 'admin') {
            setMessage('该账号无后台管理权限。');
            setIsSubmitting(false);
            return;
        }

        persistRememberedLogin();
        window.location.assign(APP_ROUTES.admin);
    }

    return (
        <main className={styles.page}>
            <div aria-hidden="true" className={styles.texture} />

            <section className={styles.shell}>
                <header className={styles.brand}>
                    <Image alt="" className={styles.logo} height={56} priority src="/images/logo.webp" width={56} />
                    <h1 className={styles.title}>{SITE_METADATA.adminName}</h1>
                </header>

                <div className={styles.card}>
                    <form
                        aria-busy={isSubmitting}
                        aria-describedby={message ? LOGIN_MESSAGE_ID : undefined}
                        className={styles.form}
                        onSubmit={handleLoginSubmit}
                    >
                        <TextInput
                            autoComplete="username"
                            disabled={isSubmitting}
                            icon={<UserIcon aria-hidden="true" />}
                            id="username"
                            label="用户名"
                            onChange={(event) => handleFieldChange('username', event.target.value)}
                            placeholder="请输入您的用户名"
                            required
                            value={loginForm.username}
                        />

                        <TextInput
                            autoComplete="current-password"
                            disabled={isSubmitting}
                            icon={<LockIcon aria-hidden="true" />}
                            id="password"
                            label="密码"
                            onChange={(event) => handleFieldChange('password', event.target.value)}
                            placeholder="请输入您的密码"
                            required
                            type="password"
                            value={loginForm.password}
                        />

                        <label className={styles.checkboxRow} htmlFor="remember">
                            <input
                                checked={loginForm.remember}
                                className={styles.checkbox}
                                disabled={isSubmitting}
                                id="remember"
                                onChange={(event) => handleFieldChange('remember', event.target.checked)}
                                type="checkbox"
                            />
                            <span>记住用户名</span>
                        </label>

                        <SubmitButton disabled={isSubmitting}>{isSubmitting ? '登录中...' : '登录'}</SubmitButton>

                        <p aria-atomic="true" aria-live="polite" className={styles.message} id={LOGIN_MESSAGE_ID}>
                            {message}
                        </p>
                    </form>
                </div>
            </section>

            <footer className={styles.footer}>
                <span className={styles.copyright}>© 2026 Zhijian. All rights reserved.</span>
            </footer>
        </main>
    );
}
