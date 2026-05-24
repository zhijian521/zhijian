import { BookOpen, LayoutDashboard, Settings, type LucideIcon } from 'lucide-react';

export const SITE_METADATA = {
    name: 'Zhijian',
    adminName: 'Zhijian Admin',
    title: 'Zhijian',
    description: 'Zhijian：A simple personal website.',
} as const;

export const APP_ROUTES = {
    home: '/',
    blog: '/blog',
    admin: '/admin',
    adminPosts: '/admin/posts',
    adminPostCreate: '/admin/posts/new',
    adminSettings: '/admin/settings',
} as const;

export const API_ROUTES = {
    adminLogin: '/api/admin/login',
    adminLogout: '/api/admin/logout',
    adminPosts: '/api/admin/posts',
} as const;

/*== 导航项基础配置，match 控制高亮匹配策略。 ==*/
export interface NavItem {
    href: string;
    label: string;
    match: 'exact' | 'prefix';
}

/*== 后台导航项，在 NavItem 基础上增加图标。 ==*/
export interface AdminNavItem extends NavItem {
    icon: LucideIcon;
}

/*== 前台导航只保留当前已经落地的页面，避免出现占位菜单。 ==*/
export const PUBLIC_NAV_ITEMS: NavItem[] = [
    { href: APP_ROUTES.home, label: '首页', match: 'exact' },
    { href: APP_ROUTES.blog, label: '文章', match: 'prefix' },
    { href: APP_ROUTES.admin, label: '后台', match: 'prefix' },
];

/*== 后台菜单与真实路由一一对应，后续新增模块时从这里扩展。 ==*/
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    { href: APP_ROUTES.admin, icon: LayoutDashboard, label: '概览', match: 'exact' },
    { href: APP_ROUTES.adminPosts, icon: BookOpen, label: '文章', match: 'prefix' },
    { href: APP_ROUTES.adminSettings, icon: Settings, label: '设置', match: 'prefix' },
];
