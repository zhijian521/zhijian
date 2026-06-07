import type { IconProps } from './index';

/*== AlertTriangleIcon 警告三角 — 确认弹窗 ==*/
export function AlertTriangleIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
