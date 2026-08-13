/*============================================================================
  use-copy-to-clipboard - 复制文本到剪贴板

  统一处理复制成功状态、自动复位和组件卸载时的定时器清理。
============================================================================*/

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_RESET_MS = 1_500;

export function useCopyToClipboard(resetMs = DEFAULT_RESET_MS) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setCopied(false), resetMs);
        } catch {
            setCopied(false);
        }
    }, [resetMs]);

    return { copied, copy };
}
