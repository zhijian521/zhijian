/*============================================================================
  data-table — 通用数据表格

  后台表格组件，支持列定义（响应式隐藏/列宽/对齐）、空态展示、
  可横向滚动模式（scrollable）。直角边框匹配后台风格。
============================================================================*/

/*== 依赖导入 ==*/
import React from 'react';

/*== 样式导入 ==*/
import { cn } from '@/lib/core/utils';
import styles from './data-table.module.css';

/*== 类型定义 ==*/
export interface DataColumn<T> {
    /*-- 列标题 --*/
    header: string;
    /*-- 数据字段访问器或自定义渲染 --*/
    render: (row: T, index: number) => React.ReactNode;
    /*-- 响应式隐藏断点 --*/
    hideBelow?: 'sm' | 'md' | 'lg';
    /*-- 列宽（scrollable 模式用于 colgroup，同时自动启用打点+hover） --*/
    width?: string;
    /*-- 列对齐方式，默认 left --*/
    align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
    /*-- 列定义 --*/
    columns: DataColumn<T>[];
    /*-- 数据行 --*/
    rows: T[];
    /*-- 行唯一键提取函数 --*/
    rowKey: (row: T) => string | number;
    /*-- 空态文案，默认"暂无数据" --*/
    emptyText?: string;
    /*-- 列多可横向滚动：colgroup + table-layout:fixed --*/
    scrollable?: boolean;
}

/*== 根据 hideBelow 拼出响应式隐藏类名 ==*/
function hideClass(col: { hideBelow?: string }, css: Record<string, string>): string | undefined {
    if (!col.hideBelow) return undefined;
    return css[`hideBelow${col.hideBelow.charAt(0).toUpperCase()}${col.hideBelow.slice(1)}`];
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

/*== DataTable 通用数据表格 ==*/
export function DataTable<T>({ columns, rows, rowKey, emptyText = '暂无数据', scrollable = false }: DataTableProps<T>) {
    /* scrollable 模式：colgroup 声明列宽 + table min-width 保证可滚动 */
    const colWidths = scrollable ? columns.map((col) => col.width || 'auto') : null;

    const tableMinWidth =
        scrollable && colWidths
            ? colWidths.reduce((sum, w) => sum + (w === 'auto' ? 80 : Number(w.replace('px', ''))), 0)
            : 0;

    const isEllipsis = (col: DataColumn<T>) => scrollable && !!col.width;

    return (
        <div className={styles.tableWrapper}>
            <table
                className={cn(styles.table, scrollable && styles.tableFixed)}
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
                                className={cn(styles.th, hideClass(col, styles), isEllipsis(col) && styles.ellipsisCol)}
                                key={i}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td className={styles.emptyRow} colSpan={columns.length}>
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, rowIndex) => (
                            <tr className={styles.row} key={rowKey(row)}>
                                {columns.map((col, colIndex) => {
                                    const content = col.render(row, rowIndex);
                                    return (
                                        <td
                                            className={cn(
                                                styles.td,
                                                hideClass(col, styles),
                                                isEllipsis(col) && styles.ellipsisCol
                                            )}
                                            key={colIndex}
                                            {...(isEllipsis(col) ? { title: extractText(content) } : {})}
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
