/*============================================================================
  站点全局配置

  本文件是知简项目的唯一配置入口，集中管理：
  - 站点元数据（标题、描述、关键词、SEO）
  - 路由路径常量
  - 前台/后台导航结构
  - 本地存储键名

  修改原则：
  - 标题/描述/关键词 → 改 SITE_METADATA，全局自动生效
  - 新增页面路由 → 改 APP_ROUTES，导航引用自动同步
  - 新增导航项 → 改 PUBLIC_NAV_ITEMS 或 ADMIN_NAV_GROUPS
  - 不要在页面组件中硬编码标题/路径，统一引用此文件
============================================================================*/

/*== 站点元数据 — SEO、OG、JSON-LD 的数据源 ==*/

export const SITE_METADATA = {
    /*-- 英文品牌名，用于后台标题等场景 --*/
    name: 'Zhijian',
    /*-- 后台管理页品牌名 --*/
    adminName: 'Zhijian Admin',
    /*-- 中文站名，用于 JSON-LD、siteName 等结构化数据 --*/
    title: '知简',
    /*-- 品牌标题，主页 <title> 直接使用，根布局 template 后缀，改此一处全站生效 --*/
    brandTitle: 'Zhijian博客 - 简静造物',
    /*-- 全局描述，主页 <meta description> / OG / Twitter / JSON-LD --*/
    description:
        'Zhijian的个人技术博客 — 追求简洁设计与美好事物，以代码与文字安静造物。涵盖前端开发、React、Next.js、TypeScript、AI编程、Vibe Coding、全栈实践与Agent开发。',
    /*-- 站点 URL，读 NEXT_PUBLIC_SITE_URL，用于 canonical / OG url / sitemap --*/
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yuwb.dev',
    /*-- OG / Twitter 区域标识 --*/
    locale: 'zh_CN',
    /*-- OG 默认分享图（相对路径，metadataBase 自动补全绝对 URL） --*/
    ogImage: '/images/og-default.webp',
    /*-- 作者名，metadata.authors / JSON-LD Person / 首页 Hero 与个人名片 --*/
    author: 'Zhi Jian',
    /*-- 作者签名行，首页 Hero 副标题与个人名片 meta 共用 --*/
    authorTagline: '前端开发 · 全栈 · 简约设计 · 造物',
    /*-- 首屏导语，首页 Hero 文案 --*/
    authorMotto: '写代码，也写文字；喜欢简洁的设计，追求美好的事物；一切在这里记录。',
    /*-- 作者简介，首页个人名片文案 --*/
    authorBio: '喜欢简洁的设计，也喜欢安静地写点代码。偶尔捣鼓些小工具，把一闪而过的想法变成看得见的东西。这里没有宏大的叙事，只有一些零散的记录和简单的快乐。',
    /*-- 文章列表页标题前缀，拼接：blogTitle - [分类] - [标签] - brandTitle --*/
    blogTitle: '文章',
    /*-- 文章列表页描述，/blog 页 <meta description> / OG / Twitter --*/
    blogDescription:
        'Zhijian的技术博客，追求简洁设计与美好事物，安静造物。分享前端开发、React、Next.js、TypeScript、AI编程、Vibe Coding、Agent开发与全栈实践。',
    /*-- 全站关键词，详情页自动追加文章标签和分类名 --*/
    keywords: [
        '简静造物',
        '知简',
        'Zhijian',
        '前端开发',
        '全栈开发',
        '全栈实践',
        'React',
        'Next.js',
        'TypeScript',
        'CSS Modules',
        'MySQL',
        '简约设计',
        '技术博客',
        '个人博客',
        'AI编程',
        'Vibe Coding',
        'Agent开发',
        'Claude Code',
    ],
} as const;

/*== 路由路径常量 — 全站路由统一引用，避免硬编码 ==*/

export const APP_ROUTES = {
    /*-- 前台 --*/
    home: '/', // 首页
    blog: '/blog', // 文章列表
    nav: '/nav', // 导航页

    /*-- 后台 --*/
    admin: '/admin', // 后台首页（概览）
    adminLogin: '/admin/login', // 登录页
    adminPosts: '/admin/posts', // 文章管理
    adminUsers: '/admin/users', // 用户管理
    adminUserCreate: '/admin/users/new', // 新建用户
    adminSettings: '/admin/settings', // 系统设置
    adminTaxonomy: '/admin/taxonomy', // 分类与标签
    adminUploads: '/admin/uploads', // 图片管理
    adminAnalytics: '/admin/analytics', // 数据概览（观澜）
    adminAnalyticsSites: '/admin/analytics/sites', // 站点管理
    adminShowcase: '/admin/showcase', // 组件展示
    adminShowcaseComponents: '/admin/showcase/components', // 组件预览
    adminShowcaseIcons: '/admin/showcase/icons', // 图标预览

    /*-- 错误 --*/
    forbidden: '/forbidden', // 403 无权限
} as const;

/*== 本地存储键名 — 集中管理，避免拼写不一致 ==*/

export const STORAGE_KEYS = {
    /*-- 登录页「记住用户名」复选框存储键 --*/
    adminRememberedUsername: 'zhijian_admin_remembered_username',
} as const;

/*== 导航项基础配置：match 控制高亮匹配策略。 ==*/
export interface NavItem {
    href: string;
    label: string;
    match: 'exact' | 'prefix';
}

/*== 导航图标 key：core 层只存字符串 key，key → 图标组件的映射见 components/ui/nav-icons.ts ==*/
export type NavIconKey =
    | 'activity'
    | 'book-open'
    | 'code'
    | 'file-text'
    | 'folder-tree'
    | 'image'
    | 'layout-dashboard'
    | 'settings'
    | 'users'
    | 'wrench';

/*== 二级导航子项。 ==*/
export interface NavSubItem {
    href: string;
    label: string;
    icon: NavIconKey;
    match?: 'exact' | 'prefix';
}

/*== 导航分组：有 label 为可折叠分组，无 label 为顶级单项。 ==*/
export interface NavGroup {
    key: string;
    label?: string;
    icon?: NavIconKey;
    items: NavSubItem[];
}

/*== 前台导航：顶部导航栏菜单项 ==*/
export const PUBLIC_NAV_ITEMS: NavItem[] = [
    { href: APP_ROUTES.home, label: '首页', match: 'exact' },
    { href: APP_ROUTES.blog, label: '文章', match: 'prefix' },
];

/*== 后台二级菜单：侧边栏分组 + 子项，和真实路由保持一一对应 ==*/
export const ADMIN_NAV_GROUPS: NavGroup[] = [
    {
        key: 'overview',
        items: [{ href: APP_ROUTES.admin, label: '概览', icon: 'layout-dashboard', match: 'exact' }],
    },
    {
        key: 'content',
        label: '文章管理',
        icon: 'book-open',
        items: [
            { href: APP_ROUTES.adminPosts, label: '文章列表', icon: 'file-text', match: 'prefix' },
            { href: APP_ROUTES.adminTaxonomy, label: '分类标签', icon: 'folder-tree', match: 'prefix' },
            { href: APP_ROUTES.adminUploads, label: '图片管理', icon: 'image', match: 'prefix' },
        ],
    },
    {
        key: 'system',
        label: '系统管理',
        icon: 'settings',
        items: [
            { href: APP_ROUTES.adminUsers, label: '用户管理', icon: 'users', match: 'prefix' },
            { href: APP_ROUTES.adminSettings, label: '系统设置', icon: 'wrench', match: 'exact' },
        ],
    },
    {
        key: 'analytics',
        label: '网站统计',
        icon: 'activity',
        items: [
            { href: APP_ROUTES.adminAnalytics, label: '数据概览', icon: 'activity', match: 'exact' },
            { href: APP_ROUTES.adminAnalyticsSites, label: '站点管理', icon: 'folder-tree', match: 'prefix' },
        ],
    },
    {
        key: 'devtools',
        label: '开发工具',
        icon: 'code',
        items: [
            { href: APP_ROUTES.adminShowcaseComponents, label: '组件预览', icon: 'layout-dashboard', match: 'exact' },
            { href: APP_ROUTES.adminShowcaseIcons, label: '图标预览', icon: 'image', match: 'exact' },
        ],
    },
];
