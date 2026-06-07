import { type ClassValue, clsx } from 'clsx';

/*== 合并 CSS 类名，通过 clsx 解析条件类。用于组件中动态组合 className。 ==*/
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/*== 判断导航项是否处于激活状态，前台和后台导航共用。 ==*/
export function isNavItemActive(pathname: string, href: string, match: 'exact' | 'prefix'): boolean {
    return match === 'exact' ? pathname === href : pathname.startsWith(href);
}