import type { IconProps } from './index';

/*== Edit3Icon 编辑笔 — 编辑操作 ==*/
export function Edit3Icon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
