/*== 组件导入 ==*/

/*== 数据与配置 ==*/
import { cn, isCategoryActive } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './filter-sidebar.module.css';

/*== 类型定义 ==*/
interface FilterOption {
    href: string;
    label: string;
    slug: string;
}

interface FilterSidebarProps {
    activeCategorySlug?: string;
    activeTagSlugs: string[];
    categoryOptions: FilterOption[];
    onNavigate: (url: string) => void;
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
            {categoryOptions.length > 1 ? (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>分类</h3>
                    <div className={styles.categories}>
                        {categoryOptions.map((category) => (
                            <button
                                aria-pressed={isCategoryActive(activeCategorySlug, category.slug)}
                                className={cn(
                                    styles.catBtn,
                                    isCategoryActive(activeCategorySlug, category.slug) && styles.catActive
                                )}
                                key={category.slug || 'all'}
                                onClick={() => onNavigate(category.href)}
                                type="button"
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}

            {tagOptions.length > 0 ? (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>标签</h3>
                    <div className={styles.tagFilter}>
                        {tagOptions.map((tag) => (
                            <button
                                aria-pressed={activeTagSlugs.includes(tag.slug)}
                                className={cn(styles.tagBtn, activeTagSlugs.includes(tag.slug) && styles.tagActive)}
                                key={tag.slug}
                                onClick={() => onNavigate(tag.href)}
                                type="button"
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </aside>
    );
}

export type { FilterOption };
