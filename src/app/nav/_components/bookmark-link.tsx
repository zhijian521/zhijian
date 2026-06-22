'use client';

import { useState, useRef, useEffect } from 'react';

import { ChevronRightIcon } from '@/components/ui/icons';
import { isBookmarkFolder } from '@/lib/nav-config';
import type { Bookmark } from '@/lib/nav-config';

import FaviconImg from './favicon-img';
import styles from './bookmark-link.module.css';

/*== 拖拽状态 ==*/
export interface DragState {
    dragId: string;
    overId: string | null;
    position: 'before' | 'after' | null;
    folderId?: string;
}

/*-- 单个书签/文件夹 --*/
export default function BookmarkLink({
    bookmark,
    onContextMenu,
    dragState,
    folderId,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: {
    bookmark: Bookmark;
    onContextMenu: (e: React.MouseEvent, bookmark: Bookmark, folderId?: string) => void;
    dragState: DragState | null;
    folderId?: string;
    onDragStart: (e: React.DragEvent, id: string, folderId?: string) => void;
    onDragOver: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent, id: string, folderId?: string) => void;
    onDragEnd: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
    const folderRef = useRef<HTMLDivElement>(null);

    /*-- 点击外部关闭文件夹弹出层 --*/
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (folderRef.current && !folderRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
        return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick); };
    }, [open]);

    function toggleOpen() {
        const next = !open;
        setOpen(next);
        if (next && folderRef.current) {
            const rect = folderRef.current.getBoundingClientRect();
            setPopupPos({ top: rect.bottom + 4, left: rect.left });
        } else {
            setPopupPos(null);
        }
    }

    const isDragOver = dragState?.overId === bookmark.id && dragState?.position;
    const dragCls = isDragOver === 'before' ? styles.dragOverBefore : isDragOver === 'after' ? styles.dragOverAfter : '';

    if (isBookmarkFolder(bookmark)) {
        return (
            <div
                ref={folderRef}
                className={`${styles.folder} ${dragCls}`}
                draggable
                onContextMenu={(e) => onContextMenu(e, bookmark)}
                onDragStart={(e) => onDragStart(e, bookmark.id)}
                onDragOver={(e) => onDragOver(e, bookmark.id)}
                onDrop={(e) => onDrop(e, bookmark.id)}
                onDragEnd={onDragEnd}
            >
                <button
                    className={styles.item}
                    onClick={toggleOpen}
                    type="button"
                >
                    <ChevronRightIcon style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0 }} />
                    <span className={styles.name}>{bookmark.name}</span>
                </button>
                {open && popupPos && (
                    <div
                        className={styles.folderPopup}
                        style={{ position: 'fixed', top: popupPos.top, left: popupPos.left }}
                    >
                        {bookmark.children.map((child) => (
                            <a
                                key={child.id}
                                className={styles.folderItem}
                                href={child.url}
                                rel="noopener noreferrer"
                                target="_blank"
                                onContextMenu={(e) => onContextMenu(e, child, bookmark.id)}
                            >
                                <FaviconImg className={styles.favicon} fallbackChar={child.name[0]} url={child.url} />
                                <span className={styles.name}>{child.name}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <a
            className={`${styles.item} ${dragCls}`}
            href={bookmark.url}
            rel="noopener noreferrer"
            target="_blank"
            draggable
            onContextMenu={(e) => onContextMenu(e, bookmark, folderId)}
            onDragStart={(e) => onDragStart(e, bookmark.id, folderId)}
            onDragOver={(e) => onDragOver(e, bookmark.id)}
            onDrop={(e) => onDrop(e, bookmark.id, folderId)}
            onDragEnd={onDragEnd}
        >
            <FaviconImg className={styles.favicon} fallbackChar={bookmark.name[0]} url={bookmark.url} />
            <span className={styles.name}>{bookmark.name}</span>
        </a>
    );
}
