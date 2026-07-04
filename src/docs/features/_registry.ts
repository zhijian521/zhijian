/*============================================================================
  features/_registry — 功能文档索引

  手写登记 src/docs/features/ 下的每篇功能文档。
  docs:check 校验：登记项的 file 必须存在 + 磁盘 md 必须登记，双向防漏。
  /admin/docs 列表页读此 registry 按 group 分组渲染。
============================================================================*/

export interface DocEntry {
    /** 与文件名一致，用作 /admin/docs/[slug] 路由参数 */
    slug: string;
    /** 文档标题，取自 md 首行 # */
    title: string;
    /** 分组，用于后台列表按域归类 */
    group: 'site' | 'nav' | 'admin' | 'infra';
    /** 相对 src/docs/features/ 的文件名 */
    file: string;
    /** 一句话说明 */
    description: string;
}

export const DOC_REGISTRY: DocEntry[] = [
    {
        slug: 'home-blog',
        title: '博客前台',
        group: 'site',
        file: 'home-blog.md',
        description: '首页、文章列表页、文章详情页三页组成的前台展示。',
    },
    {
        slug: 'nav-portal',
        title: '导航页',
        group: 'nav',
        file: 'nav-portal.md',
        description: '/nav 全屏四屏分页浏览器导航，登录用户存库、游客存 localStorage。',
    },
    {
        slug: 'admin',
        title: '后台管理',
        group: 'admin',
        file: 'admin.md',
        description: '文章/分类标签/图片/用户/设置/统计等后台 CRUD 与布局架构。',
    },
    {
        slug: 'admin-analytics',
        title: '网站统计（观澜）',
        group: 'admin',
        file: 'admin-analytics.md',
        description: '统计概览页与站点管理页，前端渲染图表与接入代码分发。',
    },
    {
        slug: 'admin-export',
        title: '文章导出',
        group: 'admin',
        file: 'admin-export.md',
        description: '全部或单篇文章连同引用图片打包为 ZIP 下载。',
    },
    {
        slug: 'sync-uploads',
        title: '图片同步',
        group: 'admin',
        file: 'sync-uploads.md',
        description: '将服务器图片增量同步到本地 public/uploads/ 供开发预览。',
    },
    {
        slug: 'auth',
        title: '认证系统',
        group: 'infra',
        file: 'auth.md',
        description: 'admin/user 双角色 HMAC-SHA256 签名 session，无外部依赖。',
    },
    {
        slug: 'legacy-redirects',
        title: '旧站 URL 重定向',
        group: 'infra',
        file: 'legacy-redirects.md',
        description: '旧站地址到新站结构的 301 重定向配置。',
    },
    {
        slug: 'review-checklist',
        title: '功能审查清单',
        group: 'infra',
        file: 'review-checklist.md',
        description: '按功能模块和页面逐一列出对应文件，用于逐项代码审查。',
    },
    {
        slug: 'style-guide',
        title: '视觉风格指南',
        group: 'infra',
        file: 'style-guide.md',
        description: '设计系统：色彩、排版、组件规格与交互规范。',
    },
    {
        slug: 'deployment',
        title: '部署指南',
        group: 'infra',
        file: 'deployment.md',
        description: '生产环境部署配置：Nginx、环境变量、构建流程。',
    },
];
