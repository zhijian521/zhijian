'use client';

import { useEffect, useRef } from 'react';
import { XIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/icon-button';

import styles from './dialog.module.css';

/*== Dialog 通用弹窗 — 遮罩 + 居中面板，直角边框匹配后台风格 ==*/
interface DialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    /** 面板最大宽度，默认 28rem */
    maxWidth?: string;
}

export default function Dialog({ open, title, onClose, children, maxWidth }: DialogProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    /* Escape 键关闭 */
    useEffect(() => {
        if (!open) return;
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.backdrop} onClick={onClose} />
            <div
                className={styles.panel}
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                style={maxWidth ? { maxWidth } : undefined}
            >
                <div className={styles.header}>
                    <h3 className={styles.title} id="dialog-title">{title}</h3>
                    <IconButton icon={<XIcon />} onClick={onClose} size="small" variant="muted" aria-label="关闭" />
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>
    );
}
