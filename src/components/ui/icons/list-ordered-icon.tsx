import type { IconProps } from './index';

/*== ListOrderedIcon 有序列表 — 编辑器工具栏 ==*/
export function ListOrderedIcon({ className, ...props }: IconProps) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            {...props}
        >
            <line x1="10" x2="21" y1="6" y2="6" />
            <line x1="10" x2="21" y1="12" y2="12" />
            <line x1="10" x2="21" y1="18" y2="18" />
            <text
                fill="currentColor"
                fontSize="8"
                fontWeight="600"
                stroke="none"
                textAnchor="middle"
                x="4"
                y="8"
            >
                1
            </text>
            <text
                fill="currentColor"
                fontSize="8"
                fontWeight="600"
                stroke="none"
                textAnchor="middle"
                x="4"
                y="14"
            >
                2
            </text>
            <text
                fill="currentColor"
                fontSize="8"
                fontWeight="600"
                stroke="none"
                textAnchor="middle"
                x="4"
                y="20"
            >
                3
            </text>
        </svg>
    );
}
