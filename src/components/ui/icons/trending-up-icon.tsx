import type { IconProps } from './index';

/*== TrendingUpIcon 上升趋势图标 ==*/
export function TrendingUpIcon({ className, ...props }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}