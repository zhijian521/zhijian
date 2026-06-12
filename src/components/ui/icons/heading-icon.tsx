import type { IconProps } from './index';

/*== HeadingIcon 标题 H — 编辑器工具栏 ==*/
export function HeadingIcon({ className, ...props }: IconProps) {
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
            <path d="M6 4v16M18 4v16M8 4h4M8 20h4M14 12h6" />
        </svg>
    );
}
