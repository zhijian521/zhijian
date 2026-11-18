/*============================================================================
  pagination — 分页组件

  支持服务端链接模式（getHref）和客户端回调模式（onPageChange），
  带可选每页条数选择器。当前页朱砂红实色，省略号自适应。
============================================================================*/

/*== 组件导入 ==*/
import Link from 'next/link';

import { Select } from '@/components/ui/select';

/*== 数据与配置 ==*/
import { cn } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './pagination.module.css';

/*== 类型定义 ==*/
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
    /*-- 当前页码，1-based --*/
    current: number;
    /*-- 总页数 --*/
    total: number;
    /*-- 目标页链接生成函数（服务端链接模式） --*/
    getHref?: (page: number) => string;
    /*-- 页码变更回调（客户端回调模式） --*/
    onPageChange?: (page: number) => void;
    /*-- 每页条数 --*/
    pageSize?: number;
    /*-- 每页条数变更回调 --*/
    onPageSizeChange?: (size: number) => void;
    /*-- 可选的每页条数选项，默认 [10, 20, 50, 100] --*/
    pageSizeOptions?: number[];
}

/*== 生成带省略号的页码列表 ==*/
function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];

    const rangeStart = Math.max(2, current - 1);
    const rangeEnd = Math.min(total - 1, current + 1);

    if (rangeStart > 2) pages.push('ellipsis');

    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

    if (rangeEnd < total - 1) pages.push('ellipsis');

    pages.push(total);

    return pages;
}

/*== 判断翻页按钮是否禁用 ==*/
function isNavDisabled(isNav: boolean, label: string | undefined, current: number, total: number): boolean {
    if (!isNav || !label) return false;
    return (label === '上一页' && current <= 1) || (label === '下一页' && current >= total);
}

/*== Pagination 分页：支持服务端链接模式和客户端回调模式 ==*/
export function Pagination({
    current,
    total,
    getHref,
    onPageChange,
    pageSize,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    className,
    ...props
}: PaginationProps) {
    const pages = buildPageNumbers(current, total);

    function renderPageButton(page: number, isNav = false, label?: string) {
        const text = label ?? String(page);
        const buttonClass = cn(styles.btn, page === current && !isNav && styles.active, isNav && styles.navBtn);
        const disabled = isNavDisabled(isNav, label, current, total);

        if (getHref) {
            if (disabled) {
                return (
                    <span aria-disabled="true" className={cn(buttonClass, styles.disabledLink)}>
                        {text}
                    </span>
                );
            }

            return (
                <Link
                    aria-current={page === current && !isNav ? 'page' : undefined}
                    className={buttonClass}
                    href={getHref(page)}
                >
                    {text}
                </Link>
            );
        }

        if (!onPageChange) return null;

        return (
            <button
                aria-current={page === current && !isNav ? 'page' : undefined}
                className={buttonClass}
                disabled={disabled}
                onClick={() => onPageChange(page)}
                type="button"
            >
                {text}
            </button>
        );
    }

    /* pageSize Select 适配：number → string */
    const sizeOptions = pageSizeOptions.map((n) => ({ value: String(n), label: `${n} 条` }));
    const sizeValue = String(pageSize ?? 10);

    return (
        <nav aria-label="分页导航" className={cn(styles.root, className)} {...props}>
            {onPageSizeChange && (
                <div className={styles.sizeSelector}>
                    <span className={styles.sizeLabel}>每页</span>
                    <Select
                        options={sizeOptions}
                        onChange={(v) => onPageSizeChange(Number(v))}
                        size="small"
                        value={sizeValue}
                    />
                </div>
            )}

            {renderPageButton(current - 1, true, '上一页')}

            {pages.map((page, index) =>
                page === 'ellipsis' ? (
                    <span aria-hidden="true" className={styles.ellipsis} key={`ellipsis-${index}`}>
                        …
                    </span>
                ) : (
                    <span key={page}>{renderPageButton(page)}</span>
                )
            )}

            {renderPageButton(current + 1, true, '下一页')}
        </nav>
    );
}
