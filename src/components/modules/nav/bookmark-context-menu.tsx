'use client';

import { useRef } from 'react';

import { useClickOutside } from '@/hooks/use-click-outside';

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

    /*-- ESC + 点击外部关闭；mousedown 延迟 150ms 绑定，等右键的 mouseup 完全结束 --*/
    useClickOutside(menuRef, onClose, { delayMs: 150 });

    /*-- 边界修正：菜单超出视口时调整位置 --*/
    const menuX = Math.min(x, window.innerWidth - 160);
    const menuY = Math.min(y, window.innerHeight - actions.length * 36 - 16);

    return (
        <div ref={menuRef} className={styles.menu} style={{ left: menuX, top: menuY }}>
            {actions.map((action) => (
                <button
                    key={action.label}
                    className={`${styles.menuItem} ${action.danger ? styles.menuItemDanger : ''}`}
                    onClick={() => {
                        action.onClick();
                        onClose();
                    }}
                    type="button"
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}
