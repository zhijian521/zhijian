import type { IconProps } from './index';

/*== HomeIcon 主页 — 返回首页 ==*/
export function HomeIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M15 21v-6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v6M3 10l9-7 9 7M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
