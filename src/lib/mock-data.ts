/*== 静态示例数据：后台管理页面使用，后续接入 API 时替换数据源即可。 ==*/

/*-- 分类 --*/
export interface MockCategory {
    id: number;
    name: string;
    slug: string;
    postCount: number;
    sortOrder: number;
}

export const MOCK_CATEGORIES: MockCategory[] = [
    { id: 1, name: '技术笔记', slug: 'tech', postCount: 5, sortOrder: 1 },
    { id: 2, name: '生活随想', slug: 'life', postCount: 3, sortOrder: 2 },
    { id: 3, name: '项目实战', slug: 'project', postCount: 2, sortOrder: 3 },
    { id: 4, name: '读书笔记', slug: 'reading', postCount: 1, sortOrder: 4 },
];

/*-- 标签 --*/
export interface MockTag {
    id: number;
    name: string;
    slug: string;
    postCount: number;
}

export const MOCK_TAGS: MockTag[] = [
    { id: 1, name: 'React', slug: 'react', postCount: 4 },
    { id: 2, name: 'Next.js', slug: 'nextjs', postCount: 3 },
    { id: 3, name: 'CSS', slug: 'css', postCount: 2 },
    { id: 4, name: 'TypeScript', slug: 'typescript', postCount: 5 },
    { id: 5, name: '设计', slug: 'design', postCount: 1 },
    { id: 6, name: 'Node.js', slug: 'nodejs', postCount: 2 },
];

/*-- 文章 --*/
export interface MockPost {
    id: number;
    title: string;
    slug: string;
    summary: string;
    status: 'draft' | 'published';
    category: string;
    tags: string[];
    publishedAt: string | null;
    updatedAt: string;
}

export const MOCK_POSTS: MockPost[] = [
    {
        id: 1, title: 'CSS Modules 迁移实战', slug: 'css-modules-migration',
        status: 'published', category: '技术笔记', tags: ['CSS', 'React'],
        summary: '从 Tailwind CSS 迁移到 CSS Modules 的完整过程记录',
        publishedAt: '2026-05-20', updatedAt: '2026-06-01',
    },
    {
        id: 2, title: 'Next.js 15 App Router 详解', slug: 'nextjs-15-app-router',
        status: 'published', category: '技术笔记', tags: ['Next.js', 'React'],
        summary: '深入理解 Next.js 15 的 App Router 架构',
        publishedAt: '2026-05-15', updatedAt: '2026-05-28',
    },
    {
        id: 3, title: '知简项目设计思路', slug: 'zhijian-design',
        status: 'draft', category: '项目实战', tags: ['设计'],
        summary: '知简个人网站的设计哲学与实现方案',
        publishedAt: null, updatedAt: '2026-06-05',
    },
    {
        id: 4, title: 'TypeScript 高级类型技巧', slug: 'typescript-advanced-types',
        status: 'published', category: '技术笔记', tags: ['TypeScript'],
        summary: 'TypeScript 中条件类型、映射类型等高级用法',
        publishedAt: '2026-04-10', updatedAt: '2026-04-12',
    },
    {
        id: 5, title: 'React 19 新特性一览', slug: 'react-19-features',
        status: 'published', category: '技术笔记', tags: ['React'],
        summary: 'React 19 带来的主要变化和新 API',
        publishedAt: '2026-03-20', updatedAt: '2026-03-25',
    },
    {
        id: 6, title: '读书笔记：重构', slug: 'reading-refactoring',
        status: 'draft', category: '读书笔记', tags: ['设计'],
        summary: '《重构：改善既有代码的设计》读书笔记',
        publishedAt: null, updatedAt: '2026-06-03',
    },
    {
        id: 7, title: 'Node.js 流处理实战', slug: 'nodejs-stream',
        status: 'published', category: '技术笔记', tags: ['Node.js'],
        summary: 'Node.js 中 Stream 的使用场景与最佳实践',
        publishedAt: '2026-02-15', updatedAt: '2026-02-18',
    },
    {
        id: 8, title: '周末徒步记', slug: 'weekend-hiking',
        status: 'published', category: '生活随想', tags: [],
        summary: '一次周末徒步的所见所想',
        publishedAt: '2026-05-01', updatedAt: '2026-05-01',
    },
];

/*-- 用户 --*/
export interface MockUser {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'disabled';
    createdAt: string;
}

export const MOCK_USERS: MockUser[] = [
    { id: 1, username: 'admin', email: 'admin@zhijian.dev', role: 'admin', status: 'active', createdAt: '2026-01-01' },
    { id: 2, username: 'editor', email: 'editor@zhijian.dev', role: 'user', status: 'active', createdAt: '2026-03-15' },
    { id: 3, username: 'guest', email: 'guest@zhijian.dev', role: 'user', status: 'disabled', createdAt: '2026-05-01' },
];
