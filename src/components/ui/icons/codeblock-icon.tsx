import type { IconProps } from './index';

/*== CodeBlockIcon 代码块 — 编辑器工具栏 ==*/
export function CodeBlockIcon({ className, ...props }: IconProps) {
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
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M10 16l-2-2 2-2M14 12l2 2-2 2" />
        </svg>
    );
}
