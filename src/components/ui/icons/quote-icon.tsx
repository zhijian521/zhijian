import type { IconProps } from './index';

/*== QuoteIcon 引用块 — 左竖线样式，更直观 ==*/
export function QuoteIcon({ className, ...props }: IconProps) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            {...props}
        >
            <path d="M4 4v16" strokeWidth={3} />
            <path d="M9 8h8M9 12h6M9 16h8" />
        </svg>
    );
}
