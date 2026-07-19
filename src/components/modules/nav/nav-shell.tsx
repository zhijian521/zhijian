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

/*== Nav 四屏容器：搜索、AI、备忘录与笔记 ==*/

const NAV_SECTIONS = [
    { label: '搜索', shortcut: 'Alt+1' },
    { label: '对话', shortcut: 'Alt+2' },
    { label: '待办', shortcut: 'Alt+3' },
    { label: '笔记', shortcut: 'Alt+4' },
] as const;

export default function NavShell() {
    const [activeSection, setActiveSection] = useState(0);
    const [dataVersion, setDataVersion] = useState(0);
    const [pendingAiQuery, setPendingAiQuery] = useState('');
    const [loginSignal, setLoginSignal] = useState(0);
    const { user, isLoggedIn, loading, login, register, logout } = useAuth();
    const shellRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    const sectionRef = useCallback(
        (index: number) => (element: HTMLElement | null) => {
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
        const root = shellRef.current;
        if (!root) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
                const index = visibleEntry ? sectionRefs.current.indexOf(visibleEntry.target as HTMLElement) : -1;

                if (index >= 0) setActiveSection(index);
            },
            { root, threshold: [0.5, 0.75] }
        );

        sectionRefs.current.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (!event.altKey) return;

            const sectionIndex = parseInt(event.key, 10) - 1;
            if (Number.isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= NAV_SECTIONS.length) {
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
        setLoginSignal((value) => value + 1);
    }

    return (
        <div className={styles.shell} ref={shellRef}>
            <div className="bg-overlay" />

            <nav aria-label="导航页分屏" className={styles.sectionNav}>
                <ol className={styles.sectionNavList}>
                    {NAV_SECTIONS.map((section, index) => (
                        <li key={section.label}>
                            <button
                                aria-current={activeSection === index ? 'page' : undefined}
                                aria-label={`${section.label}，${section.shortcut}`}
                                className={`${styles.sectionNavButton} ${activeSection === index ? styles.sectionNavButtonActive : ''}`}
                                onClick={() => scrollToSection(index)}
                                type="button"
                            >
                                <span className={styles.sectionNavLabel}>{section.label}</span>
                            </button>
                        </li>
                    ))}
                </ol>
            </nav>

            <section aria-label="搜索与书签" className={`${styles.section} ${styles.sectionTop}`} ref={sectionRef(0)}>
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
            </section>

            <section aria-label="AI 对话" className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(1)}>
                <AiSection
                    dataVersion={dataVersion}
                    initialQuery={pendingAiQuery}
                    isLoggedIn={isLoggedIn}
                    loading={loading}
                    onConsumedInitialQuery={handleConsumedInitialQuery}
                    onRequireLogin={handleRequireLogin}
                />
            </section>

            <section
                aria-label="四象限待办"
                className={`${styles.section} ${styles.sectionStretch}`}
                ref={sectionRef(2)}
            >
                <TodoSection dataVersion={dataVersion} isLoggedIn={isLoggedIn} />
            </section>

            <section aria-label="随手笔记" className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(3)}>
                <NoteSection dataVersion={dataVersion} isLoggedIn={isLoggedIn} />
            </section>
        </div>
    );
}
