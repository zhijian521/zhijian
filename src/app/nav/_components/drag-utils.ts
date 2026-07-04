import { isBookmarkFolder } from '@/lib/domain/nav-config';
import type { Bookmark, BookmarkItem } from '@/lib/domain/nav-config';

/*-- 拖拽状态 --*/
export interface DragState {
    dragId: string;
    overId: string | null;
    position: 'before' | 'after' | 'inside' | null;
    folderId?: string; /* 拖拽源所属文件夹 id；undefined = 一级 */
}

/*-- 同层重排序 --*/
export function reorder<T extends { id: string }>(list: T[], dragId: string, targetId: string, position: 'before' | 'after'): T[] {
    const fromIdx = list.findIndex((b) => b.id === dragId);
    const toIdx = list.findIndex((b) => b.id === targetId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return list;
    const updated = [...list];
    const [moved] = updated.splice(fromIdx, 1);
    const adjustedTo = toIdx > fromIdx ? toIdx - 1 : toIdx;
    const insertIdx = position === 'before' ? adjustedTo : adjustedTo + 1;
    updated.splice(insertIdx, 0, moved);
    return updated;
}

/*-- 在指定项旁插入新项（before=插到 targetId 前，after=插到后） --*/
export function insertAt<T extends { id: string }>(list: T[], item: T, targetId: string, position: 'before' | 'after'): T[] {
    const idx = list.findIndex((b) => b.id === targetId);
    if (idx === -1) return [...list, item];
    const updated = [...list];
    updated.splice(position === 'before' ? idx : idx + 1, 0, item);
    return updated;
}

/*-- 在指定项后面插入新项（CRUD 用，afterId 省略=追加末尾） --*/
export function insertAfter<T extends { id: string }>(list: T[], item: T, afterId?: string): T[] {
    if (!afterId) return [...list, item];
    return insertAt(list, item, afterId, 'after');
}

/*-- 从 bookmarks 树中移除指定 id 的项（一级或任意文件夹 children），返回新树和被移除项 --*/
export function removeFromTree(bookmarks: Bookmark[], id: string): { tree: Bookmark[]; removed: Bookmark | null } {
    /*-- 一级命中 --*/
    const rootIdx = bookmarks.findIndex((b) => b.id === id);
    if (rootIdx !== -1) {
        const tree = [...bookmarks];
        const [removed] = tree.splice(rootIdx, 1);
        return { tree, removed };
    }
    /*-- 文件夹 children 命中 --*/
    for (const b of bookmarks) {
        if (!isBookmarkFolder(b)) continue;
        const childIdx = b.children.findIndex((c) => c.id === id);
        if (childIdx !== -1) {
            const children = [...b.children];
            const [removed] = children.splice(childIdx, 1);
            const tree = bookmarks.map((x) => (x.id === b.id ? { ...x, children } : x));
            return { tree, removed };
        }
    }
    return { tree: bookmarks, removed: null };
}

/*-- 把 item 插入树的目标层 --*/
/*-- inside：targetId 是文件夹，item 追加进其 children 末尾 --*/
/*-- before/after：targetId 是同层某项，插到其旁；targetFolderId 省略=一级，否则=所在文件夹 --*/
export function insertIntoTree(tree: Bookmark[], item: Bookmark, targetId: string, position: 'before' | 'after' | 'inside', targetFolderId?: string): Bookmark[] {
    /*-- 放进文件夹（targetId 即文件夹 id） --*/
    if (position === 'inside') {
        return tree.map((b) => (isBookmarkFolder(b) && b.id === targetId ? { ...b, children: [...b.children, item as BookmarkItem] } : b));
    }
    /*-- 一级排序 --*/
    if (!targetFolderId) {
        return insertAt(tree, item, targetId, position);
    }
    /*-- 文件夹内排序 --*/
    return tree.map((b) => {
        if (!isBookmarkFolder(b) || b.id !== targetFolderId) return b;
        return { ...b, children: insertAt(b.children, item as BookmarkItem, targetId, position) };
    });
}
