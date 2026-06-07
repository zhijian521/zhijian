import type { IconProps } from './index';

/*== ArrowLeftIcon 左箭头 — 返回操作 ==*/
export function ArrowLeftIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="m12 19-7-7 7-7M19 12H5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
