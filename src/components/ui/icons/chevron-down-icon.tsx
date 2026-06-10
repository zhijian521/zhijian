import type { IconProps } from './index';

/*== ChevronDownIcon 下箭头 — 下拉展开 ==*/
export function ChevronDownIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
