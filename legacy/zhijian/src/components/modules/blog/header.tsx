/*============================================================================
  header — 博客列表页头部

  展示标题、激活筛选标签（可移除）、移动端筛选入口按钮。
============================================================================*/

/*== 组件导入 ==*/
import { GhostButton } from '@/components/ui/ghost-button';
import { XIcon } from '@/components/ui/icons';
import { Show } from '@/components/ui/show';

/*== 样式导入 ==*/
import styles from './header.module.css';

/*== 类型定义 ==*/
interface ActiveFilterChip {
    /*-- 标签显示文字 --*/
    label: string;
    /*-- 移除该筛选的跳转 URL --*/
    removeHref: string;
}

interface HeaderProps {
    /*-- 当前激活的筛选标签列表 --*/
    activeFilterChips: ActiveFilterChip[];
    /*-- 是否存在可用的筛选条件 --*/
    hasFilters: boolean;
    /*-- 导航回调，由上层传入 router.push --*/
    onNavigate: (url: string) => void;
    /*-- 打开移动端筛选弹窗 --*/
    onOpenFilter: () => void;
}

/*== Header 博客列表页头部 — 标题 + 激活筛选标签 + 移动端筛选按钮 ==*/
export function Header({ activeFilterChips, hasFilters, onNavigate, onOpenFilter }: HeaderProps) {
    const hasActiveFilters = activeFilterChips.length > 0;

    return (
        <header className={styles.header}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>文章</h1>
                {/* 移动端筛选按钮 */}
                <Show when={hasFilters}>
                    <GhostButton
                        asButton
                        className={styles.filterBtnMobile}
                        size="small"
                        variant="primary"
                        onClick={onOpenFilter}
                    >
                        筛选
                    </GhostButton>
                </Show>
            </div>
            {/* 当前激活的筛选标签 */}
            <Show when={hasActiveFilters}>
                <div className={styles.activeFilters}>
                    {activeFilterChips.map((chip) => (
                        <GhostButton
                            asButton
                            icon={<XIcon />}
                            key={chip.label}
                            size="mini"
                            variant="primary"
                            onClick={() => onNavigate(chip.removeHref)}
                        >
                            {chip.label}
                        </GhostButton>
                    ))}
                </div>
            </Show>
        </header>
    );
}

export type { ActiveFilterChip };
