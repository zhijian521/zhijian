'use client';

import { useState, useEffect } from 'react';

import Dialog from '@/components/ui/dialog';
import { PillSelect } from '@/components/ui/pill-select';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextInput } from '@/components/ui/text-input';

import styles from './auth-modal.module.css';

type AuthTab = 'login' | 'register';

const AUTH_TABS: { value: AuthTab; label: string }[] = [
    { value: 'login', label: '登录' },
    { value: 'register', label: '注册' },
];

interface AuthModalProps {
    open: boolean;
    initialTab?: 'login' | 'register';
    onSuccess: () => void;
    onCancel: () => void;
    onLogin: (username: string, password: string) => Promise<void>;
    onRegister: (username: string, email: string, password: string) => Promise<void>;
}

export default function AuthModal({ open, initialTab, onSuccess, onCancel, onLogin, onRegister }: AuthModalProps) {
    const [tab, setTab] = useState<AuthTab>(initialTab ?? 'login');

    /*-- 弹窗打开时同步 tab --*/
    useEffect(() => {
        if (open && initialTab) setTab(initialTab);
    }, [open, initialTab]);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function reset() {
        setUsername('');
        setEmail('');
        setPassword('');
        setError('');
        setLoading(false);
    }

    function switchTab(nextTab: AuthTab) {
        setTab(nextTab);
        reset();
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onLogin(username, password);
            onSuccess();
            reset();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '登录失败');
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onRegister(username, email, password);
            await onLogin(username, password);
            onSuccess();
            reset();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '注册失败');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={() => {
                onCancel();
                reset();
            }}
            title={tab === 'login' ? '登录' : '注册'}
        >
            <div className={styles.tabs}>
                <PillSelect onChange={switchTab} options={AUTH_TABS} size="small" value={tab} />
            </div>

            <form className={styles.form} onSubmit={tab === 'login' ? handleLogin : handleRegister}>
                <TextInput
                    id="nav-auth-username"
                    label="用户名"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="用户名"
                    required
                    type="text"
                    value={username}
                />

                {tab === 'register' && (
                    <TextInput
                        id="nav-auth-email"
                        label="邮箱"
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="email@example.com"
                        required
                        type="email"
                        value={email}
                    />
                )}

                <TextInput
                    id="nav-auth-password"
                    label="密码"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="至少 6 位"
                    required
                    type="password"
                    value={password}
                />

                {error && <p className={styles.error}>{error}</p>}

                <SubmitButton className={styles.submitBtn} disabled={loading} type="submit">
                    {loading ? '请稍候…' : tab === 'login' ? '登录' : '注册'}
                </SubmitButton>
            </form>
        </Dialog>
    );
}
