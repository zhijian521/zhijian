/*== 组件导入 ==*/
import { XIcon } from '@/components/ui/icons';

/*== 样式导入 ==*/
import styles from './header.module.css';

/*== 类型定义 ==*/
interface ActiveFilterChip {
    label: string;
    removeHref: string;
}

interface HeaderProps {
    activeFilterChips: ActiveFilterChip[];
    hasFilters: boolean;
    onNavigate: (url: string) => void;
    onOpenFilter: () => void;
}

/*== Header 博客列表页头部 — 标题 + 激活筛选标签 + 移动端筛选按钮 ==*/
export function Header({ activeFilterChips, hasFilters, onNavigate, onOpenFilter }: HeaderProps) {
    const hasActiveFilters = activeFilterChips.length > 0;

    return (
        <header className={styles.header}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>文章</h1>
                {hasFilters ? (
                    <button className={styles.filterBtn} onClick={onOpenFilter} type="button">
                        筛选
                    </button>
                ) : null}
            </div>
            {hasActiveFilters ? (
                <div className={styles.activeFilters}>
                    {activeFilterChips.map((chip) => (
                        <button
                            className={styles.activeFilterChip}
                            key={chip.label}
                            onClick={() => onNavigate(chip.removeHref)}
                            type="button"
                        >
                            {chip.label}
                            <XIcon className={styles.activeFilterClose} />
                        </button>
                    ))}
                </div>
            ) : null}
        </header>
    );
}

export type { ActiveFilterChip };
