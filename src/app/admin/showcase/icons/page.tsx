'use client';

import { useEffect, useRef, useState } from 'react';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { Icon, STROKE_ICONS, FILL_ICONS } from '@/components/ui/icons';
import styles from './page.module.css';

const SECTIONS = [
    { key: 'stroke', title: '线框图标（stroke）', names: Object.keys(STROKE_ICONS) },
    { key: 'fill', title: '填充图标（fill）', names: Object.keys(FILL_ICONS) },
] as const;

export default function ShowcaseIconsPage() {
    const [copied, setCopied] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleCopy = (name: string) => {
        navigator.clipboard.writeText(`import { Icon } from '@/components/ui/icons';\n<Icon name="${name}" />`);
        setCopied(name);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(null), 1500);
    };

    /* 卸载时清理复制提示定时器，避免对已卸载组件 setState */
    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const total = SECTIONS.reduce((sum, s) => sum + s.names.length, 0);

    return (
        <div>
            <AdminPageHeader
                eyebrow="Icons"
                title="图标预览"
                description="浏览项目内所有可用的图标，点击图标即可复制 import 用法。"
                tag={`共 ${total} 个图标`}
            />

            {SECTIONS.map(section => (
                <section key={section.key} className={styles.section}>
                    <h2 className={styles.sectionTitle}>{section.title} · {section.names.length}</h2>
                    <div className={styles.grid}>
                        {section.names.map(name => (
                            <button
                                key={name}
                                className={styles.iconCell}
                                onClick={() => handleCopy(name)}
                                title={`点击复制 ${name}`}
                            >
                                <Icon name={name} className={styles.icon} />
                                <span className={styles.iconName}>{copied === name ? '已复制' : name}</span>
                            </button>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
