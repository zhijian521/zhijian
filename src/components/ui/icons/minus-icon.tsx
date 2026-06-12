import type { IconProps } from './index';

/*== MinusIcon 水平线 — 编辑器工具栏 ==*/
export function MinusIcon({ className, ...props }: IconProps) {
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
            <line x1="5" x2="19" y1="12" y2="12" />
        </svg>
    );
}
