import Link from 'next/link';
import styles from './icon-button.module.css';

export interface IconButtonProps {
    /** 按钮图标，传入 SVG 元素 */
    icon: React.ReactNode;
    /** 按钮变体：default 默认 / danger 危险红 / muted 弱化 */
    variant?: 'default' | 'danger' | 'muted';
    /** 按钮尺寸：small 紧凑 / medium 中等 / default 默认 */
    size?: 'small' | 'medium' | 'default';
    /** 链接地址，传入则渲染为 Link */
    href?: string;
}

const SIZE_MAP = { small: 'small', medium: 'medium', default: 'defaultSize' } as const;

/*== IconButton 图标按钮 — 正方形，纯图标无文字 ==*/
export function IconButton({ icon, variant = 'default', size = 'small', href, className, ...props }: IconButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'size'>) {
    const variantClass = variant === 'default' ? '' : ` ${styles[variant]}`;
    const cls = `${styles.button}${variantClass} ${styles[SIZE_MAP[size]]}${className ? ` ${className}` : ''}`;

    if (href) {
        return (
            <Link className={cls} href={href} {...props}>
                {icon}
            </Link>
        );
    }

    return (
        <button className={cls} type="button" {...props}>
            {icon}
        </button>
    );
}
