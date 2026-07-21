/*============================================================================
  filter-sidebar — 桌面端筛选侧边栏

  仅 768px 以上显示。提供分类（单选）+ 标签（多选）筛选入口。
  通过 onNavigate 回调驱动路由跳转，自身不持有状态。
  选项渲染复用 FilterOptions 共享组件。
============================================================================*/

/*== 组件导入 ==*/
import { FilterOptions } from '@/components/modules/blog/filter-options';

/*== 数据与配置 ==*/
import type { FilterOption } from '@/components/modules/blog/filter-options';

/*== 样式导入 ==*/
import styles from './filter-sidebar.module.css';

/*== 类型定义 ==*/
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
            <FilterOptions
                activeCategorySlug={activeCategorySlug}
                activeTagSlugs={activeTagSlugs}
                categoryOptions={categoryOptions}
                onSelect={onNavigate}
                sectionClassName={styles.card}
                tagOptions={tagOptions}
                titleClassName={styles.cardTitle}
            />
        </aside>
    );
}

export type { FilterOption };
