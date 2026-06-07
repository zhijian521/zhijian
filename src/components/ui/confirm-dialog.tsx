'use client';

import { AlertTriangleIcon, XIcon } from '@/components/ui/icons';
import styles from './confirm-dialog.module.css';

/*============================================================================
  ConfirmDialog — 二次确认弹窗，匹配项目直角边框 + CSS 变量主题。
  按钮沿用后台表单风格：主操作填充主色，取消纯文字。
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
    if (!open) return null;

    return (
        <div className={styles.overlay}>
            {/*-- 遮罩层 --*/}
            <div
                className={styles.backdrop}
                onClick={loading ? undefined : onCancel}
            />

            {/*-- 弹窗面板 --*/}
            <div className={styles.panel}>
                <div className={styles.content}>
                    {/*-- 图标 --*/}
                    <div className={styles.iconWrap}>
                        <AlertTriangleIcon className={styles.icon} />
                    </div>

                    {/*-- 标题与正文 --*/}
                    <div className={styles.textBody}>
                        <h3 className={styles.dialogTitle}>{title}</h3>
                        <p className={styles.dialogMessage}>{message}</p>
                    </div>

                    {/*-- 关闭按钮 --*/}
                    <button
                        className={styles.closeBtn}
                        disabled={loading}
                        onClick={onCancel}
                        type="button"
                    >
                        <XIcon className={styles.closeIcon} />
                    </button>
                </div>

                {/*-- 操作按钮：匹配后台表单风格 — 主操作填充主色，取消纯文字。 --*/}
                <div className={styles.actions}>
                    <button
                        className={styles.cancelBtn}
                        disabled={loading}
                        onClick={onCancel}
                        type="button"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={styles.confirmBtn}
                        disabled={loading}
                        onClick={onConfirm}
                        type="button"
                    >
                        {loading ? '处理中...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
