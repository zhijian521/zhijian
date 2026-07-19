/*============================================================================
  section-nav — 导航页分屏索引

  仅负责渲染分屏入口与当前态，切换行为由 NavShell 注入。
============================================================================*/

import styles from './section-nav.module.css';

export interface NavSection {
    label: string;
    shortcut: string;
}

interface SectionNavProps {
    activeIndex: number;
    onSelect: (index: number) => void;
    sections: readonly NavSection[];
}

export default function SectionNav({ activeIndex, onSelect, sections }: SectionNavProps) {
    return (
        <nav aria-label="导航页分屏" className={styles.nav}>
            <ol className={styles.list}>
                {sections.map((section, index) => (
                    <li key={section.label}>
                        <button
                            aria-current={activeIndex === index ? 'page' : undefined}
                            aria-label={`${section.label}，${section.shortcut}`}
                            className={`${styles.button} ${activeIndex === index ? styles.buttonActive : ''}`}
                            onClick={() => onSelect(index)}
                            type="button"
                        >
                            <span className={styles.label}>{section.label}</span>
                        </button>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
