import type { IconProps } from './index';

/*== PlusIcon 加号 — 新建操作 ==*/
export function PlusIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M5 12h14M12 5v14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
