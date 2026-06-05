import Link from 'next/link';

import styles from './text-link.module.css';

export interface TextLinkProps extends React.ComponentProps<typeof Link> {
    /** 是否显示右侧箭头图标，默认 true */
    showArrow?: boolean;
}

/*== TextLink 纯文字链接 — 朱砂红文字+箭头，hover 淡出 ==*/
export function TextLink({ showArrow = true, children, className, ...props }: TextLinkProps) {
    return (
        <Link className={`${styles.link} ${className || ''}`} {...props}>
            {children}
            {showArrow ? (
                <svg className={styles.icon} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M5 12h14m0 0l-7-7m7 7l-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : null}
        </Link>
    );
}