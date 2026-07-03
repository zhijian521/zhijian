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
        timer = setTimeout(() => {
            timer = null;
            fn(...args);
        }, ms);
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
    dirtyTodos: 'zhijian_nav_dirty_todos',
    dirtyNotes: 'zhijian_nav_dirty_notes',
    dirtyBookmarks: 'zhijian_nav_dirty_bookmarks',
    chat: 'zhijian_nav_chat',
    dirtyChat: 'zhijian_nav_dirty_chat',
    aiModel: 'zhijian_nav_ai_model',
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
    const filtered = history.filter((h) => h.query !== record.query);
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

/*== AI 模型偏好（仅 localStorage，不上云） ==*/

export function getAiModel(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(KEYS.aiModel) || '';
}

export function setAiModel(model: string): void {
    if (typeof window === 'undefined') return;
    if (model) localStorage.setItem(KEYS.aiModel, model);
    else localStorage.removeItem(KEYS.aiModel);
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
                    if (data.bookmarks) {
                        localStorage.setItem(KEYS.bookmarks, JSON.stringify(data.bookmarks));
                        setDirty('bookmarks', false);
                    }
                    if (data.todos) {
                        localStorage.setItem(KEYS.todos, JSON.stringify(data.todos));
                        setDirty('todos', false);
                    }
                    if (data.notes) {
                        localStorage.setItem(KEYS.notes, JSON.stringify(data.notes));
                        setDirty('notes', false);
                    }
                }
            }
        } catch {
            /* fall through */
        } finally {
            fetchPromise = null;
        }
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
    important: boolean; /* 重要维度 */
    urgent: boolean; /* 紧急维度 */
    date: string | null;
    createdAt: number;
}

/*-- 归一化：兼容旧数据（有 priority 无 important/urgent），旧项默认落 Q4 --*/
function normalizeTodo(raw: any): TodoItem {
    return {
        id: String(raw?.id ?? ''),
        text: String(raw?.text ?? ''),
        done: Boolean(raw?.done),
        important: Boolean(raw?.important),
        urgent: Boolean(raw?.urgent),
        date: raw?.date ?? null,
        createdAt: Number(raw?.createdAt) || 0,
    };
}

function normalizeTodos(list: any): TodoItem[] {
    return Array.isArray(list) ? list.map(normalizeTodo) : [];
}

export async function getTodos(isLoggedIn?: boolean): Promise<TodoItem[]> {
    if (isLoggedIn) {
        await fetchNavData();
        if (navDataCache?.todos) return normalizeTodos(navDataCache.todos);
    }
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.todos);
        return raw ? normalizeTodos(JSON.parse(raw)) : [];
    } catch {
        return [];
    }
}

/*-- API 写入 debounce 300ms，localStorage 立即写入 --*/
const DEBOUNCE_MS = 300;

/*-- 同步状态追踪：settings 页面读取 --*/
type SaveStatus = 'ok' | 'error' | 'pending';
type SaveResourceKey = 'bookmarks' | 'todos' | 'notes' | 'chat';
const saveStatus: Record<SaveResourceKey, SaveStatus> = {
    bookmarks: 'ok',
    todos: 'ok',
    notes: 'ok',
    chat: 'ok',
};
const saveStatusListeners = new Set<() => void>();
const DIRTY_KEYS: Record<SaveResourceKey, string> = {
    bookmarks: KEYS.dirtyBookmarks,
    todos: KEYS.dirtyTodos,
    notes: KEYS.dirtyNotes,
    chat: KEYS.dirtyChat,
};
const SAVE_RESOURCE_KEYS: SaveResourceKey[] = ['bookmarks', 'todos', 'notes', 'chat'];

export function getSaveStatus() {
    const snapshot = { ...saveStatus };

    SAVE_RESOURCE_KEYS.forEach((key) => {
        if (snapshot[key] === 'ok' && isDirty(key)) {
            snapshot[key] = 'error';
        }
    });

    return snapshot;
}
export function onSaveStatusChange(fn: () => void) {
    saveStatusListeners.add(fn);
    return () => {
        saveStatusListeners.delete(fn);
    };
}
function emitSaveStatus() {
    saveStatusListeners.forEach((fn) => fn());
}
function setSaveStatus(key: SaveResourceKey, status: SaveStatus) {
    if (saveStatus[key] !== status) {
        saveStatus[key] = status;
        emitSaveStatus();
    }
}
function setDirty(key: SaveResourceKey, dirty: boolean) {
    if (typeof window === 'undefined') return;
    if (dirty) localStorage.setItem(DIRTY_KEYS[key], '1');
    else localStorage.removeItem(DIRTY_KEYS[key]);
}
function isDirty(key: SaveResourceKey): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DIRTY_KEYS[key]) === '1';
}
function hasDirtyData(): boolean {
    return SAVE_RESOURCE_KEYS.some(isDirty);
}

function markPending(key: keyof typeof saveStatus) {
    setSaveStatus(key, 'pending');
}
function markOk(key: keyof typeof saveStatus) {
    setDirty(key, false);
    setSaveStatus(key, 'ok');
}
function markError(key: keyof typeof saveStatus) {
    setDirty(key, true);
    setSaveStatus(key, 'error');
}

const debouncedSaveTodos = debounce((todos: TodoItem[]) => {
    markPending('todos');
    fetch('/api/nav/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: todos }),
    })
        .then((res) => {
            if (res.ok) markOk('todos');
            else {
                markError('todos');
                console.warn('[nav] saveTodos API failed:', res.status);
            }
        })
        .catch((e) => {
            markError('todos');
            console.warn('[nav] saveTodos network error:', e);
        });
}, DEBOUNCE_MS);

export async function saveTodos(todos: TodoItem[], isLoggedIn?: boolean): Promise<void> {
    setDirty('todos', true);
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

/*== AI 对话 ==*/

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: number;
}

export interface ChatConversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

function normalizeChatMessage(raw: any): ChatMessage {
    return {
        id: String(raw?.id ?? ''),
        role: raw?.role === 'assistant' ? 'assistant' : 'user',
        content: String(raw?.content ?? ''),
        createdAt: Number(raw?.createdAt) || 0,
    };
}

function normalizeChat(list: any): ChatConversation[] {
    if (!Array.isArray(list)) return [];
    return list.map((c: any) => ({
        id: String(c?.id ?? ''),
        title: String(c?.title ?? ''),
        messages: Array.isArray(c?.messages) ? c.messages.map(normalizeChatMessage) : [],
        createdAt: Number(c?.createdAt) || 0,
        updatedAt: Number(c?.updatedAt) || 0,
    }));
}

export async function getChatConversations(isLoggedIn?: boolean): Promise<ChatConversation[]> {
    if (isLoggedIn) {
        try {
            const res = await fetch('/api/nav/chat');
            if (res.ok) {
                const json = await res.json();
                const data = json.data;
                if (data) {
                    setDirty('chat', false);
                    return normalizeChat(data);
                }
            }
        } catch {
            /* fall through to localStorage */
        }
    }
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.chat);
        return raw ? normalizeChat(JSON.parse(raw)) : [];
    } catch {
        return [];
    }
}

const debouncedSaveChat = debounce((conversations: ChatConversation[]) => {
    markPending('chat');
    fetch('/api/nav/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: conversations }),
    })
        .then((res) => {
            if (res.ok) markOk('chat');
            else {
                markError('chat');
                console.warn('[nav] saveChat API failed:', res.status);
            }
        })
        .catch((e) => {
            markError('chat');
            console.warn('[nav] saveChat network error:', e);
        });
}, DEBOUNCE_MS);

export async function saveChatConversations(conversations: ChatConversation[], isLoggedIn?: boolean): Promise<void> {
    setDirty('chat', true);
    if (isLoggedIn) debouncedSaveChat(conversations);
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.chat, JSON.stringify(conversations));
    }
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
    })
        .then((res) => {
            if (res.ok) markOk('notes');
            else {
                markError('notes');
                console.warn('[nav] saveNotes API failed:', res.status);
            }
        })
        .catch((e) => {
            markError('notes');
            console.warn('[nav] saveNotes network error:', e);
        });
}, DEBOUNCE_MS);

export async function saveNotes(notes: NoteItem[], isLoggedIn?: boolean): Promise<void> {
    setDirty('notes', true);
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
    })
        .then((res) => {
            if (res.ok) markOk('bookmarks');
            else {
                markError('bookmarks');
                console.warn('[nav] saveBookmarks API failed:', res.status);
            }
        })
        .catch((e) => {
            markError('bookmarks');
            console.warn('[nav] saveBookmarks network error:', e);
        });
}, DEBOUNCE_MS);

export async function saveBookmarks(bookmarks: Bookmark[], isLoggedIn?: boolean): Promise<void> {
    setDirty('bookmarks', true);
    if (isLoggedIn) debouncedSaveBookmarks(bookmarks);
    if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.bookmarks, JSON.stringify(bookmarks));
    }
}

/*== 首次登录同步 ==*/

export async function syncLocalToServer(): Promise<void> {
    function safeParse(key: string): unknown {
        try {
            return JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
            return null;
        }
    }
    if (!hasDirtyData()) return;

    const payload = {
        bookmarks: isDirty('bookmarks') ? safeParse(KEYS.bookmarks) : undefined,
        todos: isDirty('todos') ? safeParse(KEYS.todos) : undefined,
        notes: isDirty('notes') ? safeParse(KEYS.notes) : undefined,
        chat: isDirty('chat') ? safeParse(KEYS.chat) : undefined,
    };
    const dirtyKeys = SAVE_RESOURCE_KEYS.filter(isDirty);

    dirtyKeys.forEach(markPending);

    try {
        const res = await fetch('/api/nav/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            dirtyKeys.forEach(markError);
            throw new Error(`sync failed: ${res.status}`);
        }

        dirtyKeys.forEach(markOk);
    } catch (error) {
        dirtyKeys.forEach(markError);
        throw error;
    }
}

/*== 退出登录：清除本地用户数据，回到默认值 ==*/

export function clearLocalNavData(): void {
    localStorage.removeItem(KEYS.bookmarks);
    localStorage.removeItem(KEYS.bookmarksVersion);
    localStorage.removeItem(KEYS.todos);
    localStorage.removeItem(KEYS.notes);
    localStorage.removeItem(KEYS.dirtyBookmarks);
    localStorage.removeItem(KEYS.dirtyTodos);
    localStorage.removeItem(KEYS.dirtyNotes);
    localStorage.removeItem(KEYS.chat);
    localStorage.removeItem(KEYS.dirtyChat);
}
