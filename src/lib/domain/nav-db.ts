import { getDb } from '../core/db';
import type { Bookmark } from './nav-config';
import type { TodoItem, NoteItem, ChatConversation } from './nav-storage';

/*== Nav 数据库操作 — 每用户每类型一条 JSON 记录，整存整取 ==*/

/*-- 通用：按 user_id 读取 data 列 --*/
/* ponytail: 表名由调用方硬编码传入，不来自用户输入，拼接安全 */
async function getData<T>(table: string, userId: number): Promise<T | null> {
    const db = getDb();
    if (!db) return null;
    const [rows] = await db.execute(`SELECT data FROM ${table} WHERE user_id = ?`, [userId]);
    const list = rows as any[];
    return list.length > 0 ? (list[0].data as T) : null;
}

/*-- 通用：upsert data 列 --*/
async function setData<T>(table: string, userId: number, data: T): Promise<void> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');
    await db.execute(
        `INSERT INTO ${table} (user_id, data) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE data = VALUES(data), version = version + 1`,
        [userId, JSON.stringify(data)]
    );
}

/*-- 检查用户是否有 nav 数据（用于 sync 判断） --*/
async function hasAnyData(userId: number): Promise<boolean> {
    const db = getDb();
    if (!db) return false;
    const tables = ['zhijian_nav_bookmarks', 'zhijian_nav_todos', 'zhijian_nav_notes', 'zhijian_nav_chat'];
    for (const table of tables) {
        const [rows] = await db.execute(`SELECT id FROM ${table} WHERE user_id = ? LIMIT 1`, [userId]);
        if ((rows as any[]).length > 0) return true;
    }
    return false;
}

/*== 导出 ==*/

export async function getBookmarksDb(userId: number): Promise<Bookmark[] | null> {
    return getData<Bookmark[]>('zhijian_nav_bookmarks', userId);
}

export async function saveBookmarksDb(userId: number, data: Bookmark[]): Promise<void> {
    return setData('zhijian_nav_bookmarks', userId, data);
}

export async function getTodosDb(userId: number): Promise<TodoItem[] | null> {
    return getData<TodoItem[]>('zhijian_nav_todos', userId);
}

export async function saveTodosDb(userId: number, data: TodoItem[]): Promise<void> {
    return setData('zhijian_nav_todos', userId, data);
}

export async function getNotesDb(userId: number): Promise<NoteItem[] | null> {
    return getData<NoteItem[]>('zhijian_nav_notes', userId);
}

export async function saveNotesDb(userId: number, data: NoteItem[]): Promise<void> {
    return setData('zhijian_nav_notes', userId, data);
}

export async function getAllNavData(userId: number): Promise<{
    bookmarks: Bookmark[] | null;
    todos: TodoItem[] | null;
    notes: NoteItem[] | null;
}> {
    const [bookmarks, todos, notes] = await Promise.all([
        getBookmarksDb(userId),
        getTodosDb(userId),
        getNotesDb(userId),
    ]);
    return { bookmarks, todos, notes };
}

export async function hasNavData(userId: number): Promise<boolean> {
    return hasAnyData(userId);
}

/*== AI 对话（每用户一条会话数组 JSON，整存整取） ==*/

export async function getChatDb(userId: number): Promise<ChatConversation[] | null> {
    return getData<ChatConversation[]>('zhijian_nav_chat', userId);
}

export async function saveChatDb(userId: number, data: ChatConversation[]): Promise<void> {
    return setData('zhijian_nav_chat', userId, data);
}
