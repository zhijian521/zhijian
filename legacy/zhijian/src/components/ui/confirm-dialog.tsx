/*============================================================================
  confirm-dialog — 二次确认弹窗

  基于 Dialog 组件，图标（AlertTriangleIcon）+ 消息 + 双按钮（取消/确认），
  确认按钮带 loading 态，用于删除等不可逆操作。
============================================================================*/

'use client';

/*== 组件导入 ==*/
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { SubmitButton } from '@/components/ui/submit-button';
import { AlertTriangleIcon } from '@/components/ui/icons';

/*== 样式导入 ==*/
import styles from './confirm-dialog.module.css';

/*== 类型定义 ==*/
interface ConfirmDialogProps {
    /*-- 是否打开弹窗 --*/
    open: boolean;
    /*-- 弹窗标题 --*/
    title: string;
    /*-- 提示消息 --*/
    message: string;
    /*-- 确认按钮文字，默认"确认" --*/
    confirmLabel?: string;
    /*-- 取消按钮文字，默认"取消" --*/
    cancelLabel?: string;
    /*-- 确认回调 --*/
    onConfirm: () => void;
    /*-- 取消/关闭回调 --*/
    onCancel: () => void;
    /*-- 确认按钮 loading 态 --*/
    loading?: boolean;
}

/*== ConfirmDialog 二次确认弹窗 — 图标+消息+双按钮 ==*/
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
                <GhostButton asButton onClick={onCancel} size="small">
                    {cancelLabel}
                </GhostButton>
                <SubmitButton disabled={loading} onClick={onConfirm} size="small">
                    {loading ? '处理中...' : confirmLabel}
                </SubmitButton>
            </div>
        </Dialog>
    );
}
