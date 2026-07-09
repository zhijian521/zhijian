/*============================================================================
  icon-button — 图标按钮

  正方形纯图标按钮，2 色变体（default / danger），
  4 尺寸（mini / small / medium / default）。
  传入 href 则渲染为 Link，否则渲染为 button。
============================================================================*/

/*== 依赖导入 ==*/
import Link from 'next/link';

/*== 样式导入 ==*/
import { cn } from '@/lib/core/utils';
import styles from './icon-button.module.css';

/*== 基础属性 ==*/
interface IconButtonBaseProps {
    /*-- 按钮图标，传入 SVG 元素 --*/
    icon: React.ReactNode;
    /*-- 按钮变体：default 默认 / danger 危险红 --*/
    variant?: 'default' | 'danger';
    /*-- 按钮尺寸：mini 极小 / small 紧凑 / medium 中等 / default 默认 --*/
    size?: 'mini' | 'small' | 'medium' | 'default';
}

/*== Button 模式：无 href，渲染 <button> ==*/
type IconButtonAsButton = IconButtonBaseProps &
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
        href?: undefined;
    };

/*== Link 模式：有 href，渲染 <a> ==*/
type IconButtonAsLink = IconButtonBaseProps &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'size'> & {
        href: string;
    };

/*-- 判别联合：根据 href 区分 button / anchor 属性 --*/
export type IconButtonProps = IconButtonAsButton | IconButtonAsLink;

const SIZE_CLASS: Record<string, string | undefined> = {
    mini: 'mini',
    small: 'small',
    medium: 'medium',
    // default 不需要额外 class，基础样式即为 default 尺寸
};

/*== IconButton 图标按钮 — 正方形，纯图标无文字 ==*/
export function IconButton({
    icon,
    variant = 'default',
    size = 'medium',
    className,
    ...props
}: IconButtonProps) {
    const sizeClass = SIZE_CLASS[size];
    const cls = cn(
        styles.button,
        variant === 'default' ? undefined : styles[variant],
        sizeClass && styles[sizeClass],
        className,
    );

    /*-- Link 模式 --*/
    if ('href' in props && props.href !== undefined) {
        return (
            <Link className={cls} {...props}>
                {icon}
            </Link>
        );
    }

    /*-- Button 模式 --*/
    return (
        <button className={cls} type="button" {...props}>
            {icon}
        </button>
    );
}
