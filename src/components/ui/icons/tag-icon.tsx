import type { IconProps } from './index';

/*== TagIcon 标签 — 标签管理 ==*/
export function TagIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42zM7 7h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
