/*============================================================================
  rss-copy-button — RSS 订阅按钮

  点击复制 feed.xml 地址到剪贴板，短暂显示"已复制"反馈后恢复。
  基于 GhostButton asButton 模式，客户端组件。
  通过 aria-live 区域向屏幕阅读器播报复制结果。
============================================================================*/

'use client';

import { CopyIcon } from '@/components/ui/icons';
import { GhostButton } from '@/components/ui/ghost-button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { SITE_METADATA } from '@/lib/core/site';

/*== RSS 订阅按钮 — 点击复制 feed 地址到剪贴板，短暂显示「已复制」反馈 ==*/
export function RssCopyButton() {
    const { copied, copy } = useCopyToClipboard();
    const feedUrl = `${SITE_METADATA.siteUrl}/feed.xml`;

    function handleClick() {
        copy(feedUrl);
    }

    return (
        <>
            <GhostButton asButton icon={<CopyIcon />} onClick={handleClick} size="small">
                {copied ? '已复制' : 'RSS 订阅'}
            </GhostButton>
            {/* 屏幕阅读器播报复制结果（视觉隐藏，用全局 visually-hidden 工具类） */}
            <span aria-live="polite" className="visually-hidden" role="status">
                {copied ? '已复制 RSS 订阅地址' : ''}
            </span>
        </>
    );
}
