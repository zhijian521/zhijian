'use client';

import { useState, useEffect } from 'react';

import { SettingsIcon } from '@/components/ui/icons';
import { syncLocalToServer, clearLocalNavData, getSaveStatus, onSaveStatusChange } from '@/lib/nav-storage';
import type { AuthUser } from '@/hooks/use-auth';

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
}

export default function SettingsSection({ user, isLoggedIn, loading, onLogin, onRegister, onLogout, onAuthChange }: SettingsSectionProps) {
    const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | false>(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [saveStatus, setSaveStatus] = useState(getSaveStatus);

    useEffect(() => {
        if (!isLoggedIn) return;
        return onSaveStatusChange(() => setSaveStatus(getSaveStatus()));
    }, [isLoggedIn]);

    async function handleAuthSuccess() {
        setShowAuthModal(false);
        try {
            await syncLocalToServer();
        } catch { /* sync 失败不阻塞 */ }
        onAuthChange?.();
    }

    async function handleLogout() {
        setLoggingOut(true);
        try {
            await onLogout();
            clearLocalNavData();
            onAuthChange?.();
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <SettingsIcon className={styles.headerIcon} />
                <h2 className={styles.title}>设置</h2>
            </div>

            <div className={styles.cards}>
                {/*-- 账号卡片 --*/}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>账号</h3>
                    {loading ? (
                        <p className={styles.cardHint}>加载中…</p>
                    ) : isLoggedIn && user ? (
                        <div className={styles.profile}>
                            <div className={styles.profileRow}>
                                <span className={styles.profileLabel}>用户名：</span>
                                <span className={styles.profileName}>{user.username}</span>
                            </div>
                            <div className={styles.profileRow}>
                                <span className={styles.profileLabel}>邮箱：</span>
                                <span className={styles.profileEmail}>{user.email}</span>
                            </div>
                            <button
                                className={styles.logoutBtn}
                                disabled={loggingOut}
                                onClick={handleLogout}
                                type="button"
                            >
                                {loggingOut ? '退出中…' : '退出登录'}
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authActions}>
                            <p className={styles.cardHint}>登录后数据自动同步到云端</p>
                            <div className={styles.authBtns}>
                                <button className={styles.loginBtn} onClick={() => setShowAuthModal('login')} type="button">
                                    登录
                                </button>
                                <button className={styles.registerBtn} onClick={() => setShowAuthModal('register')} type="button">
                                    注册
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/*-- 数据同步卡片 --*/}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>数据同步</h3>
                    {isLoggedIn ? (
                        <div className={styles.syncInfo}>
                            {(['bookmarks', 'todos', 'notes'] as const).map(key => {
                                const labels = { bookmarks: '书签', todos: '备忘录', notes: '笔记' };
                                const status = saveStatus[key];
                                return (
                                    <div key={key} className={styles.syncRow}>
                                        <span className={status === 'ok' ? styles.syncDot : status === 'error' ? styles.syncDotError : styles.syncDotPending}>●</span>
                                        <span className={styles.syncLabel}>{labels[key]}</span>
                                        {status === 'ok' && <span className={styles.syncStatusOn}>已同步</span>}
                                        {status === 'pending' && <span className={styles.syncStatusPending}>同步中…</span>}
                                        {status === 'error' && <span className={styles.syncStatusError}>同步失败</span>}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.syncInfo}>
                            <div className={styles.syncRow}>
                                <span className={styles.syncDotOff}>○</span>
                                <span className={styles.syncLabel}>书签</span>
                                <span className={styles.syncStatusOff}>仅本地</span>
                            </div>
                            <div className={styles.syncRow}>
                                <span className={styles.syncDotOff}>○</span>
                                <span className={styles.syncLabel}>备忘录</span>
                                <span className={styles.syncStatusOff}>仅本地</span>
                            </div>
                            <div className={styles.syncRow}>
                                <span className={styles.syncDotOff}>○</span>
                                <span className={styles.syncLabel}>笔记</span>
                                <span className={styles.syncStatusOff}>仅本地</span>
                            </div>
                        </div>
                    )}
                </div>

                {/*-- 帮助卡片 --*/}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>使用帮助</h3>
                    <ul className={styles.helpList}>
                        <li><strong>导航</strong> — 上下滚动或点击左侧 Dock 图标切换页面</li>
                        <li><strong>搜索</strong> — 支持多个搜索引擎，点击切换</li>
                        <li><strong>书签</strong> — 右键可新增、编辑、删除书签和文件夹</li>
                        <li><strong>备忘录</strong> — 支持紧急/重要/一般三种优先级</li>
                        <li><strong>笔记</strong> — 支持 Markdown，失焦自动保存</li>
                        <li><strong>数据</strong> — 未登录数据保存在浏览器本地，登录后自动同步到云端</li>
                    </ul>
                </div>
            </div>

            <AuthModal
                open={showAuthModal !== false}
                initialTab={showAuthModal === 'register' ? 'register' : 'login'}
                onSuccess={handleAuthSuccess}
                onCancel={() => setShowAuthModal(false)}
                onLogin={onLogin}
                onRegister={onRegister}
            />
        </div>
    );
}
