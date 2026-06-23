'use client';

import { useState } from 'react';

import { SettingsIcon } from '@/components/ui/icons';
import { syncLocalToServer, clearLocalNavData } from '@/lib/nav-storage';

import AuthModal from './auth-modal';

import styles from './settings-section.module.css';

interface AuthUser {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface SettingsSectionProps {
    user: AuthUser | null;
    isLoggedIn: boolean;
    loading: boolean;
    onLogin: (username: string, password: string) => Promise<void>;
    onRegister: (username: string, email: string, password: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onAuthChange?: () => void;
}

export default function SettingsSection({ user, isLoggedIn, loading, onLogin, onRegister, onLogout, onAuthChange }: SettingsSectionProps) {
    const [showAuthModal, setShowAuthModal] = useState(false);

    async function handleAuthSuccess() {
        setShowAuthModal(false);
        /*-- 登录成功后同步本地数据到数据库 --*/
        try {
            await syncLocalToServer();
        } catch { /* sync 失败不阻塞，数据库有数据时会被 409 拒绝 */ }
        onAuthChange?.();
    }

    async function handleLogout() {
        await onLogout();
        clearLocalNavData();
        onAuthChange?.();
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <SettingsIcon className={styles.headerIcon} />
                <h2 className={styles.title}>设置</h2>
            </div>

            {loading ? (
                <p className={styles.hint}>加载中…</p>
            ) : isLoggedIn && user ? (
                <div className={styles.userInfo}>
                    <p className={styles.username}>{user.username}</p>
                    <p className={styles.email}>{user.email}</p>
                    <button className={styles.logoutBtn} onClick={handleLogout} type="button">
                        退出登录
                    </button>
                </div>
            ) : (
                <div className={styles.authActions}>
                    <p className={styles.hint}>登录后数据自动同步到云端</p>
                    <button className={styles.loginBtn} onClick={() => setShowAuthModal(true)} type="button">
                        登录
                    </button>
                    <button className={styles.registerBtn} onClick={() => setShowAuthModal(true)} type="button">
                        注册
                    </button>
                </div>
            )}

            <AuthModal
                open={showAuthModal}
                onClose={handleAuthSuccess}
                onLogin={onLogin}
                onRegister={onRegister}
            />
        </div>
    );
}
