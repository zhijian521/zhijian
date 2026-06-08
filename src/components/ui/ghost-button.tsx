import styles from './ghost-button.module.css';

export interface GhostButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /** 按钮左侧图标，传入 SVG 元素 */
    icon?: React.ReactNode;
    /** 按钮变体：default 默认边框 / primary 主色边框+hover 反色 */
    variant?: 'default' | 'primary';
    /** 按钮尺寸：small 紧凑 / medium 中等 / default 默认 */
    size?: 'small' | 'medium' | 'default';
    /** 渲染为 button 标签（用于弹窗等非链接场景） */
    asButton?: boolean;
}

/*== GhostButton 幽灵按钮 — 边框按钮+图标，hover 变暖 ==*/
export function GhostButton({ icon, variant = 'default', size = 'medium', asButton, className, children, ...props }: GhostButtonProps) {
    const classes = `${styles.button} ${styles[variant]} ${styles[size]}${className ? ` ${className}` : ''}`;
    const iconEl = icon ? <span className={styles.icon}>{icon}</span> : null;

    if (asButton) {
        // 过滤掉 a 标签专属属性
        const { href, target, rel, ...rest } = props as React.AnchorHTMLAttributes<HTMLAnchorElement> & Record<string, unknown>;
        const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
        return (
            <button className={classes} type="button" {...buttonProps}>
                {iconEl}
                {children}
            </button>
        );
    }

    return (
        <a className={classes} {...props}>
            {iconEl}
            {children}
        </a>
    );
}