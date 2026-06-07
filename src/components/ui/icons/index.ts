/*== Icons 图标库 — 通用属性与桶导出 ==*/
export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    /** 附加 CSS 类名，通常由消费方 CSS Module 提供 */
    className?: string;
}

export { MenuIcon } from './menu-icon';
export { ArrowRightIcon } from './arrow-right-icon';
export { ArrowDownIcon } from './arrow-down-icon';
export { MailIcon } from './mail-icon';
export { ExternalLinkIcon } from './external-link-icon';
export { GitHubIcon } from './github-icon';
export { CodeIcon } from './code-icon';
export { BookIcon } from './book-icon';
export { PencilIcon } from './pencil-icon';
export { Trash2Icon } from './trash2-icon';
export { AlertTriangleIcon } from './alert-triangle-icon';
export { XIcon } from './x-icon';
