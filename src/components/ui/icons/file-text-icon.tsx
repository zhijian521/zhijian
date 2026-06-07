import type { IconProps } from './index';

/*== FileTextIcon 文件文本 — 文章 ==*/
export function FileTextIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 9H8M16 13H8M16 17H8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
