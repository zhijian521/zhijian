/*============================================================================
  导航页配置 — 书签、搜索引擎

  前期数据写死在此文件，后期接入数据库后替换数据源即可。
============================================================================*/

/*-- 搜索引擎 --*/
export interface SearchEngine {
    key: string;
    name: string;
    url: string; // 搜索 URL 模板，{query} 为占位符
    logo: string; // SVG 图标路径
}

export const SEARCH_ENGINES: SearchEngine[] = [
    {
        key: 'google',
        name: 'Google',
        url: 'https://www.google.com/search?q={query}',
        logo: '/images/engines/google.svg',
    },
    { key: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={query}', logo: '/images/engines/bing.svg' },
    {
        key: 'yahoo',
        name: 'Yahoo',
        url: 'https://search.yahoo.com/search?p={query}',
        logo: '/images/engines/yahoo.svg',
    },
    {
        key: 'yandex',
        name: 'Yandex',
        url: 'https://yandex.com/search/?text={query}',
        logo: '/images/engines/yandex.svg',
    },
    {
        key: 'duckduckgo',
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q={query}',
        logo: '/images/engines/duckduckgo.svg',
    },
];

/*-- 书签 --*/
export interface BookmarkItem {
    id: string;
    name: string;
    url: string;
}

export interface BookmarkFolder {
    id: string;
    name: string;
    children: BookmarkItem[];
}

export type Bookmark = BookmarkItem | BookmarkFolder;

/*-- 判断是否为文件夹 --*/
export function isBookmarkFolder(b: Bookmark): b is BookmarkFolder {
    return 'children' in b;
}

/*-- 默认书签版本，改了 BOOKMARKS 就 +1，自动覆盖用户旧缓存 --*/
export const BOOKMARKS_VERSION = 2;

export const BOOKMARKS: Bookmark[] = [
    /*-- 常用 --*/
    { id: 'bm-github', name: 'GitHub', url: 'https://github.com' },
    { id: 'bm-gmail', name: 'Gmail', url: 'https://mail.google.com' },
    { id: 'bm-chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com' },
    { id: 'bm-claude', name: 'Claude', url: 'https://claude.ai' },
    /*-- 开发 --*/
    {
        id: 'bf-dev',
        name: '开发',
        children: [
            { id: 'bm-vercel', name: 'Vercel', url: 'https://vercel.com' },
            { id: 'bm-mdn', name: 'MDN', url: 'https://developer.mozilla.org' },
            { id: 'bm-stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com' },
        ],
    },
    /*-- AI --*/
    {
        id: 'bf-ai',
        name: 'AI',
        children: [
            { id: 'bm-gemini', name: 'Gemini', url: 'https://gemini.google.com' },
            { id: 'bm-coze', name: 'Coze', url: 'https://coze.com' },
        ],
    },
    /*-- 设计 --*/
    {
        id: 'bf-design',
        name: '设计',
        children: [
            { id: 'bm-figma', name: 'Figma', url: 'https://figma.com' },
            { id: 'bm-dribbble', name: 'Stitch', url: 'https://stitch.withgoogle.com' },
        ],
    },
    /*-- 社交 --*/
    {
        id: 'bf-social',
        name: '社交',
        children: [
            { id: 'bm-x', name: 'X', url: 'https://x.com' },
            { id: 'bm-instagram', name: 'Instagram', url: 'https://instagram.com' },
            { id: 'bm-reddit', name: 'Reddit', url: 'https://reddit.com' },
            { id: 'bm-weibo', name: '微博', url: 'https://weibo.com' },
            { id: 'bm-zhihu', name: '知乎', url: 'https://zhihu.com' },
        ],
    },
    /*-- 影音 --*/
    {
        id: 'bf-media',
        name: '影音',
        children: [
            { id: 'bm-douyin', name: '抖音', url: 'https://douyin.com' },
            { id: 'bm-youtube', name: 'YouTube', url: 'https://youtube.com' },
            { id: 'bm-bilibili', name: 'Bilibili', url: 'https://bilibili.com' },
            { id: 'bm-spotify', name: 'Apple Music', url: 'https://music.apple.com' },
            { id: 'bm-netease-music', name: '网易云', url: 'https://music.163.com' },
        ],
    },
];
