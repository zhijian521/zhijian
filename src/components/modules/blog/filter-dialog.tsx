'use client';

/*============================================================================
  filter-dialog — 移动端筛选弹窗

  基于 Dialog 组件，提供分类（单选）+ 标签（多选）筛选。
  通过 onSelect 回调驱动路由跳转，通过 onClose 关闭弹窗。
  选项渲染复用 FilterOptions 共享组件。
============================================================================*/

/*== 组件导入 ==*/
import Dialog from '@/components/ui/dialog';
import { FilterOptions } from '@/components/modules/blog/filter-options';

/*== 数据与配置 ==*/
import type { FilterOption } from '@/components/modules/blog/filter-options';

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
                <FilterOptions
                    activeCategorySlug={activeCategorySlug}
                    activeTagSlugs={activeTagSlugs}
                    categoryOptions={categoryOptions}
                    onSelect={onSelect}
                    sectionClassName={styles.block}
                    tagOptions={tagOptions}
                    titleClassName={styles.blockTitle}
                />
            </div>
        </Dialog>
    );
}
