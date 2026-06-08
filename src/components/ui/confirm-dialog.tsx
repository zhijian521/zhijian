'use client';

import { AlertTriangleIcon } from '@/components/ui/icons';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { SubmitButton } from '@/components/ui/submit-button';

import styles from './confirm-dialog.module.css';

/*============================================================================
  ConfirmDialog — 二次确认弹窗，基于 Dialog 组件。
  按钮沿用自建 GhostButton + SubmitButton 组件。
============================================================================*/

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

/*== 确认弹窗：遮罩 + 居中面板，直角边框匹配后台表格风格。 ==*/
export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = '确认',
    cancelLabel = '取消',
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog onClose={onCancel} open={open} title={title}>
            <div className={styles.content}>
                <div className={styles.iconWrap}>
                    <AlertTriangleIcon className={styles.icon} />
                </div>
                <p className={styles.message}>{message}</p>
            </div>

            <div className={styles.actions}>
                <GhostButton asButton onClick={onCancel} size="small">{cancelLabel}</GhostButton>
                <SubmitButton disabled={loading} onClick={onConfirm} size="small">{loading ? '处理中...' : confirmLabel}</SubmitButton>
            </div>
        </Dialog>
    );
}