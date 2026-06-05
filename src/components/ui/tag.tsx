import styles from './tag.module.css';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** 标签样式变体：default 米黄底 / accent 朱砂淡底 / outlined 边框无底 */
    variant?: 'default' | 'accent' | 'outlined';
}

/*== Tag 标签 — 全站通用，支持 default/accent/outlined 三种变体 ==*/
export function Tag({ variant = 'default', className, ...props }: TagProps) {
    return (
        <span
            className={`${styles.tag} ${styles[variant]}${className ? ` ${className}` : ''}`}
            {...props}
        />
    );
}
