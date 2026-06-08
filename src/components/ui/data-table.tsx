import styles from './data-table.module.css';

/*== DataTable 列定义 ==*/
export interface DataColumn<T> {
    /** 列标题 */
    header: string;
    /** 数据字段访问器或自定义渲染 */
    render: (row: T, index: number) => React.ReactNode;
    /** 对齐方式 */
    align?: 'left' | 'right';
    /** 响应式隐藏断点 */
    hideBelow?: 'sm' | 'md' | 'lg';
    /** 列宽 */
    width?: string;
}

/*== DataTable 属性 ==*/
interface DataTableProps<T> {
    /** 列定义 */
    columns: DataColumn<T>[];
    /** 数据行 */
    rows: T[];
    /** 行 key 提取器 */
    rowKey: (row: T) => string | number;
    /** 空状态文案 */
    emptyText?: string;
}

/*== DataTable 通用数据表格 — 匹配博客表格风格。 ==*/
export function DataTable<T>({ columns, rows, rowKey, emptyText = '暂无数据' }: DataTableProps<T>) {
    const safeRows = rows ?? [];
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.thead}>
                        {columns.map((col, i) => (
                            <th
                                className={`${styles.th}${col.align === 'right' ? ` ${styles.thRight}` : ''}${col.hideBelow ? ` ${styles[`hideBelow${col.hideBelow.charAt(0).toUpperCase()}${col.hideBelow.slice(1)}`]}` : ''}`}
                                key={i}
                                style={col.width ? { width: col.width } : undefined}
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
                                {columns.map((col, colIndex) => (
                                    <td
                                        className={`${styles.td}${col.align === 'right' ? ` ${styles.tdRight}` : ''}${col.hideBelow ? ` ${styles[`hideBelow${col.hideBelow.charAt(0).toUpperCase()}${col.hideBelow.slice(1)}`]}` : ''}`}
                                        key={colIndex}
                                    >
                                        {col.render(row, rowIndex)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}