/*============================================================================
  rss-copy-button - RSS 订阅地址复制按钮

  复制服务端传入的绝对 RSS 地址，并提供短暂的视觉与屏幕阅读器反馈。
============================================================================*/

"use client";

import { Button } from "@/components/ui/button";
import type { IconName } from "@/components/ui/icons";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import styles from "./rss-copy-button.module.css";

interface RssCopyButtonProps {
    feedUrl: string;
}

export function RssCopyButton({ feedUrl }: RssCopyButtonProps) {
    const { copied, copy } = useCopyToClipboard();
    const icon: IconName = copied ? "check" : "rss";

    return (
        <>
            <Button icon={icon} onClick={() => void copy(feedUrl)}>
                {copied ? "已复制" : "RSS 订阅"}
            </Button>
            <span aria-live="polite" className={styles.status} role="status">
                {copied ? "已复制 RSS 订阅地址" : ""}
            </span>
        </>
    );
}
