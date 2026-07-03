'use client';

import { useState } from 'react';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { Icon, STROKE_ICONS, FILL_ICONS } from '@/components/ui/icons';
import styles from './page.module.css';

export default function ShowcaseIconsPage() {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (name: string) => {
        navigator.clipboard.writeText(`import { Icon } from '@/components/ui/icons';\n<Icon name="${name}" />`);
        setCopied(name);
        setTimeout(() => setCopied(null), 1500);
    };

    const strokeNames = Object.keys(STROKE_ICONS);
    const fillNames = Object.keys(FILL_ICONS);

    return (
        <div>
            <AdminPageHeader
                eyebrow="Icons"
                title="图标预览"
                description="浏览项目内所有可用的图标，点击图标即可复制 import 用法。"
                tag={`共 ${strokeNames.length + fillNames.length} 个图标`}
            />

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>线框图标（stroke）· {strokeNames.length}</h2>
                <div className={styles.grid}>
                    {strokeNames.map(name => (
                        <button key={name} className={styles.iconCell} onClick={() => handleCopy(name)} title={`点击复制 ${name}`}>
                            <Icon name={name} className={styles.icon} />
                            <span className={styles.iconName}>{copied === name ? '已复制' : name}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>填充图标（fill）· {fillNames.length}</h2>
                <div className={styles.grid}>
                    {fillNames.map(name => (
                        <button key={name} className={styles.iconCell} onClick={() => handleCopy(name)} title={`点击复制 ${name}`}>
                            <Icon name={name} className={styles.icon} />
                            <span className={styles.iconName}>{copied === name ? '已复制' : name}</span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}
