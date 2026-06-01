'use client';

import { AlertTriangle, X } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/*-- 遮罩层 --*/}
            <div
                className="absolute inset-0 bg-black/20"
                onClick={loading ? undefined : onCancel}
            />

            {/*-- 弹窗面板 --*/}
            <div className="relative z-10 w-full max-w-md mx-4 border border-[var(--primary)] bg-[var(--background)] p-6">
                <div className="flex items-start gap-3">
                    {/*-- 图标 --*/}
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[rgba(158,0,39,0.08)]">
                        <AlertTriangle className="h-5 w-5 text-[var(--primary)]" />
                    </div>

                    {/*-- 标题与正文 --*/}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-[var(--foreground)]">
                            {title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--muted-foreground)] leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/*-- 关闭按钮 --*/}
                    <button
                        className="flex-shrink-0 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
                        disabled={loading}
                        onClick={onCancel}
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/*-- 操作按钮：匹配后台表单风格 — 主操作填充主色，取消纯文字。 --*/}
                <div className="flex justify-end gap-3 mt-5">
                    <button
                        className="px-5 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors cursor-pointer"
                        disabled={loading}
                        onClick={onCancel}
                        type="button"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className="px-5 py-2.5 text-sm bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
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
