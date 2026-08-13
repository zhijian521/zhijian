"use client";

/*== 公开详情页与后台预览共用代码展示和复制操作 ==*/

import clsx from "clsx";
import { type ComponentPropsWithoutRef, type ReactNode } from "react";

import { Icon } from "@/components/ui/icons";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import styles from "./code-block.module.css";

interface CodeBlockProps extends ComponentPropsWithoutRef<"pre"> {
    node?: unknown;
}

function extractText(children: ReactNode): string {
    if (typeof children === "string") {
        return children;
    }

    if (Array.isArray(children)) {
        return children.map(extractText).join("");
    }

    if (children && typeof children === "object" && "props" in children) {
        return extractText((children as { props: { children: ReactNode } }).props.children);
    }

    return "";
}

export function CodeBlock({ children, className, node: _node, ...props }: CodeBlockProps) {
    const { copied: isCopied, copy } = useCopyToClipboard();
    const code = extractText(children);

    return (
        <div className={styles.root}>
            <button aria-label={isCopied ? "已复制代码" : "复制代码"} className={styles.copy} onClick={() => void copy(code)} title="复制代码" type="button">
                <Icon name={isCopied ? "check" : "copy"} size="0.75rem" />
            </button>
            <pre {...props} className={clsx(styles.area, className)}>
                {children}
            </pre>
        </div>
    );
}
