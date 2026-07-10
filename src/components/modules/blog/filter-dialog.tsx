'use client';

/*============================================================================
  filter-dialog — 移动端筛选弹窗

  基于 Dialog 组件，提供分类（单选）+ 标签（多选）筛选。
  通过 onSelect 回调驱动路由跳转，通过 onClose 关闭弹窗。
============================================================================*/

/*== 组件导入 ==*/
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { Show } from '@/components/ui/show';

/*== 数据与配置 ==*/
import type { FilterOption } from '@/components/modules/blog/filter-sidebar';
import { isCategoryActive } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './filter-dialog.module.css';

/*== 类型定义 ==*/
interface FilterDialogProps {
    /*-- 当前激活的分类 slug --*/
    activeCategorySlug?: string;
    /*-- 当前激活的标签 slug 列表 --*/
    activeTagSlugs: string[];
    /*-- 可选分类列表 --*/
    categoryOptions: FilterOption[];
    /*-- 关闭弹窗回调 --*/
    onClose: () => void;
    /*-- 选中筛选项后的导航回调 --*/
    onSelect: (url: string) => void;
    /*-- 弹窗是否打开 --*/
    open: boolean;
    /*-- 可选标签列表 --*/
    tagOptions: FilterOption[];
}

/*== FilterDialog 移动端筛选弹窗 — 分类（单选）+ 标签（多选） ==*/
export function FilterDialog({
    activeCategorySlug,
    activeTagSlugs,
    categoryOptions,
    onClose,
    onSelect,
    open,
    tagOptions,
}: FilterDialogProps) {
    return (
        <Dialog maxWidth="20rem" onClose={onClose} open={open} title="筛选">
            <div className={styles.body}>
                {/*-- 分类筛选 --*/}
                <Show when={categoryOptions.length > 1}>
                    <div className={styles.block}>
                        <h3 className={styles.blockTitle}>分类</h3>
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

                {/*-- 标签筛选 --*/}
                <Show when={tagOptions.length > 0}>
                    <div className={styles.block}>
                        <h3 className={styles.blockTitle}>标签</h3>
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
            </div>
        </Dialog>
    );
}
