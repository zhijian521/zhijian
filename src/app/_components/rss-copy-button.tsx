'use client';

import { useState } from 'react';

import { CopyIcon } from '@/components/ui/icons';
import { GhostButton } from '@/components/ui/ghost-button';
import { SITE_METADATA } from '@/lib/site';

/*== RSS 订阅按钮 — 点击复制 feed 地址到剪贴板，短暂显示「已复制」反馈 ==*/
export function RssCopyButton() {
    const [copied, setCopied] = useState(false);
    const feedUrl = `${SITE_METADATA.siteUrl}/feed.xml`;

    async function handleClick() {
        await navigator.clipboard.writeText(feedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <GhostButton
            asButton
            icon={<CopyIcon />}
            onClick={handleClick}
            size="small"
        >
            {copied ? '已复制' : 'RSS 订阅'}
        </GhostButton>
    );
}
