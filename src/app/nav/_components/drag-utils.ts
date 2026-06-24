/*-- 拖拽状态 --*/
export interface DragState {
    dragId: string;
    overId: string | null;
    position: 'before' | 'after' | null;
    folderId?: string;
}

/*-- 同层重排序 --*/
export function reorder<T extends { id: string }>(list: T[], dragId: string, targetId: string, position: 'before' | 'after'): T[] {
    const fromIdx = list.findIndex(b => b.id === dragId);
    const toIdx = list.findIndex(b => b.id === targetId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return list;
    const updated = [...list];
    const [moved] = updated.splice(fromIdx, 1);
    const adjustedTo = toIdx > fromIdx ? toIdx - 1 : toIdx;
    const insertIdx = position === 'before' ? adjustedTo : adjustedTo + 1;
    updated.splice(insertIdx, 0, moved);
    return updated;
}

/*-- 在指定项后面插入新项 --*/
export function insertAfter<T extends { id: string }>(list: T[], item: T, afterId?: string): T[] {
    if (!afterId) return [...list, item];
    const idx = list.findIndex(b => b.id === afterId);
    if (idx === -1) return [...list, item];
    const updated = [...list];
    updated.splice(idx + 1, 0, item);
    return updated;
}
