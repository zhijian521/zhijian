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

/*-- debounce：快速连续操作（拖拽排序、快速打字）时合并 API 请求 --*/
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return ((...args: any[]) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { timer = null; fn(...args); }, ms);
    }) as T;
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

/*== 缓存：登录时拉一次 /api/nav/data，各 get 函数共享结果 ==*/

let navDataCache: {
    bookmarks: Bookmark[] | null;
    todos: TodoItem[] | null;
    notes: NoteItem[] | null;
} | null = null;

/*-- 401 / 网络错误时短时间去重，避免 3 个组件各拉一次 --*/
let fetchPromise: Promise<void> | null = null;

async function fetchNavData(): Promise<void> {
    if (navDataCache) return;
    /*-- 复用进行中的请求 --*/
    if (fetchPromise) return fetchPromise;
    fetchPromise = (async () => {
        try {
            const res = await fetch('/api/nav/data');
            if (res.ok) {
                const json = await res.json();
                const data = json.data ?? { bookmarks: null, todos: null, notes: null };
                /*-- 全空时不缓存，等 sync 完成后重拉 --*/
                if (data.bookmarks || data.todos || data.notes) {
                    navDataCache = data;
                    if (data.bookmarks) localStorage.setItem(KEYS.bookmarks, JSON.stringify(data.bookmarks));
                    if (data.todos) localStorage.setItem(KEYS.todos, JSON.stringify(data.todos));
                    if (data.notes) localStorage.setItem(KEYS.notes, JSON.stringify(data.notes));
                }
            }
        } catch { /* fall through */ }
        finally { fetchPromise = null; }
    })();
    return fetchPromise;
}

export function clearNavDataCache(): void {
    navDataCache = null;
}

/*-- 监听其他标签页的 localStorage 写入，自动清缓存避免读到过期数据 --*/
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key && (e.key as string).startsWith('zhijian_nav_')) {
            navDataCache = null;
        }
    });
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
        await fetchNavData();
        if (navDataCache?.todos) return navDataCache.todos;
    }
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.todos);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/*-- API 写入 debounce 300ms，localStorage 立即写入 --*/
const DEBOUNCE_MS = 300;

/*-- 同步状态追踪：settings 页面读取 --*/
type SaveStatus = 'ok' | 'error' | 'pending';
const saveStatus: Record<'bookmarks' | 'todos' | 'notes', SaveStatus> = {
    bookmarks: 'ok', todos: 'ok', notes: 'ok',
};
const saveStatusListeners = new Set<() => void>();

export function getSaveStatus() { return { ...saveStatus }; }
export function onSaveStatusChange(fn: () => void) {
    saveStatusListeners.add(fn);
    return () => { saveStatusListeners.delete(fn); };
}
function emitSaveStatus() { saveStatusListeners.forEach(fn => fn()); }

function markPending(key: keyof typeof saveStatus) {
    if (saveStatus[key] !== 'pending') { saveStatus[key] = 'pending'; emitSaveStatus(); }
}
function markOk(key: keyof typeof saveStatus) {
    if (saveStatus[key] !== 'ok') { saveStatus[key] = 'ok'; emitSaveStatus(); }
}
function markError(key: keyof typeof saveStatus) {
    if (saveStatus[key] !== 'error') { saveStatus[key] = 'error'; emitSaveStatus(); }
}

const debouncedSaveTodos = debounce((todos: TodoItem[]) => {
    markPending('todos');
    fetch('/api/nav/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: todos }),
    }).then(res => { if (res.ok) markOk('todos'); else { markError('todos'); console.warn('[nav] saveTodos API failed:', res.status); } })
      .catch(e => { markError('todos'); console.warn('[nav] saveTodos network error:', e); });
}, DEBOUNCE_MS);

export async function saveTodos(todos: TodoItem[], isLoggedIn?: boolean): Promise<void> {
    if (isLoggedIn) debouncedSaveTodos(todos);
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
        await fetchNavData();
        if (navDataCache?.notes) return navDataCache.notes;
    }
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.notes);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

const debouncedSaveNotes = debounce((notes: NoteItem[]) => {
    markPending('notes');
    fetch('/api/nav/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: notes }),
    }).then(res => { if (res.ok) markOk('notes'); else { markError('notes'); console.warn('[nav] saveNotes API failed:', res.status); } })
      .catch(e => { markError('notes'); console.warn('[nav] saveNotes network error:', e); });
}, DEBOUNCE_MS);

export async function saveNotes(notes: NoteItem[], isLoggedIn?: boolean): Promise<void> {
    if (isLoggedIn) debouncedSaveNotes(notes);
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.notes, JSON.stringify(notes));
    }
}

/*== 书签 ==*/

export async function getBookmarks(isLoggedIn?: boolean): Promise<Bookmark[]> {
    if (isLoggedIn) {
        await fetchNavData();
        if (navDataCache?.bookmarks) return navDataCache.bookmarks;
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

const debouncedSaveBookmarks = debounce((bookmarks: Bookmark[]) => {
    markPending('bookmarks');
    fetch('/api/nav/bookmarks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: bookmarks }),
    }).then(res => { if (res.ok) markOk('bookmarks'); else { markError('bookmarks'); console.warn('[nav] saveBookmarks API failed:', res.status); } })
      .catch(e => { markError('bookmarks'); console.warn('[nav] saveBookmarks network error:', e); });
}, DEBOUNCE_MS);

export async function saveBookmarks(bookmarks: Bookmark[], isLoggedIn?: boolean): Promise<void> {
    if (isLoggedIn) debouncedSaveBookmarks(bookmarks);
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks));
    }
}

/*== 首次登录同步 ==*/

export async function syncLocalToServer(): Promise<void> {
    function safeParse(key: string): unknown {
        try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
    }
    const bookmarks = safeParse(KEYS.bookmarks);
    const todos = safeParse(KEYS.todos);
    const notes = safeParse(KEYS.notes);

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
