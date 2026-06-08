import styles from './tag.module.css';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** 标签样式变体：default 米黄底 / accent 朱砂淡底 / outlined 边框无底 */
    variant?: 'default' | 'accent' | 'outlined';
    /** 标签尺寸：mini 极小 / small 紧凑 / medium 中等 / default 默认 */
    size?: 'mini' | 'small' | 'medium' | 'default';
}

/*== Tag 标签 — 全站通用，支持 default/accent/outlined 三种变体 ==*/
const SIZE_MAP = { mini: 'mini', small: 'small', medium: 'medium', default: 'defaultSize' } as const;

export function Tag({ variant = 'default', size = 'medium', className, ...props }: TagProps) {
    const variantClass = variant === 'default' ? '' : ` ${styles[variant]}`;
    return (
        <span
            className={`${styles.tag}${variantClass} ${styles[SIZE_MAP[size]]}${className ? ` ${className}` : ''}`}
            {...props}
        />
    );
}
