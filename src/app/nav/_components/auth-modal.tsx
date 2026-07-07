'use client';

import { useState, useEffect } from 'react';
import Dialog from '@/components/ui/dialog';

import styles from './auth-modal.module.css';

interface AuthModalProps {
    open: boolean;
    initialTab?: 'login' | 'register';
    onSuccess: () => void;
    onCancel: () => void;
    onLogin: (username: string, password: string) => Promise<void>;
    onRegister: (username: string, email: string, password: string) => Promise<void>;
}

export default function AuthModal({ open, initialTab, onSuccess, onCancel, onLogin, onRegister }: AuthModalProps) {
    const [tab, setTab] = useState<'login' | 'register'>(initialTab ?? 'login');

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

    function switchTab(t: 'login' | 'register') {
        setTab(t);
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
                <button
                    className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
                    onClick={() => switchTab('login')}
                    type="button"
                >
                    登录
                </button>
                <button
                    className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
                    onClick={() => switchTab('register')}
                    type="button"
                >
                    注册
                </button>
            </div>

            <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
                <label className={styles.fieldLabel}>
                    用户名
                    <input
                        className={styles.fieldInput}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="用户名"
                        required
                        type="text"
                        value={username}
                    />
                </label>

                {tab === 'register' && (
                    <label className={styles.fieldLabel}>
                        邮箱
                        <input
                            className={styles.fieldInput}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                            type="email"
                            value={email}
                        />
                    </label>
                )}

                <label className={styles.fieldLabel}>
                    密码
                    <input
                        className={styles.fieldInput}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="至少 6 位"
                        required
                        type="password"
                        value={password}
                    />
                </label>

                {error && <p className={styles.error}>{error}</p>}

                <button className={styles.submitBtn} disabled={loading} type="submit">
                    {loading ? '请稍候…' : tab === 'login' ? '登录' : '注册'}
                </button>
            </form>
        </Dialog>
    );
}
