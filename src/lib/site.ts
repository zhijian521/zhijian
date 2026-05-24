import { BookOpen, LayoutDashboard, Settings, type LucideIcon } from 'lucide-react';

export const SITE_METADATA = {
  name: 'Zhijian',
  adminName: 'Zhijian Admin',
  title: '知简 | Minimalist Chinese Blog Platform',
  description:
    '一个基于 Next.js 与 MySQL 的个人内容网站，当前聚焦博客写作与后台管理，后续可以继续扩展其他内容模块。',
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

export interface NavItem {
  href: string;
  label: string;
  match: 'exact' | 'prefix';
}

export interface AdminNavItem extends NavItem {
  icon: LucideIcon;
}

/**
 * 前台导航只保留当前已经落地的页面，避免出现占位菜单。
 */
export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { href: APP_ROUTES.home, label: '首页', match: 'exact' },
  { href: APP_ROUTES.blog, label: '文章', match: 'prefix' },
  { href: APP_ROUTES.admin, label: '后台', match: 'prefix' },
];

/**
 * 后台菜单与真实路由一一对应，后续新增模块时从这里扩展。
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: APP_ROUTES.admin, icon: LayoutDashboard, label: '概览', match: 'exact' },
  { href: APP_ROUTES.adminPosts, icon: BookOpen, label: '文章', match: 'prefix' },
  { href: APP_ROUTES.adminSettings, icon: Settings, label: '设置', match: 'prefix' },
];
