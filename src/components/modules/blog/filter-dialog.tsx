'use client';

/*== 组件导入 ==*/
import Dialog from '@/components/ui/dialog';

/*== 数据与配置 ==*/
import { cn, isCategoryActive } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './filter-dialog.module.css';

/*== 类型定义 ==*/
interface FilterOption {
    href: string;
    label: string;
    slug: string;
}

interface FilterDialogProps {
    activeCategorySlug?: string;
    activeTagSlugs: string[];
    categoryOptions: FilterOption[];
    onClose: () => void;
    onSelect: (url: string) => void;
    open: boolean;
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
                {categoryOptions.length > 1 ? (
                    <div className={styles.block}>
                        <h3 className={styles.blockTitle}>分类</h3>
                        <div className={styles.categories}>
                            {categoryOptions.map((category) => (
                                <button
                                    aria-pressed={isCategoryActive(activeCategorySlug, category.slug)}
                                    className={cn(
                                        styles.catBtn,
                                        isCategoryActive(activeCategorySlug, category.slug) && styles.catActive
                                    )}
                                    key={category.slug || 'all'}
                                    onClick={() => onSelect(category.href)}
                                    type="button"
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {tagOptions.length > 0 ? (
                    <div className={styles.block}>
                        <h3 className={styles.blockTitle}>标签</h3>
                        <div className={styles.tagFilter}>
                            {tagOptions.map((tag) => (
                                <button
                                    aria-pressed={activeTagSlugs.includes(tag.slug)}
                                    className={cn(styles.tagBtn, activeTagSlugs.includes(tag.slug) && styles.tagActive)}
                                    key={tag.slug}
                                    onClick={() => onSelect(tag.href)}
                                    type="button"
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </Dialog>
    );
}
