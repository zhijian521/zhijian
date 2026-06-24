'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

import Dialog from '@/components/ui/dialog';
import { isBookmarkFolder } from '@/lib/nav-config';
import type { Bookmark, BookmarkItem, BookmarkFolder } from '@/lib/nav-config';
import { getBookmarks, saveBookmarks, genId } from '@/lib/nav-storage';
import { reorder, insertAfter, type DragState } from './drag-utils';

import BookmarkContextMenu from './bookmark-context-menu';
import BookmarkLink from './bookmark-link';
import type { ContextMenuAction } from './bookmark-context-menu';

import styles from './bookmark-bar.module.css';

/*== 右键菜单状态 ==*/
interface MenuState {
    x: number;
    y: number;
    actions: ContextMenuAction[];
}

/*== 编辑弹窗状态 ==*/
type EditMode =
    | { type: 'addBookmark'; afterId?: string; folderId?: string }
    | { type: 'addFolder'; afterId?: string }
    | { type: 'editBookmark'; id: string; name: string; url: string; folderId?: string }
    | { type: 'editFolder'; id: string; name: string }
    | { type: 'delete'; id: string; name: string; folderId?: string }
    | null;

interface BookmarkBarProps {
    isLoggedIn?: boolean;
    dataVersion?: number;
}

export default function BookmarkBar({ isLoggedIn, dataVersion }: BookmarkBarProps) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [menu, setMenu] = useState<MenuState | null>(null);
    const [editMode, setEditMode] = useState<EditMode>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);

    /*-- 表单状态 --*/
    const [formName, setFormName] = useState('');
    const [formUrl, setFormUrl] = useState('');

    /*-- 用 ref 持有最新值，避免闭包陷阱 --*/
    const bookmarksRef = useRef(bookmarks);
    bookmarksRef.current = bookmarks;
    const dragStateRef = useRef(dragState);
    dragStateRef.current = dragState;

    useEffect(() => {
        getBookmarks(isLoggedIn).then(setBookmarks);
    }, [isLoggedIn, dataVersion]);

    function persist(updated: Bookmark[]) {
        setBookmarks(updated);
        saveBookmarks(updated, isLoggedIn);
    }

    /*== 右键菜单 ==*/
    const handleContextMenu = useCallback((e: React.MouseEvent, bookmark: Bookmark, parentFolderId?: string) => {
        e.preventDefault();
        e.stopPropagation();
        const actions: ContextMenuAction[] = [];

        if (isBookmarkFolder(bookmark)) {
            actions.push(
                { label: '修改', onClick: () => setEditMode({ type: 'editFolder', id: bookmark.id, name: bookmark.name }) },
                { label: '删除', onClick: () => setEditMode({ type: 'delete', id: bookmark.id, name: bookmark.name }), danger: true },
                { label: '新增书签', onClick: () => setEditMode({ type: 'addBookmark', afterId: bookmark.id }) },
                { label: '新增文件夹', onClick: () => setEditMode({ type: 'addFolder', afterId: bookmark.id }) },
                { label: '新增下级书签', onClick: () => setEditMode({ type: 'addBookmark', folderId: bookmark.id }) },
            );
        } else {
            const bm = bookmark as BookmarkItem;
            actions.push(
                { label: '修改', onClick: () => setEditMode({ type: 'editBookmark', id: bm.id, name: bm.name, url: bm.url, folderId: parentFolderId }) },
                { label: '删除', onClick: () => setEditMode({ type: 'delete', id: bm.id, name: bm.name, folderId: parentFolderId }), danger: true },
                { label: '新增书签', onClick: () => setEditMode({ type: 'addBookmark', afterId: bm.id, folderId: parentFolderId }) },
                { label: '新增文件夹', onClick: () => setEditMode({ type: 'addFolder', afterId: bm.id }) },
            );
        }

        setMenu({ x: e.clientX, y: e.clientY, actions });
    }, []);

    /*-- 书签栏空白区域右键 --*/
    const handleBarContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setMenu({
            x: e.clientX,
            y: e.clientY,
            actions: [
                { label: '新增书签', onClick: () => setEditMode({ type: 'addBookmark' }) },
                { label: '新增文件夹', onClick: () => setEditMode({ type: 'addFolder' }) },
            ],
        });
    }, []);

    /*== 拖拽 — 用 ref 读取最新值，回调稳定不重建 ==*/
    const handleDragStart = useCallback((e: React.DragEvent, id: string, folderId?: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        setDragState({ dragId: id, overId: null, position: null, folderId });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const position = e.clientX < midX ? 'before' : 'after';
        setDragState(prev => prev ? { ...prev, overId: id, position } : prev);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, id: string, folderId?: string) => {
        e.preventDefault();
        const ds = dragStateRef.current;
        if (!ds || ds.dragId === id || !ds.position) return;

        /*-- 同层拖拽：folderId 必须一致 --*/
        if (ds.folderId !== folderId) return;

        const bm = bookmarksRef.current;
        if (folderId) {
            persist(bm.map(b => {
                if (!isBookmarkFolder(b) || b.id !== folderId) return b;
                return { ...b, children: reorder(b.children, ds.dragId, id, ds.position!) };
            }));
        } else {
            persist(reorder(bm, ds.dragId, id, ds.position!));
        }

        setDragState(null);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDragState(null);
    }, []);

    /*== CRUD 操作 ==*/
    function handleSave() {
        if (!editMode) return;

        if (editMode.type === 'addBookmark') {
            const newItem: BookmarkItem = { id: `bm-${genId()}`, name: formName.trim() || '未命名', url: formUrl.trim() || 'https://' };
            if (editMode.folderId) {
                persist(bookmarks.map(b =>
                    b.id === editMode.folderId && isBookmarkFolder(b)
                        ? { ...b, children: insertAfter(b.children, newItem, editMode.afterId) }
                        : b
                ));
            } else if (editMode.afterId) {
                persist(insertAfter(bookmarks, newItem, editMode.afterId));
            } else {
                persist([...bookmarks, newItem]);
            }
        } else if (editMode.type === 'addFolder') {
            const newFolder: BookmarkFolder = { id: `bf-${genId()}`, name: formName.trim() || '新文件夹', children: [] };
            if (editMode.afterId) {
                persist(insertAfter(bookmarks, newFolder, editMode.afterId));
            } else {
                persist([...bookmarks, newFolder]);
            }
        } else if (editMode.type === 'editBookmark') {
            if (editMode.folderId) {
                persist(bookmarks.map(b =>
                    isBookmarkFolder(b) && b.id === editMode.folderId
                        ? { ...b, children: b.children.map(c =>
                            c.id === editMode.id ? { ...c, name: formName.trim() || c.name, url: formUrl.trim() || c.url } : c
                        ) }
                        : b
                ));
            } else {
                persist(bookmarks.map(b =>
                    !isBookmarkFolder(b) && b.id === editMode.id
                        ? { ...b, name: formName.trim() || b.name, url: formUrl.trim() || b.url }
                        : b
                ));
            }
        } else if (editMode.type === 'editFolder') {
            persist(bookmarks.map(b =>
                isBookmarkFolder(b) && b.id === editMode.id
                    ? { ...b, name: formName.trim() || b.name }
                    : b
            ));
        } else if (editMode.type === 'delete') {
            if (editMode.folderId) {
                persist(bookmarks.map(b =>
                    isBookmarkFolder(b) && b.id === editMode.folderId
                        ? { ...b, children: b.children.filter(c => c.id !== editMode.id) }
                        : b
                ));
            } else {
                persist(bookmarks.filter(b => b.id !== editMode.id));
            }
        }

        setEditMode(null);
    }

    /*-- 弹窗打开时初始化表单 --*/
    useEffect(() => {
        if (!editMode) return;
        if (editMode.type === 'editBookmark') {
            setFormName(editMode.name);
            setFormUrl(editMode.url);
        } else if (editMode.type === 'editFolder') {
            setFormName(editMode.name);
            setFormUrl('');
        } else {
            setFormName('');
            setFormUrl('');
        }
    }, [editMode]);

    /*-- 弹窗配置 --*/
    const config = (() => {
        if (!editMode) return { title: '', showForm: false, showUrl: false, showDelete: false };
        switch (editMode.type) {
            case 'addBookmark': return { title: editMode.folderId ? '文件夹内新增书签' : '新增书签', showForm: true, showUrl: true, showDelete: false };
            case 'addFolder': return { title: '新增文件夹', showForm: true, showUrl: false, showDelete: false };
            case 'editBookmark': return { title: '编辑书签', showForm: true, showUrl: true, showDelete: false };
            case 'editFolder': return { title: '编辑文件夹', showForm: true, showUrl: false, showDelete: false };
            case 'delete': return { title: '确认删除', showForm: false, showUrl: false, showDelete: true };
        }
    })();

    return (
        <div className={styles.wrapper} onContextMenu={handleBarContextMenu}>
            <div className={styles.bar}>
                {bookmarks.map((bookmark) => (
                    <BookmarkLink
                        key={bookmark.id}
                        bookmark={bookmark}
                        onContextMenu={handleContextMenu}
                        dragState={dragState}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>

            {/*-- 右键菜单 --*/}
            {menu && (
                <BookmarkContextMenu
                    actions={menu.actions}
                    onClose={() => setMenu(null)}
                    x={menu.x}
                    y={menu.y}
                />
            )}

            {/*-- 编辑/新增/删除弹窗 --*/}
            {editMode && (
                <Dialog
                    onClose={() => setEditMode(null)}
                    open
                    title={config.title}
                >
                    {config.showDelete && (
                        <p className={styles.deleteText}>
                            确定删除「{editMode.type === 'delete' ? editMode.name : ''}」？
                            {editMode.type === 'delete' && bookmarks.find(b => b.id === editMode.id && isBookmarkFolder(b)) && '文件夹内的书签也会一起删除。'}
                        </p>
                    )}
                    {config.showForm && (
                        <>
                            <label className={styles.fieldLabel}>
                                名称
                                <input
                                    className={styles.fieldInput}
                                    onChange={(e) => setFormName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                                    placeholder="名称"
                                    type="text"
                                    value={formName}
                                />
                            </label>
                            {config.showUrl && (
                                <label className={styles.fieldLabel}>
                                    URL
                                    <input
                                        className={styles.fieldInput}
                                        onChange={(e) => setFormUrl(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                                        placeholder="https://"
                                        type="url"
                                        value={formUrl}
                                    />
                                </label>
                            )}
                        </>
                    )}
                    <div className={styles.dialogActions}>
                        <button className={styles.cancelBtn} onClick={() => setEditMode(null)} type="button">
                            取消
                        </button>
                        <button
                            className={`${styles.confirmBtn} ${config.showDelete ? styles.confirmBtnDanger : ''}`}
                            onClick={handleSave}
                            type="button"
                        >
                            {config.showDelete ? '删除' : '保存'}
                        </button>
                    </div>
                </Dialog>
            )}
        </div>
    );
}
