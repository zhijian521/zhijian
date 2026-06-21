/*============================================================================
  导航页配置 — 书签、搜索引擎

  前期数据写死在此文件，后期接入数据库后替换数据源即可。
============================================================================*/

/*-- 搜索引擎 --*/
export interface SearchEngine {
    key: string;
    name: string;
    url: string; // 搜索 URL 模板，{query} 为占位符
}

export const SEARCH_ENGINES: SearchEngine[] = [
    { key: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}' },
    { key: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={query}' },
    { key: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={query}' },
    { key: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}' },
];

/*-- 书签 --*/
export interface BookmarkItem {
    name: string;
    url: string;
}

export interface BookmarkFolder {
    name: string;
    children: BookmarkItem[];
}

export type Bookmark = BookmarkItem | BookmarkFolder;

/*-- 判断是否为文件夹 --*/
export function isBookmarkFolder(b: Bookmark): b is BookmarkFolder {
    return 'children' in b;
}

export const BOOKMARKS: Bookmark[] = [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Gmail', url: 'https://mail.google.com' },
    {
        name: '工具',
        children: [
            { name: 'Notion', url: 'https://notion.so' },
            { name: 'Figma', url: 'https://figma.com' },
            { name: 'Vercel', url: 'https://vercel.com' },
        ],
    },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { name: 'MDN', url: 'https://developer.mozilla.org' },
    {
        name: '设计',
        children: [
            { name: 'Dribbble', url: 'https://dribbble.com' },
            { name: 'Behance', url: 'https://behance.net' },
        ],
    },
];
