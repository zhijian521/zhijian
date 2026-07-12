/*============================================================================
  filter-sidebar — 桌面端筛选侧边栏

  仅 768px 以上显示。提供分类（单选）+ 标签（多选）筛选入口。
  通过 onNavigate 回调驱动路由跳转，自身不持有状态。
============================================================================*/

/*== 组件导入 ==*/
import { GhostButton } from '@/components/ui/ghost-button';
import { Show } from '@/components/ui/show';

/*== 数据与配置 ==*/
import { isCategoryActive } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './filter-sidebar.module.css';

/*== 类型定义 ==*/
interface FilterOption {
    /*-- 跳转 URL --*/
    href: string;
    /*-- 显示文字 --*/
    label: string;
    /*-- 唯一标识 --*/
    slug: string;
}

interface FilterSidebarProps {
    /*-- 当前激活的分类 slug --*/
    activeCategorySlug?: string;
    /*-- 当前激活的标签 slug 列表 --*/
    activeTagSlugs: string[];
    /*-- 可选分类列表 --*/
    categoryOptions: FilterOption[];
    /*-- 导航回调，由上层传入 router.push --*/
    onNavigate: (url: string) => void;
    /*-- 可选标签列表 --*/
    tagOptions: FilterOption[];
}

/*== FilterSidebar 桌面端筛选侧边栏 — 分类（单选）+ 标签（多选） ==*/
export function FilterSidebar({
    activeCategorySlug,
    activeTagSlugs,
    categoryOptions,
    onNavigate,
    tagOptions,
}: FilterSidebarProps) {
    return (
        <aside className={styles.sidebar}>
            {/* 分类筛选 */}
            <Show when={categoryOptions.length > 1}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>分类</h3>
                    <div className={styles.categories}>
                        {categoryOptions.map((category) => (
                            <GhostButton
                                active={isCategoryActive(activeCategorySlug, category.slug)}
                                asButton
                                key={category.slug || 'all'}
                                onClick={() => onNavigate(category.href)}
                                size="mini"
                                variant="primary"
                            >
                                {category.label}
                            </GhostButton>
                        ))}
                    </div>
                </div>
            </Show>

            {/* 标签筛选 */}
            <Show when={tagOptions.length > 0}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>标签</h3>
                    <div className={styles.tagFilter}>
                        {tagOptions.map((tag) => (
                            <GhostButton
                                active={activeTagSlugs.includes(tag.slug)}
                                asButton
                                key={tag.slug}
                                onClick={() => onNavigate(tag.href)}
                                size="mini"
                            >
                                {tag.label}
                            </GhostButton>
                        ))}
                    </div>
                </div>
            </Show>
        </aside>
    );
}

export type { FilterOption };
