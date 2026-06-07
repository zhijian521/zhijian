import type { IconProps } from './index';

/*== FolderTreeIcon 文件夹树 — 分类管理 ==*/
export function FolderTreeIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M13 10h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5L15.5 3h-2.6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 21h7a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5L15.5 14h-2.6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 10h4M2 6h4M2 14h4M2 18h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
