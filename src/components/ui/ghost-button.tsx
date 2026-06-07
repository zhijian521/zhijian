import styles from './ghost-button.module.css';

export interface GhostButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /** 按钮左侧图标，传入 SVG 元素 */
    icon?: React.ReactNode;
    /** 按钮变体：default 默认边框 / primary 主色边框+hover 反色 */
    variant?: 'default' | 'primary';
    /** 按钮尺寸：small 紧凑 / medium 中等 / default 默认 */
    size?: 'small' | 'medium' | 'default';
}

/*== GhostButton 幽灵按钮 — 边框按钮+图标，hover 变暖 ==*/
export function GhostButton({ icon, variant = 'default', size = 'medium', children, className, ...props }: GhostButtonProps) {
    return (
        <a className={`${styles.button} ${styles[variant]} ${styles[size]}${className ? ` ${className}` : ''}`} {...props}>
            {icon ? <span className={styles.icon}>{icon}</span> : null}
            {children}
        </a>
    );
}