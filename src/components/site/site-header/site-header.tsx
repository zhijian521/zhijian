'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MenuIcon, XIcon } from '@/components/ui/icons';
import { APP_ROUTES, PUBLIC_NAV_ITEMS, SITE_METADATA } from '@/lib/core/site';
import { isNavItemActive } from '@/lib/core/utils';
import styles from './site-header.module.css';

interface SiteHeaderProps {
    transparent?: boolean;
}

/*== 前台公共导航栏：logo + 桌面导航 + 移动端菜单，透明/滚动毛玻璃双模式 ==*/
export function SiteHeader({ transparent = false }: SiteHeaderProps) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const mobileNavRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    /*-- 预计算导航项活跃状态 --*/
    const navItems = useMemo(
        () => PUBLIC_NAV_ITEMS.map((item) => ({ ...item, isActive: isNavItemActive(pathname, item.href, item.match) })),
        [pathname],
    );

    /*-- 路由切换关闭菜单 --*/
    useEffect(() => setIsMobileNavOpen(false), [pathname]);

    /*-- 透明模式下滚动检测 --*/
    useEffect(() => {
        if (!transparent) return;
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [transparent]);

    /*-- 关闭移动菜单并归还焦点 --*/
    const closeMenu = useCallback(() => {
        setIsMobileNavOpen(false);
        triggerRef.current?.focus();
    }, []);

    /*-- 移动菜单：点击外部 / Escape 关闭 --*/
    useEffect(() => {
        if (!isMobileNavOpen) return;

        const onOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!mobileNavRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
                closeMenu();
            }
        };
        const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };

        document.addEventListener('mousedown', onOutside);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onOutside);
            document.removeEventListener('keydown', onEscape);
        };
    }, [isMobileNavOpen, closeMenu]);

    const headerClass = transparent
        ? `${styles.headerHome} ${isScrolled ? styles.headerScrolled : ''}`
        : styles.headerInner;

    return (
        <header className={headerClass}>
            <div className={styles.headerContainer}>
                <Link className={styles.brand} href={APP_ROUTES.home}>
                    <Image alt={SITE_METADATA.name} height={32} src="/images/logo.webp" width={32} />
                    <span className={styles.brandText}>{SITE_METADATA.name}</span>
                </Link>

                <div className={styles.navArea}>
                    {/* 桌面导航 */}
                    <nav aria-label="站点主导航" className={styles.nav}>
                        {navItems.map((item) => (
                            <Link className={`${styles.navLink} ${item.isActive ? styles.navLinkActive : styles.navLinkInactive}`} href={item.href} key={item.label}>
                                {item.label}
                                {item.isActive ? <span aria-hidden className={styles.navUnderline} /> : null}
                            </Link>
                        ))}
                    </nav>

                    {/* 移动端导航 */}
                    <div className={styles.mobileNavWrapper}>
                        <button
                            aria-controls="public-mobile-nav"
                            aria-expanded={isMobileNavOpen}
                            aria-label={isMobileNavOpen ? '关闭导航菜单' : '打开导航菜单'}
                            className={`${styles.mobileMenu} ${isMobileNavOpen ? styles.mobileMenuOpen : ''}`}
                            onClick={() => setIsMobileNavOpen((v) => !v)}
                            ref={triggerRef}
                            type="button"
                        >
                            <MenuIcon className={styles.mobileMenuIcon} />
                        </button>

                        {isMobileNavOpen ? (
                            <div aria-label="移动端导航菜单" className={styles.mobilePanel} id="public-mobile-nav" ref={mobileNavRef} role="dialog">
                                <div className={styles.mobilePanelHeader}>
                                    <span className={styles.mobilePanelTitle}>导航</span>
                                    <button aria-label="关闭导航菜单" className={styles.mobileClose} onClick={closeMenu} type="button">
                                        <XIcon className={styles.mobileCloseIcon} />
                                    </button>
                                </div>
                                <nav aria-label="移动端站点导航" className={styles.mobileNav}>
                                    {navItems.map((item) => (
                                        <Link className={`${styles.mobileNavLink} ${item.isActive ? styles.mobileNavLinkActive : ''}`} href={item.href} key={item.label}>
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
}
