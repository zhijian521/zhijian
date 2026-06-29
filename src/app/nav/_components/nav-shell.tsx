'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { clearNavDataCache } from '@/lib/nav-storage';

import SearchSection from './search-section';
import TodoSection from './todo-section';
import NoteSection from './note-section';
import SettingsSection from './settings-section';
import styles from './nav-shell.module.css';

export default function NavShell() {
    const [dataVersion, setDataVersion] = useState(0);
    const { user, isLoggedIn, loading, login, register, logout } = useAuth();
    const shellRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

    /*-- 注册 section ref --*/
    const sectionRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
        sectionRefs.current[index] = el;
    }, []);

    /*-- 快捷键跳转 --*/
    const scrollToSection = useCallback((index: number) => {
        const el = sectionRefs.current[index];
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, []);

    /*-- Alt+1/2/3/4 快捷键切换 --*/
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!e.altKey) return;
            const idx = parseInt(e.key, 10) - 1;
            if (idx >= 0 && idx < 4) {
                e.preventDefault();
                scrollToSection(idx);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scrollToSection]);

    /*-- 登录/退出后清除缓存，递增版本号触发数据重拉 --*/
    function handleAuthChange() {
        clearNavDataCache();
        setDataVersion(v => v + 1);
    }

    return (
        <div className={styles.shell} ref={shellRef}>
            {/*-- 四屏内容 --*/}
            <div className={`${styles.section} ${styles.sectionTop}`} ref={sectionRef(0)}>
                <SearchSection isLoggedIn={isLoggedIn} dataVersion={dataVersion} />
            </div>
            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(1)}>
                <TodoSection isLoggedIn={isLoggedIn} dataVersion={dataVersion} />
            </div>
            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(2)}>
                <NoteSection isLoggedIn={isLoggedIn} dataVersion={dataVersion} />
            </div>
            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(3)}>
                <SettingsSection
                    user={user}
                    isLoggedIn={isLoggedIn}
                    loading={loading}
                    onLogin={login}
                    onRegister={register}
                    onLogout={logout}
                    onAuthChange={handleAuthChange}
                />
            </div>
        </div>
    );
}
