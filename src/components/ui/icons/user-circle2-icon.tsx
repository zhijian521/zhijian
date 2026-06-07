import type { IconProps } from './index';

/*== UserCircle2Icon 用户头像 — 个人资料 ==*/
export function UserCircle2Icon({ className, ...props }: IconProps) {
    return (
        <svg
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className={className}
            {...props}
        >
            <path d="M18 20a6 6 0 0 0-12 0M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" />
        </svg>
    );
}
