'use client';

import { useEffect, useRef } from 'react';

import styles from './bookmark-context-menu.module.css';

export interface ContextMenuAction {
    label: string;
    onClick: () => void;
    danger?: boolean;
}

interface BookmarkContextMenuProps {
    x: number;
    y: number;
    actions: ContextMenuAction[];
    onClose: () => void;
}

export default function BookmarkContextMenu({ x, y, actions, onClose }: BookmarkContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    /*-- ESC + 点击外部关闭 --*/
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKey);
        /*-- 延迟绑定 mousedown，等右键的 mouseup 完全结束 --*/
        const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 150);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [onClose]);

    /*-- 边界修正：菜单超出视口时调整位置 --*/
    const menuX = Math.min(x, window.innerWidth - 160);
    const menuY = Math.min(y, window.innerHeight - actions.length * 36 - 16);

    return (
        <div
            ref={menuRef}
            className={styles.menu}
            style={{ left: menuX, top: menuY }}
        >
            {actions.map((action) => (
                <button
                    key={action.label}
                    className={`${styles.menuItem} ${action.danger ? styles.menuItemDanger : ''}`}
                    onClick={() => { action.onClick(); onClose(); }}
                    type="button"
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}
