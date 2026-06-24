'use client';

import { useState, useRef, useEffect } from 'react';

import { isBookmarkFolder } from '@/lib/nav-config';
import type { Bookmark } from '@/lib/nav-config';
import type { DragState } from './drag-utils';

import FaviconImg from './favicon-img';
import styles from './bookmark-link.module.css';

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
                    onClick={() => setOpen(v => !v)}
                    type="button"
                >
                    <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 6.5C2 5.67 2.67 5 3.5 5H9.29a1 1 0 0 1 .7.29L12 7.3h7.5c.83 0 1.5.67 1.5 1.5v9.7c0 .83-.67 1.5-1.5 1.5h-16c-.83 0-1.5-.67-1.5-1.5V6.5Z" fill="#FFB300" />
                        <path d="M2 8.5h19v10c0 .83-.67 1.5-1.5 1.5h-16c-.83 0-1.5-.67-1.5-1.5v-10Z" fill="#FFCA28" />
                    </svg>
                    <span className={styles.name}>{bookmark.name}</span>
                </button>
                {open && (
                    <div className={styles.folderPopup}>
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
