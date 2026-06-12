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
export { PlusIcon } from './plus-icon';
export { SearchIcon } from './search-icon';
export { ArrowLeftIcon } from './arrow-left-icon';
export { SaveIcon } from './save-icon';
export { FileTextIcon } from './file-text-icon';
export { UsersIcon } from './users-icon';
export { Edit3Icon } from './edit3-icon';
export { ShieldIcon } from './shield-icon';
export { WrenchIcon } from './wrench-icon';
export { ChevronDownIcon } from './chevron-down-icon';
export { ChevronRightIcon } from './chevron-right-icon';
export { LogOutIcon } from './log-out-icon';
export { UserCircle2Icon } from './user-circle2-icon';
export { LayoutDashboardIcon } from './layout-dashboard-icon';
export { BookOpenIcon } from './book-open-icon';
export { FolderTreeIcon } from './folder-tree-icon';
export { SettingsIcon } from './settings-icon';
export { TagIcon } from './tag-icon';
export { UserIcon } from './user-icon';
export { LockIcon } from './lock-icon';
export { CheckIcon } from './check-icon';
export { CopyIcon } from './copy-icon';
export { ActivityIcon } from './activity-icon';
export { ImageIcon } from './image-icon';
export { TrendingUpIcon } from './trending-up-icon';
export { TrendingDownIcon } from './trending-down-icon';
export { PauseIcon } from './pause-icon';
export { PlayIcon } from './play-icon';
export { BoldIcon } from './bold-icon';
export { ItalicIcon } from './italic-icon';
export { HeadingIcon } from './heading-icon';
export { LinkIcon } from './link-icon';
export { QuoteIcon } from './quote-icon';
export { ListIcon } from './list-icon';
export { ListOrderedIcon } from './list-ordered-icon';
export { MinusIcon } from './minus-icon';
export { CodeBlockIcon } from './codeblock-icon';
export { ArrowUpIcon } from './arrow-up-icon';
export { HomeIcon } from './home-icon';

/** 图标组件的函数类型，用于 NavSubItem 等 */
export type IconComponent = React.ComponentType<IconProps>;
