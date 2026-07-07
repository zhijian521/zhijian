import React from 'react';
import styles from './data-table.module.css';

/*== DataTable 列定义 ==*/
export interface DataColumn<T> {
    /** 列标题 */
    header: string;
    /** 数据字段访问器或自定义渲染 */
    render: (row: T, index: number) => React.ReactNode;
    /** 响应式隐藏断点 */
    hideBelow?: 'sm' | 'md' | 'lg';
    /** 列宽（scrollable 模式下用于 colgroup，同时自动启用打点+hover） */
    width?: string;
    /** 列对齐方式，默认 left */
    align?: 'left' | 'center' | 'right';
}

/*== 从 React 渲染内容提取纯文本，用于 td 的 title 属性 ==*/
function extractText(node: React.ReactNode): string {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (!node) return '';
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (React.isValidElement(node))
        return extractText((node.props as Record<string, unknown>).children as React.ReactNode);
    return '';
}

/*== DataTable 属性 ==*/
interface DataTableProps<T> {
    columns: DataColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    emptyText?: string;
    /** 列多可横向滚动：colgroup + table-layout:fixed，列宽由 width 精确控制 */
    scrollable?: boolean;
}

/*== 通用数据表格 ==*/
export function DataTable<T>({ columns, rows, rowKey, emptyText = '暂无数据', scrollable = false }: DataTableProps<T>) {
    const safeRows = rows ?? [];

    /* scrollable 模式：colgroup 声明列宽 + table min-width 保证可滚动 */
    const colWidths = scrollable ? columns.map((col) => col.width || 'auto') : null;

    const tableMinWidth =
        scrollable && colWidths
            ? colWidths.reduce((sum, w) => sum + (w === 'auto' ? 80 : Number(w.replace('px', ''))), 0)
            : 0;

    /* scrollable 模式下，有 width 的列自动打点+hover */
    function hasEllipsis(col: DataColumn<T>) {
        return scrollable && !!col.width;
    }

    return (
        <div className={styles.tableWrapper}>
            <table
                className={scrollable ? `${styles.table} ${styles.tableFixed}` : styles.table}
                style={scrollable ? { minWidth: `${tableMinWidth}px` } : undefined}
            >
                {scrollable && colWidths && (
                    <colgroup>
                        {colWidths.map((w, i) => (
                            <col key={i} style={w !== 'auto' ? { width: w } : undefined} />
                        ))}
                    </colgroup>
                )}
                <thead>
                    <tr className={styles.thead}>
                        {columns.map((col, i) => (
                            <th
                                className={`${styles.th}${col.hideBelow ? ` ${styles[`hideBelow${col.hideBelow.charAt(0).toUpperCase()}${col.hideBelow.slice(1)}`]}` : ''}${hasEllipsis(col) ? ` ${styles.ellipsisCol}` : ''}`}
                                key={i}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {safeRows.length === 0 ? (
                        <tr>
                            <td className={styles.emptyRow} colSpan={columns.length}>
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        safeRows.map((row, rowIndex) => (
                            <tr className={styles.row} key={rowKey(row)}>
                                {columns.map((col, colIndex) => {
                                    const content = col.render(row, rowIndex);
                                    return (
                                        <td
                                            className={`${styles.td}${col.hideBelow ? ` ${styles[`hideBelow${col.hideBelow.charAt(0).toUpperCase()}${col.hideBelow.slice(1)}`]}` : ''}${hasEllipsis(col) ? ` ${styles.ellipsisCol}` : ''}`}
                                            key={colIndex}
                                            {...(hasEllipsis(col) ? { title: extractText(content) } : {})}
                                        >
                                            {content}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
