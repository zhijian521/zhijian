'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { LogOutIcon, SettingsIcon } from '@/components/ui/icons';
import type { AuthUser } from '@/hooks/use-auth';
import { getSaveStatus, onSaveStatusChange, syncLocalToServer, clearLocalNavData } from '@/lib/nav-storage';

import AuthModal from './auth-modal';

import styles from './settings-section.module.css';

interface SettingsSectionProps {
    user: AuthUser | null;
    isLoggedIn: boolean;
    loading: boolean;
    onLogin: (username: string, password: string) => Promise<void>;
    onRegister: (username: string, email: string, password: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onAuthChange?: () => void;
    /** 递增信号：变化时打开登录弹窗（供 AI 屏等外部触发） */
    loginSignal?: number;
}

const SAVE_STATUS_LABELS = {
    bookmarks: '书签',
    todos: '备忘录',
    notes: '笔记',
    chat: '对话',
} as const;

/*== Nav 设置面板：首屏右上角触发，承载账号与同步状态 ==*/
export default function SettingsSection({ user, isLoggedIn, loading, onLogin, onRegister, onLogout, onAuthChange, loginSignal = 0 }: SettingsSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | false>(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [saveStatus, setSaveStatus] = useState(getSaveStatus);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelId = useId();
    const triggerLabel = isLoggedIn && user ? `${user.username} 的设置` : '设置';

    useEffect(() => {
        if (!isLoggedIn) return;
        return onSaveStatusChange(() => setSaveStatus(getSaveStatus()));
    }, [isLoggedIn]);

    /*-- 外部触发打开登录弹窗（如 AI 屏的「登录」按钮） --*/
    useEffect(() => {
        if (loginSignal > 0 && !isLoggedIn && !loading) {
            setIsOpen(true);
            setShowAuthModal('login');
        }
    }, [loginSignal, isLoggedIn, loading]);

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: MouseEvent) {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    async function handleAuthSuccess() {
        setShowAuthModal(false);
        setIsOpen(true);

        try {
            await syncLocalToServer();
        } catch {
            // 保持面板打开，交给同步状态区域展示失败结果。
        }

        onAuthChange?.();
    }

    async function handleLogout() {
        setLoggingOut(true);

        try {
            await onLogout();
            /*-- 清除本地导航数据，避免换账号登录时把上一用户数据同步到新账号 --*/
            clearLocalNavData();
            setIsOpen(false);
            onAuthChange?.();
        } finally {
            setLoggingOut(false);
        }
    }

    function handleToggleOpen() {
        setIsOpen((prev) => !prev);
    }

    return (
        <div className={styles.root} ref={rootRef}>
            <button aria-controls={isOpen ? panelId : undefined} aria-expanded={isOpen} aria-label={triggerLabel} className={styles.triggerButton} onClick={handleToggleOpen} type="button">
                {isLoggedIn && user ? <span className={styles.triggerName}>{user.username}</span> : null}
                <SettingsIcon className={styles.triggerIcon} />
            </button>

            {isOpen ? (
                <div aria-label="设置面板" className={styles.panel} id={panelId} role="region">
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>账号</h2>
                            <span className={styles.cardBadge}>{isLoggedIn ? '已登录' : '未登录'}</span>
                        </div>

                        {loading ? (
                            <p className={styles.cardHint}>正在读取登录状态…</p>
                        ) : isLoggedIn && user ? (
                            <div className={styles.profile}>
                                <div className={styles.profileRow}>
                                    <span className={styles.profileLabel}>用户名</span>
                                    <span className={styles.profileValue}>{user.username}</span>
                                </div>
                                <div className={styles.profileRow}>
                                    <span className={styles.profileLabel}>邮箱</span>
                                    <span className={styles.profileValue}>{user.email}</span>
                                </div>
                                <div className={styles.profileRow}>
                                    <span className={styles.profileLabel}>角色</span>
                                    <span className={styles.profileValue}>{user.role}</span>
                                </div>

                                <button className={styles.logoutButton} disabled={loggingOut} onClick={handleLogout} type="button">
                                    <LogOutIcon className={styles.logoutIcon} />
                                    <span>{loggingOut ? '退出中…' : '退出登录'}</span>
                                </button>
                            </div>
                        ) : (
                            <div className={styles.authActions}>
                                <p className={styles.cardHint}>登录后会自动把当前导航数据同步到你的账号。</p>

                                <div className={styles.authButtons}>
                                    <button className={styles.primaryButton} onClick={() => setShowAuthModal('login')} type="button">
                                        登录
                                    </button>
                                    <button className={styles.secondaryButton} onClick={() => setShowAuthModal('register')} type="button">
                                        注册
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>同步状态</h2>
                        </div>

                        <div className={styles.syncList}>
                            {(['bookmarks', 'todos', 'notes', 'chat'] as const).map((key) => {
                                const status = isLoggedIn ? saveStatus[key] : 'local';
                                const dotClassName = status === 'ok' ? styles.syncDotOk : status === 'pending' ? styles.syncDotPending : status === 'error' ? styles.syncDotError : styles.syncDotLocal;
                                const statusLabel = status === 'ok' ? '已同步' : status === 'pending' ? '同步中' : status === 'error' ? '同步失败' : '仅本地';

                                return (
                                    <div className={styles.syncRow} key={key}>
                                        <span className={`${styles.syncDot} ${dotClassName}`} />
                                        <span className={styles.syncName}>{SAVE_STATUS_LABELS[key]}</span>
                                        <span className={styles.syncStatus}>{statusLabel}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : null}

            <AuthModal
                initialTab={showAuthModal === 'register' ? 'register' : 'login'}
                onCancel={() => setShowAuthModal(false)}
                onLogin={onLogin}
                onRegister={onRegister}
                onSuccess={handleAuthSuccess}
                open={showAuthModal !== false}
            />
        </div>
    );
}
