'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { clearNavDataCache } from '@/lib/domain/nav-storage';

import AiSection from './ai-section';
import NoteSection from './note-section';
import SearchSection from './search-section';
import SettingsSection from './settings-section';
import TodoSection from './todo-section';
import styles from './nav-shell.module.css';

/*== Nav 四屏容器：首屏搜索，二屏 AI，三屏备忘录，四屏笔记 ==*/
export default function NavShell() {
    const [dataVersion, setDataVersion] = useState(0);
    const [pendingAiQuery, setPendingAiQuery] = useState('');
    const [loginSignal, setLoginSignal] = useState(0);
    const { user, isLoggedIn, loading, login, register, logout } = useAuth();
    const shellRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

    const sectionRef = useCallback(
        (index: number) => (element: HTMLDivElement | null) => {
            sectionRefs.current[index] = element;
        },
        []
    );

    const scrollToSection = useCallback((index: number) => {
        const element = sectionRefs.current[index];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (!event.altKey) return;

            const sectionIndex = parseInt(event.key, 10) - 1;
            if (Number.isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= sectionRefs.current.length) {
                return;
            }

            event.preventDefault();
            scrollToSection(sectionIndex);
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scrollToSection]);

    function handleAuthChange() {
        clearNavDataCache();
        setDataVersion((value) => value + 1);
    }

    function handleAskAi(query: string) {
        setPendingAiQuery(query);
        scrollToSection(1);
    }

    function handleConsumedInitialQuery() {
        setPendingAiQuery('');
    }

    function handleRequireLogin() {
        scrollToSection(0);
        setLoginSignal((v) => v + 1);
    }

    return (
        <div className={styles.shell} ref={shellRef}>
            <div className="bg-overlay" />
            <div className={`${styles.section} ${styles.sectionTop}`} ref={sectionRef(0)}>
                <div className={styles.sectionActions}>
                    <SettingsSection
                        isLoggedIn={isLoggedIn}
                        loading={loading}
                        loginSignal={loginSignal}
                        onAuthChange={handleAuthChange}
                        onLogin={login}
                        onLogout={logout}
                        onRegister={register}
                        user={user}
                    />
                </div>

                <SearchSection dataVersion={dataVersion} isLoggedIn={isLoggedIn} onAskAi={handleAskAi} />
            </div>

            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(1)}>
                <AiSection
                    dataVersion={dataVersion}
                    initialQuery={pendingAiQuery}
                    isLoggedIn={isLoggedIn}
                    loading={loading}
                    onConsumedInitialQuery={handleConsumedInitialQuery}
                    onRequireLogin={handleRequireLogin}
                />
            </div>

            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(2)}>
                <TodoSection dataVersion={dataVersion} isLoggedIn={isLoggedIn} />
            </div>

            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(3)}>
                <NoteSection dataVersion={dataVersion} isLoggedIn={isLoggedIn} />
            </div>
        </div>
    );
}
