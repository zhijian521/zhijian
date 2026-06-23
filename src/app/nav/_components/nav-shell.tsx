'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { SearchIcon, ListIcon, PencilIcon, SettingsIcon } from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';

import SearchSection from './search-section';
import TodoSection from './todo-section';
import NoteSection from './note-section';
import SettingsSection from './settings-section';
import styles from './nav-shell.module.css';

/*-- Dock 配置 --*/
const SECTIONS = [
    { id: 'search', icon: SearchIcon, label: '搜索' },
    { id: 'todo', icon: ListIcon, label: '备忘录' },
    { id: 'note', icon: PencilIcon, label: '笔记' },
    { id: 'settings', icon: SettingsIcon, label: '设置' },
] as const;

export default function NavShell() {
    const [activeIndex, setActiveIndex] = useState(0);
    const { isLoggedIn } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const shellRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);

    /*-- 注册 section ref 并观察 --*/
    const sectionRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
        sectionRefs.current[index] = el;
        if (observerRef.current) {
            if (el) observerRef.current.observe(el);
        }
    }, []);

    /*-- IntersectionObserver 追踪当前屏 --*/
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
                        if (idx !== -1) setActiveIndex(idx);
                    }
                }
            },
            { root: shellRef.current, threshold: 0.6 },
        );
        observerRef.current = observer;

        /*-- 观察已挂载的 section --*/
        sectionRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    /*-- Dock 点击跳转 --*/
    const scrollToSection = useCallback((index: number) => {
        const el = sectionRefs.current[index];
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, []);

    /*-- 登录/退出后刷新数据 --*/
    function handleAuthChange() {
        setRefreshKey(k => k + 1);
    }

    return (
        <div className={styles.shell} ref={shellRef}>
            {/*-- Dock 指示器 --*/}
            <div className={styles.dock}>
                {SECTIONS.map((section, i) => (
                    <button
                        key={section.id}
                        aria-label={section.label}
                        className={`${styles.dockItem} ${i === activeIndex ? styles.dockItemActive : ''}`}
                        onClick={() => scrollToSection(i)}
                        type="button"
                    >
                        <section.icon className={styles.dockIcon} />
                    </button>
                ))}
            </div>

            {/*-- 四屏内容 --*/}
            <div className={`${styles.section} ${styles.sectionTop}`} ref={sectionRef(0)}>
                <SearchSection key={`search-${refreshKey}`} isLoggedIn={isLoggedIn} />
            </div>
            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(1)}>
                <TodoSection key={`todo-${refreshKey}`} isLoggedIn={isLoggedIn} />
            </div>
            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(2)}>
                <NoteSection key={`note-${refreshKey}`} isLoggedIn={isLoggedIn} />
            </div>
            <div className={`${styles.section} ${styles.sectionStretch}`} ref={sectionRef(3)}>
                <SettingsSection onAuthChange={handleAuthChange} />
            </div>
        </div>
    );
}
