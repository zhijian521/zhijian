/*============================================================================
  导航页配置 — 书签、搜索引擎

  前期数据写死在此文件，后期接入数据库后替换数据源即可。
============================================================================*/

/*-- 搜索引擎 --*/
export interface SearchEngine {
    key: string;
    name: string;
    url: string; // 搜索 URL 模板，{query} 为占位符
    icon: string; // SVG path data
}

export const SEARCH_ENGINES: SearchEngine[] = [
    {
        key: 'google',
        name: 'Google',
        url: 'https://www.google.com/search?q={query}',
        icon: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z',
    },
    {
        key: 'bing',
        name: 'Bing',
        url: 'https://www.bing.com/search?q={query}',
        icon: 'M5 3v16.5l4.67 2.5 7.33-4.17V13.5l-5.33-1.83L16.33 3H10.5L5 3zm5.33 6.33L14 10.83v5.34l-3.67 2.08V9.33z',
    },
    {
        key: 'yahoo',
        name: 'Yahoo',
        url: 'https://search.yahoo.com/search?p={query}',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3l1.5 4.5L18 12l-4.5 2.5L12 19l-1.5-4.5L6 12l4.5-2.5L12 5z',
    },
    {
        key: 'yandex',
        name: 'Yandex',
        url: 'https://yandex.com/search/?text={query}',
        icon: 'M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-1 14v-1h2v1h-2zm2-3.26V15h-2v-2.26C9.93 11.9 8 9.66 8 9c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .66-1.93 2.9-3 3.74z',
    },
    {
        key: 'duckduckgo',
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q={query}',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    },
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
