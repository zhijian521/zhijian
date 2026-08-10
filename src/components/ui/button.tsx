/*============================================================================
  button - 固定尺寸原生操作按钮

  只承载需要触发本地操作的原生 button，链接由 ButtonLink 负责。
============================================================================*/

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icons";

import styles from "./button.module.css";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
    children: ReactNode;
    className?: string;
    icon?: IconName;
    variant?: "default" | "primary";
}

/*== 原生操作保留 button 的 disabled、type 与键盘语义 ==*/
export function Button({ children, className, disabled, icon, type, variant = "default", ...props }: ButtonProps) {
    const rootClassName = clsx(styles.root, styles[variant], disabled && styles.disabled, className);

    return (
        <button {...props} className={rootClassName} disabled={disabled} type={type ?? "button"}>
            {icon ? <Icon className={styles.icon} name={icon} /> : null}
            {children}
        </button>
    );
}
