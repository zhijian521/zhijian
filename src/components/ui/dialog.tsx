'use client';

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
    if (!open) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.backdrop} onClick={onClose} />
            <div className={styles.panel} style={maxWidth ? { maxWidth } : undefined}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <IconButton icon={<XIcon />} onClick={onClose} size="small" variant="muted" />
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>
    );
}