import type { IconProps } from './index';

/*== ActivityIcon 监控/脉搏图标 ==*/
export function ActivityIcon({ className, ...props }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
}