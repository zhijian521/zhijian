import {
    LayoutDashboardIcon,
    BookOpenIcon,
    FileTextIcon,
    FolderTreeIcon,
    TagIcon,
    UsersIcon,
    SettingsIcon,
    WrenchIcon,
    CodeIcon,
    ActivityIcon,
    ImageIcon,
    type IconComponent,
} from '@/components/ui/icons';

export const SITE_METADATA = {
    name: 'Zhijian',
    adminName: 'Zhijian Admin',
    title: '知简',
    brandTitle: 'Zhijian - 简静造物',
    description: '简静造物，以代码与文字记录所思所学。知简 — 涵盖前端开发、React、Next.js、TypeScript、全栈实践与简约设计思考的个人技术博客。',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
    locale: 'zh_CN',
    ogImage: '/images/main.png',
    author: 'Zhi Jian',
    blogTitle: '文章列表',
    blogDescription:
        '写代码，也写文字；喜欢简洁的设计，追求美好的事物。知简的技术博客，涵盖前端开发、React、Next.js、TypeScript 与全栈实践，安静造物，步履不停。',
    keywords: ['简静造物', '知简', 'Zhijian', '前端开发', '全栈开发', '全栈实践', 'React', 'Next.js', 'TypeScript', 'CSS Modules', 'MySQL', '简约设计', '技术博客', '个人博客'],
} as const;

export const APP_ROUTES = {
    home: '/',
    blog: '/blog',
    /*-- 后台 --*/
    admin: '/admin',
    adminLogin: '/admin/login',
    adminPosts: '/admin/posts',
    adminUsers: '/admin/users',
    adminUserCreate: '/admin/users/new',
    adminSettings: '/admin/settings',
    adminCategories: '/admin/categories',
    adminTags: '/admin/tags',
    adminUploads: '/admin/uploads',
    adminComponents: '/admin/components',
    adminAnalytics: '/admin/analytics',
    adminAnalyticsSites: '/admin/analytics/sites',
    /*-- 错误 --*/
    forbidden: '/forbidden',
} as const;

export const STORAGE_KEYS = {
    adminRememberedUsername: 'zhijian_admin_remembered_username',
} as const;

/*== 导航项基础配置：match 控制高亮匹配策略。 ==*/
export interface NavItem {
    href: string;
    label: string;
    match: 'exact' | 'prefix';
}

/*== 二级导航子项。 ==*/
export interface NavSubItem {
    href: string;
    label: string;
    icon: IconComponent;
    match?: 'exact' | 'prefix';
}

/*== 导航分组：有 label 为可折叠分组，无 label 为顶级单项。 ==*/
export interface NavGroup {
    key: string;
    label?: string;
    icon?: IconComponent;
    items: NavSubItem[];
}

/*== 前台导航：保留当前已落地的页面入口。 ==*/
export const PUBLIC_NAV_ITEMS: NavItem[] = [
    { href: APP_ROUTES.home, label: '首页', match: 'exact' },
    { href: APP_ROUTES.blog, label: '文章', match: 'prefix' },
];

/*== 后台二级菜单：和真实路由保持一一对应。 ==*/
export const ADMIN_NAV_GROUPS: NavGroup[] = [
    {
        key: 'overview',
        items: [{ href: APP_ROUTES.admin, label: '概览', icon: LayoutDashboardIcon, match: 'exact' }],
    },
    {
        key: 'content',
        label: '文章管理',
        icon: BookOpenIcon,
        items: [
            { href: APP_ROUTES.adminPosts, label: '文章列表', icon: FileTextIcon, match: 'prefix' },
            { href: APP_ROUTES.adminCategories, label: '分类管理', icon: FolderTreeIcon, match: 'prefix' },
            { href: APP_ROUTES.adminTags, label: '标签管理', icon: TagIcon, match: 'prefix' },
            { href: APP_ROUTES.adminUploads, label: '图片管理', icon: ImageIcon, match: 'prefix' },
        ],
    },
    {
        key: 'system',
        label: '系统管理',
        icon: SettingsIcon,
        items: [
            { href: APP_ROUTES.adminUsers, label: '用户管理', icon: UsersIcon, match: 'prefix' },
            { href: APP_ROUTES.adminComponents, label: '组件列表', icon: CodeIcon, match: 'exact' },
            { href: APP_ROUTES.adminSettings, label: '系统设置', icon: WrenchIcon, match: 'exact' },
        ],
    },
    {
        key: 'analytics',
        label: '网站统计',
        icon: ActivityIcon,
        items: [
            { href: APP_ROUTES.adminAnalytics, label: '数据概览', icon: ActivityIcon, match: 'exact' },
            { href: APP_ROUTES.adminAnalyticsSites, label: '站点管理', icon: FolderTreeIcon, match: 'prefix' },
        ],
    },
];
