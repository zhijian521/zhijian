/*============================================================================
  text-link — 纯文字链接

  朱砂红文字 + 可选右侧箭头图标，hover 淡出动画。
  基于 next/link，支持所有 Link 属性。
============================================================================*/

import Link from 'next/link';

import { ArrowRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/core/utils';

import styles from './text-link.module.css';

export interface TextLinkProps extends React.ComponentProps<typeof Link> {
    /** 是否显示右侧箭头图标，默认 true */
    showArrow?: boolean;
}

/*== TextLink 纯文字链接 — 朱砂红文字+箭头，hover 淡出 ==*/
export function TextLink({ showArrow = true, children, className, ...props }: TextLinkProps) {
    return (
        <Link className={cn(styles.link, className)} {...props}>
            {children}
            {showArrow ? <ArrowRightIcon className={styles.icon} /> : null}
        </Link>
    );
}
