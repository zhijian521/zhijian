import type { IconProps } from './index';

/*== ArrowDownIcon 下箭头 — 用于 Hero CTA 按钮 ==*/
export function ArrowDownIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
