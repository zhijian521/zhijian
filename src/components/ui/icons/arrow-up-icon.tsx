import type { IconProps } from './index';

/*== ArrowUpIcon 上箭头 — 返回顶部 ==*/
export function ArrowUpIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="m5 12 7-7 7 7M12 5v14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
