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
    { key: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}', logo: '/images/engines/google.svg' },
    { key: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={query}', logo: '/images/engines/bing.svg' },
    { key: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p={query}', logo: '/images/engines/yahoo.svg' },
    { key: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text={query}', logo: '/images/engines/yandex.svg' },
    { key: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}', logo: '/images/engines/duckduckgo.svg' },
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

export const BOOKMARKS: Bookmark[] = [
    { id: 'bm-github', name: 'GitHub', url: 'https://github.com' },
    { id: 'bm-gmail', name: 'Gmail', url: 'https://mail.google.com' },
    {
        id: 'bf-tools',
        name: '工具',
        children: [
            { id: 'bm-notion', name: 'Notion', url: 'https://notion.so' },
            { id: 'bm-figma', name: 'Figma', url: 'https://figma.com' },
            { id: 'bm-vercel', name: 'Vercel', url: 'https://vercel.com' },
        ],
    },
    { id: 'bm-stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { id: 'bm-mdn', name: 'MDN', url: 'https://developer.mozilla.org' },
    {
        id: 'bf-design',
        name: '设计',
        children: [
            { id: 'bm-dribbble', name: 'Dribbble', url: 'https://dribbble.com' },
            { id: 'bm-behance', name: 'Behance', url: 'https://behance.net' },
        ],
    },
];
