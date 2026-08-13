/*============================================================================
  breadcrumb - 面包屑导航

  以语义化路径展示当前位置；最后一项始终作为当前页标识。
============================================================================*/
import Link from "next/link";

import styles from "./breadcrumb.module.css";

export interface BreadcrumbItem {
    href?: string;
    label: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="面包屑" className={styles.root}>
            <ol className={styles.list}>
                {items.map((item, index) => {
                    const isCurrentPage = index === items.length - 1;

                    return (
                        <li className={styles.item} key={item.href ?? item.label}>
                            {index > 0 ? (
                                <span aria-hidden="true" className={styles.separator}>
                                    /
                                </span>
                            ) : null}
                            {item.href && !isCurrentPage ? (
                                <Link className={styles.link} href={item.href}>
                                    {item.label}
                                </Link>
                            ) : (
                                <span aria-current={isCurrentPage ? "page" : undefined} className={isCurrentPage ? styles.current : undefined}>
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
