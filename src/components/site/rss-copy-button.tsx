/*============================================================================
  rss-copy-button — RSS 订阅按钮

  点击复制 feed.xml 地址到剪贴板，短暂显示"已复制"反馈后恢复。
  基于 GhostButton asButton 模式，客户端组件。
  通过 aria-live 区域向屏幕阅读器播报复制结果。
============================================================================*/

'use client';

import { useEffect, useRef, useState } from 'react';

import { CopyIcon } from '@/components/ui/icons';
import { GhostButton } from '@/components/ui/ghost-button';
import { SITE_METADATA } from '@/lib/core/site';

/*== 样式导入 ==*/
import styles from './rss-copy-button.module.css';

/*== RSS 订阅按钮 — 点击复制 feed 地址到剪贴板，短暂显示「已复制」反馈 ==*/
export function RssCopyButton() {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const feedUrl = `${SITE_METADATA.siteUrl}/feed.xml`;

    /*-- 卸载时清理定时器，避免组件销毁后 setState --*/
    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

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
        <>
            <GhostButton asButton icon={<CopyIcon />} onClick={handleClick} size="small">
                {copied ? '已复制' : 'RSS 订阅'}
            </GhostButton>
            {/* 屏幕阅读器播报复制结果（视觉隐藏） */}
            <span aria-live="polite" className={styles.visuallyHidden} role="status">
                {copied ? '已复制 RSS 订阅地址' : ''}
            </span>
        </>
    );
}
