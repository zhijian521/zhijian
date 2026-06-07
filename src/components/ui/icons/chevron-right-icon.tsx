import type { IconProps } from './index';

/*== ChevronRightIcon 右箭头 — 折叠展开 ==*/
export function ChevronRightIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
