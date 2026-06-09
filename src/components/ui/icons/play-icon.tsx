import type { IconProps } from './index';

/*== PlayIcon 播放/启用图标 ==*/
export function PlayIcon({ className, ...props }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}