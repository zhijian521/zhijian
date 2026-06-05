import type { IconProps } from './index';

/*== ArrowRightIcon 右箭头 — 用于 TextLink、个人链接等 ==*/
export function ArrowRightIcon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M5 12h14m0 0l-7-7m7 7l-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
