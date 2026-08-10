/*============================================================================
  button-link - 固定尺寸链接按钮

  根据 URL 输出站内 Next Link 或站外原生链接，统一按钮的视觉样式。
============================================================================*/

import clsx from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icons";

import styles from "./button.module.css";

interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> {
    children: ReactNode;
    className?: string;
    href: string;
    icon?: IconName;
    variant?: "default" | "primary";
}

/*== 链接只负责导航，禁用状态由调用方通过不渲染链接处理 ==*/
export function ButtonLink({ children, className, href, icon, variant = "default", ...props }: ButtonLinkProps) {
    const rootClassName = clsx(styles.root, styles[variant], className);
    const content = (
        <>
            {icon ? <Icon className={styles.icon} name={icon} /> : null}
            {children}
        </>
    );

    if (href.startsWith("/") && !href.startsWith("//")) {
        return (
            <Link {...props} className={rootClassName} href={href}>
                {content}
            </Link>
        );
    }

    return (
        <a {...props} className={rootClassName} href={href}>
            {content}
        </a>
    );
}
