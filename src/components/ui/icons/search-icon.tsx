import type { IconProps } from './index';

/*== SearchIcon 搜索 — 搜索操作 ==*/
export function SearchIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
