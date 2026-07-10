/*============================================================================
  ghost-button — 幽灵按钮

  边框按钮 + 可选图标，支持 default / primary 双变体，
  mini / small / medium / default / large 五尺寸。
  asButton 模式渲染 <button>（弹窗等非链接场景），否则渲染 <a>。
============================================================================*/

/*== 样式 ==*/
import { cn } from '@/lib/core/utils';
import styles from './ghost-button.module.css';

/*== 类型定义 ==*/
export interface GhostButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /*-- 按钮左侧图标，传入 SVG 元素 --*/
    icon?: React.ReactNode;
    /*-- 按钮变体：default 默认边框 / primary 主色边框+hover 反色 --*/
    variant?: 'default' | 'primary';
    /*-- 按钮尺寸：mini 极小 / small 紧凑 / medium 中等 / default 默认 / large 大（hero 等大标题场景） --*/
    size?: 'mini' | 'small' | 'medium' | 'default' | 'large';
    /*-- 渲染为 button 标签（用于弹窗等非链接场景） --*/
    asButton?: boolean;
    /*-- 选中态，用于筛选/切换场景的激活标记 --*/
    active?: boolean;
    /*-- 禁用态（仅 asButton 模式生效） --*/
    disabled?: boolean;
}

const SIZE_CLASS: Record<string, string | undefined> = {
    mini: 'mini',
    small: 'small',
    medium: 'medium',
    large: 'large',
    // default 不需要额外 class，基础样式即为 default 尺寸
};

/*== GhostButton 幽灵按钮 — 边框按钮+图标，hover 变暖 ==*/
export function GhostButton({
    icon,
    variant = 'default',
    size = 'medium',
    asButton,
    active,
    className,
    children,
    ...props
}: GhostButtonProps) {
    const sizeClass = SIZE_CLASS[size];
    const classes = cn(styles.button, styles[variant], sizeClass && styles[sizeClass], active && styles.active, className);
    const iconEl = icon ? <span className={styles.icon}>{icon}</span> : null;

    if (asButton) {
        /*-- 过滤掉 a 标签专属属性 --*/
        const { href, target, rel, disabled, ...buttonProps } = props as React.AnchorHTMLAttributes<HTMLAnchorElement> &
            React.ButtonHTMLAttributes<HTMLButtonElement>;
        return (
            <button className={classes} disabled={disabled} type="button" {...buttonProps}>
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
