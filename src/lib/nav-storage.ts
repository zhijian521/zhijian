import type { Bookmark } from '@/lib/nav-config';
import { BOOKMARKS, BOOKMARKS_VERSION } from '@/lib/nav-config';

/*============================================================================
  导航页统一数据层 — 登录走 API，未登录走 localStorage
  上层组件通过此模块读写，不直接操作 localStorage。
============================================================================*/

/*-- 生成唯一 ID --*/
export function genId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/*-- 存储键 --*/
const KEYS = {
    searchHistory: 'zhijian_nav_search_history',
    searchEngine: 'zhijian_nav_search_engine',
    todos: 'zhijian_nav_todos',
    notes: 'zhijian_nav_notes',
    bookmarks: 'zhijian_nav_bookmarks',
    bookmarksVersion: 'zhijian_nav_bookmarks_version',
} as const;

/*== 搜索记录（仅 localStorage，不上云） ==*/

export interface SearchRecord {
    id: string;
    query: string;
    engine: string;
    time: number;
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
    const filtered = history.filter(h => h.query !== record.query);
    filtered.unshift(record);
    localStorage.setItem(KEYS.searchHistory, JSON.stringify(filtered.slice(0, MAX_SEARCH_HISTORY)));
}

export function clearSearchHistory(): void {
    localStorage.removeItem(KEYS.searchHistory);
}

/*== 默认搜索引擎（仅 localStorage） ==*/

export function getSearchEngine(): string {
    if (typeof window === 'undefined') return 'google';
    return localStorage.getItem(KEYS.searchEngine) || 'google';
}

export function setSearchEngine(key: string): void {
    localStorage.setItem(KEYS.searchEngine, key);
}

/*== 备忘录 ==*/

export interface TodoItem {
    id: string;
    text: string;
    done: boolean;
    priority: 'urgent' | 'important' | 'normal';
    date: string | null;
    createdAt: number;
}

export async function getTodos(isLoggedIn?: boolean): Promise<TodoItem[]> {
    if (isLoggedIn) {
        try {
            const res = await fetch('/api/nav/data');
            if (res.ok) {
                const json = await res.json();
                const todos: TodoItem[] | null = json.data?.todos;
                if (todos !== null && todos !== undefined) {
                    localStorage.setItem(KEYS.todos, JSON.stringify(todos));
                    return todos;
                }
            }
        } catch { /* fall through to localStorage */ }
    }
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.todos);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function saveTodos(todos: TodoItem[], isLoggedIn?: boolean): Promise<void> {
    if (isLoggedIn) {
        try {
            await fetch('/api/nav/todos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: todos }),
            });
        } catch { /* fall through to localStorage */ }
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.todos, JSON.stringify(todos));
    }
}

/*== 笔记 ==*/

export interface NoteItem {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
}

export async function getNotes(isLoggedIn?: boolean): Promise<NoteItem[]> {
    if (isLoggedIn) {
        try {
            const res = await fetch('/api/nav/data');
            if (res.ok) {
                const json = await res.json();
                const notes: NoteItem[] | null = json.data?.notes;
                if (notes !== null && notes !== undefined) {
                    localStorage.setItem(KEYS.notes, JSON.stringify(notes));
                    return notes;
                }
            }
        } catch { /* fall through */ }
    }
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.notes);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function saveNotes(notes: NoteItem[], isLoggedIn?: boolean): Promise<void> {
    if (isLoggedIn) {
        try {
            await fetch('/api/nav/notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: notes }),
            });
        } catch { /* fall through */ }
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.notes, JSON.stringify(notes));
    }
}

/*== 书签 ==*/

export async function getBookmarks(isLoggedIn?: boolean): Promise<Bookmark[]> {
    if (isLoggedIn) {
        try {
            const res = await fetch('/api/nav/data');
            if (res.ok) {
                const json = await res.json();
                const bookmarks: Bookmark[] | null = json.data?.bookmarks;
                if (bookmarks !== null && bookmarks !== undefined) {
                    localStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks));
                    return bookmarks;
                }
            }
        } catch { /* fall through */ }
    }
    if (typeof window === 'undefined') return [];
    try {
        const savedVersion = localStorage.getItem(KEYS.bookmarksVersion);
        if (savedVersion !== String(BOOKMARKS_VERSION)) {
            localStorage.setItem(KEYS.bookmarks, JSON.stringify(BOOKMARKS));
            localStorage.setItem(KEYS.bookmarksVersion, String(BOOKMARKS_VERSION));
            return BOOKMARKS;
        }
        const raw = localStorage.getItem(KEYS.bookmarks);
        if (raw) return JSON.parse(raw);
        localStorage.setItem(KEYS.bookmarks, JSON.stringify(BOOKMARKS));
        localStorage.setItem(KEYS.bookmarksVersion, String(BOOKMARKS_VERSION));
        return BOOKMARKS;
    } catch {
        return BOOKMARKS;
    }
}

export async function saveBookmarks(bookmarks: Bookmark[], isLoggedIn?: boolean): Promise<void> {
    if (isLoggedIn) {
        try {
            await fetch('/api/nav/bookmarks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: bookmarks }),
            });
        } catch { /* fall through */ }
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks));
    }
}

/*== 首次登录同步 ==*/

export async function syncLocalToServer(): Promise<void> {
    const bookmarks = JSON.parse(localStorage.getItem(KEYS.bookmarks) || 'null');
    const todos = JSON.parse(localStorage.getItem(KEYS.todos) || 'null');
    const notes = JSON.parse(localStorage.getItem(KEYS.notes) || 'null');

    if (!bookmarks && !todos && !notes) return;

    await fetch('/api/nav/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarks, todos, notes }),
    });
}

/*== 退出登录：清除本地用户数据，回到默认值 ==*/

export function clearLocalNavData(): void {
    localStorage.removeItem(KEYS.bookmarks);
    localStorage.removeItem(KEYS.bookmarksVersion);
    localStorage.removeItem(KEYS.todos);
    localStorage.removeItem(KEYS.notes);
}
