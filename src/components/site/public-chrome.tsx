'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { APP_ROUTES, PUBLIC_NAV_ITEMS, SITE_METADATA } from '@/lib/site';
import styles from './public-chrome.module.css';

interface PublicChromeProps {
    children: React.ReactNode;
}

/*== 前台公共壳层：统一提供顶部导航和页脚，并根据当前路由实时更新导航高亮。 ==*/
export default function PublicChrome({ children }: PublicChromeProps) {
    const pathname = usePathname();
    const isHomePage = pathname === APP_ROUTES.home;

    return (
        <div className={styles.root}>
            {/* 导航栏 */}
            <header className={isHomePage ? styles.headerHome : styles.headerInner}>
                <div className={styles.headerContainer}>
                    {/* 左侧：品牌 */}
                    <Link className={styles.brand} href={APP_ROUTES.home}>
                        <Image alt={SITE_METADATA.name} height={32} src="/images/admin-login-logo.png" width={32} />
                        <span className={styles.brandText}>{SITE_METADATA.name}</span>
                    </Link>

                    {/* 右侧：导航 + 移动端菜单 */}
                    <div className={styles.navArea}>
                        <nav aria-label="站点主导航" className={styles.nav}>
                            {PUBLIC_NAV_ITEMS.map((item) => {
                                const isActive = item.match === 'exact' ? pathname === item.href : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        className={`${styles.navLink} ${isActive ? styles.navLinkActive : styles.navLinkInactive}`}
                                        href={item.href}
                                        key={item.label}
                                    >
                                        {item.label}
                                        {isActive ? <span aria-hidden className={styles.navUnderline} /> : null}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* 移动端菜单 */}
                        <button aria-label="打开导航菜单" className={styles.mobileMenu} type="button">
                            <Menu size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.main}>{children}</div>

            {/* 页脚 */}
            <footer className={styles.footer}>
                <p className={styles.footerCopy}>
                    © {new Date().getFullYear()} {SITE_METADATA.name} : 认真生活，简单做人，用心做事
                </p>
            </footer>
        </div>
    );
}
