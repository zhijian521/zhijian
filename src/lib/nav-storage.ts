import type { Bookmark } from '@/lib/nav-config';
import { BOOKMARKS } from '@/lib/nav-config';

/*============================================================================
  导航页本地存储 — 搜索记录、备忘录、笔记、书签

  前期数据存 localStorage，后期接入数据库后替换数据源即可。
  上层组件通过此模块读写，不直接操作 localStorage。
============================================================================*/

/*-- 存储键 --*/
const KEYS = {
    searchHistory: 'zhijian_nav_search_history',
    searchEngine: 'zhijian_nav_search_engine',
    todos: 'zhijian_nav_todos',
    notes: 'zhijian_nav_notes',
    bookmarks: 'zhijian_nav_bookmarks',
} as const;

/*== 搜索记录 ==*/

export interface SearchRecord {
    query: string;
    engine: string;
    time: number; // timestamp
}

const MAX_SEARCH_HISTORY = 10;

export function getSearchHistory(): SearchRecord[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.searchHistory);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function addSearchRecord(record: SearchRecord): void {
    const history = getSearchHistory();
    /*-- 去重：相同 query 只保留最新 --*/
    const filtered = history.filter(h => h.query !== record.query);
    filtered.unshift(record);
    localStorage.setItem(KEYS.searchHistory, JSON.stringify(filtered.slice(0, MAX_SEARCH_HISTORY)));
}

export function clearSearchHistory(): void {
    localStorage.removeItem(KEYS.searchHistory);
}

/*== 默认搜索引擎 ==*/

export function getSearchEngine(): string {
    if (typeof window === 'undefined') return 'google';
    return localStorage.getItem(KEYS.searchEngine) || 'google';
}

export function setSearchEngine(key: string): void {
    localStorage.setItem(KEYS.searchEngine, key);
}

/*== 备忘录（待办） ==*/

export interface TodoItem {
    id: string;
    text: string;
    done: boolean;
    createdAt: number;
}

export function getTodos(): TodoItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.todos);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveTodos(todos: TodoItem[]): void {
    localStorage.setItem(KEYS.todos, JSON.stringify(todos));
}

/*== 笔记 ==*/

export interface NoteItem {
    id: string;
    title: string;
    content: string; // Markdown
    createdAt: number;
    updatedAt: number;
}

export function getNotes(): NoteItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.notes);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveNotes(notes: NoteItem[]): void {
    localStorage.setItem(KEYS.notes, JSON.stringify(notes));
}

/*== 书签 ==*/

export function getBookmarks(): Bookmark[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.bookmarks);
        if (raw) return JSON.parse(raw);
        /*-- 首次加载用静态默认值 --*/
        localStorage.setItem(KEYS.bookmarks, JSON.stringify(BOOKMARKS));
        return BOOKMARKS;
    } catch {
        return BOOKMARKS;
    }
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
    localStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks));
}
