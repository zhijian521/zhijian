import type { IconProps } from './index';

/*== Trash2Icon 垃圾桶 — 删除操作 ==*/
export function Trash2Icon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" x2="10" y1="11" y2="17" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="14" x2="14" y1="11" y2="17" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
