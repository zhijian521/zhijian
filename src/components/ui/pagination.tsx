import styles from './pagination.module.css';

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
    /** 当前页码（1-based） */
    current: number;
    /** 总页数 */
    total: number;
    /** 页码变更回调 */
    onPageChange: (page: number) => void;
}

/*== 生成带省略号的页码列表 ==*/
function buildPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [1];

    const rangeStart = Math.max(2, current - 1);
    const rangeEnd = Math.min(total - 1, current + 1);

    if (rangeStart > 2) {
        pages.push('ellipsis');
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
    }

    if (rangeEnd < total - 1) {
        pages.push('ellipsis');
    }

    pages.push(total);

    return pages;
}

/*== Pagination 分页 — 朱砂红当前页 + 描边翻页按钮 ==*/
export function Pagination({ current, total, onPageChange, className, ...props }: PaginationProps) {
    if (total <= 1) {
        return null;
    }

    const pages = buildPageNumbers(current, total);

    return (
        <nav aria-label="分页导航" className={`${styles.root}${className ? ` ${className}` : ''}`} {...props}>
            <button
                className={`${styles.btn} ${styles.navBtn}`}
                disabled={current <= 1}
                onClick={() => onPageChange(current - 1)}
                type="button"
            >
                上一页
            </button>

            {pages.map((page, index) =>
                page === 'ellipsis' ? (
                    <span aria-hidden="true" className={styles.ellipsis} key={`ellipsis-${index}`}>
                        …
                    </span>
                ) : (
                    <button
                        aria-current={page === current ? 'page' : undefined}
                        className={`${styles.btn}${page === current ? ` ${styles.active}` : ''}`}
                        key={page}
                        onClick={() => onPageChange(page)}
                        type="button"
                    >
                        {page}
                    </button>
                ),
            )}

            <button
                className={`${styles.btn} ${styles.navBtn}`}
                disabled={current >= total}
                onClick={() => onPageChange(current + 1)}
                type="button"
            >
                下一页
            </button>
        </nav>
    );
}
