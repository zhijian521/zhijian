/*============================================================================
  breadcrumb — 站点面包屑导航

  服务端组件，接收 items 数组渲染分隔符 `/` 的面包屑。
============================================================================*/

/*== 依赖导入 ==*/
import Link from 'next/link';

/*== 样式导入 ==*/
import styles from './breadcrumb.module.css';

/*== 类型定义 ==*/
export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

/*== Breadcrumb 面包屑导航 ==*/
export function Breadcrumb({ items }: BreadcrumbProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="面包屑" className={styles.breadcrumb}>
            <ol className={styles.list}>
                {items.map((item, index) => (
                    <li className={styles.item} key={`${item.label}-${index}`}>
                        {index > 0 && (
                            <span aria-hidden>/</span>
                        )}
                        {item.href ? (
                            <Link className={styles.link} href={item.href}>
                                {item.label}
                            </Link>
                        ) : (
                            <span className={styles.current} aria-current="page">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
