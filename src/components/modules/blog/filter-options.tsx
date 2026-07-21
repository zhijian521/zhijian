/*============================================================================
  filter-options — 筛选项展示（分类 + 标签）

  桌面端侧边栏与移动端弹窗共用的展示组件，仅负责渲染与回调转发。
  区块容器与标题样式由调用方通过 className 传入，保留两侧外观差异。
============================================================================*/

/*== 组件导入 ==*/
import { GhostButton } from '@/components/ui/ghost-button';
import { Show } from '@/components/ui/show';

/*== 数据与配置 ==*/
import { isCategoryActive } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './filter-options.module.css';

/*== 类型定义 ==*/
interface FilterOption {
    /*-- 跳转 URL --*/
    href: string;
    /*-- 显示文字 --*/
    label: string;
    /*-- 唯一标识 --*/
    slug: string;
}

interface FilterOptionsProps {
    /*-- 当前激活的分类 slug --*/
    activeCategorySlug?: string;
    /*-- 当前激活的标签 slug 列表 --*/
    activeTagSlugs: string[];
    /*-- 可选分类列表 --*/
    categoryOptions: FilterOption[];
    /*-- 选中筛选项后的导航回调 --*/
    onSelect: (url: string) => void;
    /*-- 区块容器 className（侧边栏卡片 / 弹窗区块） --*/
    sectionClassName: string;
    /*-- 可选标签列表 --*/
    tagOptions: FilterOption[];
    /*-- 区块标题 className --*/
    titleClassName: string;
}

/*== FilterOptions 筛选项展示 — 分类（单选）+ 标签（多选） ==*/
export function FilterOptions({
    activeCategorySlug,
    activeTagSlugs,
    categoryOptions,
    onSelect,
    sectionClassName,
    tagOptions,
    titleClassName,
}: FilterOptionsProps) {
    return (
        <>
            {/* 分类筛选 */}
            <Show when={categoryOptions.length > 1}>
                <div className={sectionClassName}>
                    <h3 className={titleClassName}>分类</h3>
                    <div className={styles.categories}>
                        {categoryOptions.map((category) => (
                            <GhostButton
                                active={isCategoryActive(activeCategorySlug, category.slug)}
                                asButton
                                key={category.slug || 'all'}
                                onClick={() => onSelect(category.href)}
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
                <div className={sectionClassName}>
                    <h3 className={titleClassName}>标签</h3>
                    <div className={styles.tagFilter}>
                        {tagOptions.map((tag) => (
                            <GhostButton
                                active={activeTagSlugs.includes(tag.slug)}
                                asButton
                                key={tag.slug}
                                onClick={() => onSelect(tag.href)}
                                size="mini"
                            >
                                {tag.label}
                            </GhostButton>
                        ))}
                    </div>
                </div>
            </Show>
        </>
    );
}

export type { FilterOption };
