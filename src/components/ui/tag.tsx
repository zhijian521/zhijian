import styles from './tag.module.css';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** 标签样式变体 */
    variant?: 'default' | 'accent';
}

/*== Tag 标签 — 全站通用，支持 default/accent 两种变体 ==*/
export function Tag({ variant = 'default', className, ...props }: TagProps) {
    return (
        <span
            className={`${styles.tag} ${styles[variant]}${className ? ` ${className}` : ''}`}
            {...props}
        />
    );
}
