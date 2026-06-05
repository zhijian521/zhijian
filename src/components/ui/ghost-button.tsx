import styles from './ghost-button.module.css';

export interface GhostButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /** 按钮左侧图标，传入 SVG 元素 */
    icon?: React.ReactNode;
}

/*== GhostButton 幽灵按钮 — 边框按钮+图标，hover 变暖 ==*/
export function GhostButton({ icon, children, className, ...props }: GhostButtonProps) {
    return (
        <a className={`${styles.button} ${className || ''}`} {...props}>
            {icon ? <span className={styles.icon}>{icon}</span> : null}
            {children}
        </a>
    );
}