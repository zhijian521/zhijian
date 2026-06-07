import type { IconProps } from './index';

/*== PencilIcon 铅笔 — 编辑操作 ==*/
export function PencilIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m15 5 4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
