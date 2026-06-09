import type { IconProps } from './index';

/*== TrendingDownIcon 下降趋势图标 ==*/
export function TrendingDownIcon({ className, ...props }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    );
}