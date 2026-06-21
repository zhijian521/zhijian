'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { SearchIcon, ListIcon, PencilIcon } from '@/components/ui/icons';

import SearchSection from './search-section';
import TodoSection from './todo-section';
import NoteSection from './note-section';
import styles from './nav-shell.module.css';

/*-- Dock 配置 --*/
const SECTIONS = [
    { id: 'search', icon: SearchIcon, label: '搜索' },
    { id: 'todo', icon: ListIcon, label: '备忘录' },
    { id: 'note', icon: PencilIcon, label: '笔记' },
] as const;

export default function NavShell() {
    const [activeIndex, setActiveIndex] = useState(0);
    const shellRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

            {/*-- 三屏内容 --*/}
            <div
                className={styles.section}
                ref={(el) => { sectionRefs.current[0] = el; }}
            >
                <SearchSection />
            </div>
            <div
                className={styles.section}
                ref={(el) => { sectionRefs.current[1] = el; }}
            >
                <TodoSection />
            </div>
            <div
                className={styles.section}
                ref={(el) => { sectionRefs.current[2] = el; }}
            >
                <NoteSection />
            </div>
        </div>
    );
}
