'use client';

/*============================================================================
  admin-sidebar — 后台侧边导航

  根据后台导航配置渲染分组菜单，处理当前路由高亮、
  分组折叠、快捷创建文章和退出登录。
============================================================================*/

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

/*== 组件导入 ==*/
import { ChevronRightIcon, LogOutIcon, PlusIcon, UserCircle2Icon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

/*== 数据与配置 ==*/
import { ADMIN_NAV_GROUPS, APP_ROUTES, SITE_METADATA } from '@/lib/core/site';
import { api } from '@/lib/core/http-client';
import { cn, isNavItemActive } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './admin-sidebar.module.css';

/*== 后台侧边栏：数据驱动二级折叠菜单，自动展开当前路由所在分组。 ==*/
export default function AdminSidebar() {
    const pathname = usePathname();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    /* 计算每个分组的展开状态：当前路由匹配分组下任一子项时自动展开，否则用手动状态 */
    const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({});

    function isGroupOpen(key: string, items: { href: string; match?: 'exact' | 'prefix' }[]): boolean {
        // 用户手动操作过时，以手动状态为准
        if (key in manualOpen) return manualOpen[key];
        // 未手动操作时，当前路由匹配分组下任一子项则自动展开，否则默认收起
        return items.some((item) => isNavItemActive(pathname, item.href, item.match ?? 'prefix'));
    }

    function toggleGroup(key: string) {
        setManualOpen((prev) => {
            const currentOpen = key in prev ? prev[key] : isGroupAutoOpen(key);
            return { ...prev, [key]: !currentOpen };
        });
    }

    function isGroupAutoOpen(key: string): boolean {
        const group = ADMIN_NAV_GROUPS.find((g) => g.key === key);
        if (!group) return false;
        return group.items.some((item) => isNavItemActive(pathname, item.href, item.match ?? 'prefix'));
    }

    function handleLogout() {
        setIsLoggingOut(true);
        api.post('/auth/logout').finally(() => {
            window.location.href = APP_ROUTES.adminLogin;
        });
    }

    async function handleCreatePost() {
        setIsCreating(true);
        try {
            const res = await api.post<{ id: number }>('/admin/posts', {});
            if (res.code === 0 && res.data) {
                window.open(`${APP_ROUTES.adminPosts}/${res.data.id}`);
                return;
            }
            toast.error(res.message || '新建文章失败');
        } catch {
            toast.error('新建文章失败');
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <aside className={styles.sidebar}>
            {/* 品牌区 */}
            <div className={styles.brand}>
                <Image
                    alt="Zhijian Admin"
                    className={styles.logo}
                    height={52}
                    priority
                    src="/images/logo.webp"
                    width={52}
                />
                <div className={styles.brandText}>
                    <h2 className={styles.brandTitle}>{SITE_METADATA.adminName}</h2>
                    <p className={styles.brandSubtitle}>Content Management</p>
                </div>
            </div>

            {/* 撰写文章快捷入口 */}
            <button className={styles.createButton} disabled={isCreating} onClick={handleCreatePost} type="button">
                <PlusIcon aria-hidden="true" className={styles.navIcon} />
                <span>{isCreating ? '创建中...' : '撰写文章'}</span>
            </button>

            {/* 导航区 */}
            <nav aria-label="后台主导航" className={styles.nav}>
                {ADMIN_NAV_GROUPS.map((group) => {
                    // 顶级单项（如概览）：无 label，直接渲染
                    if (!group.label) {
                        return group.items.map((item) => {
                            const isActive = isNavItemActive(pathname, item.href, item.match ?? 'prefix');
                            const Icon = item.icon;
                            return (
                                <Link
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cn(styles.navItem, isActive && styles.navActive)}
                                    href={item.href}
                                    key={item.href}
                                >
                                    <Icon aria-hidden="true" className={styles.navIcon} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        });
                    }

                    // 可折叠分组
                    const GroupIcon = group.icon;
                    const open = isGroupOpen(group.key, group.items);
                    const subNavId = `admin-nav-group-${group.key}`;

                    return (
                        <div className={styles.navGroup} key={group.key}>
                            <button
                                aria-controls={subNavId}
                                aria-expanded={open}
                                className={styles.groupHeader}
                                onClick={() => toggleGroup(group.key)}
                                type="button"
                            >
                                {GroupIcon && <GroupIcon aria-hidden="true" className={styles.groupIcon} />}
                                <span>{group.label}</span>
                                <ChevronRightIcon
                                    aria-hidden="true"
                                    className={cn(styles.groupArrow, open && styles.groupArrowOpen)}
                                />
                            </button>

                            <div hidden={!open} id={subNavId}>
                                {group.items.map((item) => {
                                    const isActive = isNavItemActive(pathname, item.href, item.match ?? 'prefix');
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            aria-current={isActive ? 'page' : undefined}
                                            className={cn(styles.subNavItem, isActive && styles.subNavActive)}
                                            href={item.href}
                                            key={item.href}
                                        >
                                            <Icon aria-hidden="true" className={styles.navIcon} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* 底部区 */}
            <div className={styles.footer}>
                <button className={cn(styles.footerButton, styles.navItem)} type="button">
                    <UserCircle2Icon aria-hidden="true" className={styles.navIcon} />
                    <span>个人资料</span>
                </button>
                <button
                    className={cn(styles.footerButton, styles.navItem, styles.footerDanger)}
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    type="button"
                >
                    <LogOutIcon aria-hidden="true" className={styles.navIcon} />
                    <span>{isLoggingOut ? '退出中...' : '退出登录'}</span>
                </button>
            </div>
        </aside>
    );
}
