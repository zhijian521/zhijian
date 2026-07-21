/*============================================================================
  use-copy-to-clipboard — 复制到剪贴板 Hook

  收敛全站「复制到剪贴板」样板代码，覆盖两种形态：
  - copied 状态版：复制成功置 copied=true，resetMs 后自动复位（图标切换）
  - toast 提示版：复制成功弹 toast.success

  失败时统一 toast.error 并保持 copied=false；
  组件卸载时清理复位定时器，避免 setState-after-unmount。
============================================================================*/

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from '@/components/ui/toast';

/*== 默认配置 ==*/

/** copied 自动复位延迟默认值（全站现有实现统一为 1500ms） */
const DEFAULT_RESET_MS = 1500;
/** 失败 toast 默认文案（现有实现的主流文案） */
const DEFAULT_ERROR_MESSAGE = '复制失败';

/*== Hook 入参 ==*/
export interface UseCopyToClipboardOptions {
    /** true 时复制成功弹 toast.success（默认 false，仅切换 copied 状态） */
    toast?: boolean;
    /** copied 自动复位延迟（毫秒），默认 1500 */
    resetMs?: number;
    /** 成功 toast 文案，默认 '已复制'（仅 toast=true 时生效） */
    successMessage?: string;
    /** 失败 toast 文案，默认 '复制失败' */
    errorMessage?: string;
}

/*== Hook 返回值 ==*/
export interface UseCopyToClipboardReturn {
    /** 复制成功后的短暂状态，resetMs 后自动复位 false */
    copied: boolean;
    /** 复制指定文本到剪贴板；失败时 toast.error 并保持 copied=false */
    copy: (text: string) => Promise<void>;
}

/**
 * 复制到剪贴板 Hook。
 *
 * @param options.toast          true 时成功弹 toast.success
 * @param options.resetMs        copied 自动复位延迟，默认 1500ms
 * @param options.successMessage 成功 toast 文案，默认 '已复制'
 * @param options.errorMessage   失败 toast 文案，默认 '复制失败'
 */
export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}): UseCopyToClipboardReturn {
    const {
        toast: toastOnSuccess = false,
        resetMs = DEFAULT_RESET_MS,
        successMessage = '已复制',
        errorMessage = DEFAULT_ERROR_MESSAGE,
    } = options;

    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    /*-- 卸载时清理复位定时器，避免组件销毁后 setState --*/
    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    const copy = useCallback(
        async (text: string) => {
            try {
                /* navigator.clipboard 在非安全上下文为 undefined，此处统一走 catch */
                await navigator.clipboard.writeText(text);
                setCopied(true);
                if (toastOnSuccess) toast.success(successMessage);
                /* 连续复制时先清掉上一个复位定时器，避免提前复位 */
                clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => setCopied(false), resetMs);
            } catch {
                toast.error(errorMessage);
            }
        },
        [toastOnSuccess, resetMs, successMessage, errorMessage]
    );

    return { copied, copy };
}
