/*============================================================================
  rss-copy-button — RSS 订阅按钮

  点击复制 feed.xml 地址到剪贴板，短暂显示"已复制"反馈后恢复。
  基于 GhostButton asButton 模式，客户端组件。
============================================================================*/

'use client';

import { useRef, useState } from 'react';

import { CopyIcon } from '@/components/ui/icons';
import { GhostButton } from '@/components/ui/ghost-button';
import { SITE_METADATA } from '@/lib/core/site';

/*== RSS 订阅按钮 — 点击复制 feed 地址到剪贴板，短暂显示「已复制」反馈 ==*/
export function RssCopyButton() {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const feedUrl = `${SITE_METADATA.siteUrl}/feed.xml`;

    function handleClick() {
        navigator.clipboard.writeText(feedUrl).then(
            () => {
                setCopied(true);
                clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => setCopied(false), 1500);
            },
            () => {},
        );
    }

    return (
        <GhostButton asButton icon={<CopyIcon />} onClick={handleClick} size="small">
            {copied ? '已复制' : 'RSS 订阅'}
        </GhostButton>
    );
}
