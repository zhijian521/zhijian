import React from 'react';

/*== 图标组件属性 ==*/
export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    className?: string;
}

/*== 图标组件的函数类型，用于 NavSubItem 等 ==*/
export type IconComponent = React.ComponentType<IconProps>;

/*============================================================================
  图标映射 — SVG inner content

  所有图标共用 viewBox="0 0 24 24"。
  stroke 图标: fill="none" stroke="currentColor" strokeWidth={2}
  fill 图标: fill="currentColor" (仅 github)
  特殊图标: list-ordered 含 <text> 元素
============================================================================*/

/*-- stroke 类型图标的 inner SVG，按 key 索引 --*/
export const STROKE_ICONS: Record<string, React.ReactNode> = {
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
    'alert-triangle': (
        <>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    'arrow-down': <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />,
    'arrow-left': <path d="m12 19-7-7 7-7M19 12H5" strokeLinecap="round" strokeLinejoin="round" />,
    'arrow-right': <path d="M5 12h14m0 0l-7-7m7 7l-7 7" strokeLinecap="round" strokeLinejoin="round" />,
    'arrow-up': <path d="m5 12 7-7 7 7M12 5v14" strokeLinecap="round" strokeLinejoin="round" />,
    bold: (
        <>
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </>
    ),
    book: (
        <path
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    ),
    'book-open': (
        <path
            d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4z"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    ),
    check: <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />,
    'chevron-right': <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />,
    code: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />,
    codeblock: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M10 16l-2-2 2-2M14 12l2 2-2 2" />
        </>
    ),
    copy: (
        <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </>
    ),
    download: (
        <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </>
    ),
    edit3: <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />,
    'external-link': <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />,
    'file-text': (
        <>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 9H8M16 13H8M16 17H8" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    'folder-tree': (
        <>
            <path d="M13 10h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2.5L15.5 3h-2.6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 21h7a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2.5L15.5 14h-2.6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 10h4M2 6h4M2 14h4M2 18h4" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    home: <path d="M15 21v-6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v6M3 10l9-7 9 7M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />,
    image: (
        <>
            <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </>
    ),
    italic: (
        <>
            <line x1="19" x2="10" y1="4" y2="4" />
            <line x1="14" x2="5" y1="20" y2="20" />
            <line x1="15" x2="9" y1="4" y2="20" />
        </>
    ),
    'layout-dashboard': (
        <>
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
        </>
    ),
    link: (
        <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </>
    ),
    list: (
        <>
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
        </>
    ),
    'list-ordered': (
        <>
            <line x1="10" x2="21" y1="6" y2="6" />
            <line x1="10" x2="21" y1="12" y2="12" />
            <line x1="10" x2="21" y1="18" y2="18" />
            <text fill="currentColor" fontSize="8" fontWeight="600" stroke="none" textAnchor="middle" x="4" y="8">
                1
            </text>
            <text fill="currentColor" fontSize="8" fontWeight="600" stroke="none" textAnchor="middle" x="4" y="14">
                2
            </text>
            <text fill="currentColor" fontSize="8" fontWeight="600" stroke="none" textAnchor="middle" x="4" y="20">
                3
            </text>
        </>
    ),
    lock: (
        <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z" strokeLinecap="round" strokeLinejoin="round" />
    ),
    'log-out': <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />,
    mail: <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />,
    minus: <line x1="5" x2="19" y1="12" y2="12" />,
    pause: (
        <>
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
        </>
    ),
    pencil: (
        <>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m15 5 4 4" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    play: <polygon points="5 3 19 12 5 21 5 3" />,
    plus: <path d="M5 12h14M12 5v14" strokeLinecap="round" strokeLinejoin="round" />,
    quote: (
        <>
            <path d="M4 4v16" strokeWidth={3} />
            <path d="M9 8h8M9 12h6M9 16h8" />
        </>
    ),
    save: (
        <>
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 3v4a1 1 0 0 0 1 1h4" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    sparkles: (
        <>
            <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    settings: (
        <>
            <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    shield: (
        <path
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    ),
    tag: <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42zM7 7h.01" strokeLinecap="round" strokeLinejoin="round" />,
    trash2: (
        <>
            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" x2="10" y1="11" y2="17" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="14" x2="14" y1="11" y2="17" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    'trending-down': (
        <>
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </>
    ),
    'trending-up': (
        <>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </>
    ),
    'user-circle2': (
        <>
            <path d="M18 20a6 6 0 0 0-12 0M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" />
        </>
    ),
    user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" strokeLinecap="round" strokeLinejoin="round" />,
    users: (
        <>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    wrench: (
        <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    ),
    x: <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />,
};

/*-- fill 类型图标（仅 github） --*/
export const FILL_ICONS: Record<string, React.ReactNode> = {
    github: (
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    ),
};

/*============================================================================
  图标组件 — 按 key 渲染对应 SVG
============================================================================*/

export function Icon({ name, className, ...props }: IconProps & { name: string }) {
    const fillChildren = FILL_ICONS[name];
    if (fillChildren) {
        return (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
                {fillChildren}
            </svg>
        );
    }

    const strokeChildren = STROKE_ICONS[name];
    if (strokeChildren) {
        return (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
                {strokeChildren}
            </svg>
        );
    }

    return null;
}

/*============================================================================
  便捷命名导出 — 兼容现有 import { XxxIcon } 用法

  ponytail: 保持向后兼容的具名导出，避免一次性改 30+ 个消费文件。
  后续新增图标直接加 STROKE_ICONS / FILL_ICONS 条目即可，无需新增文件。
============================================================================*/

/*-- 生成具名图标组件 --*/
function makeIcon(name: string): React.ComponentType<IconProps> {
    const Component = (props: IconProps) => <Icon name={name} {...props} />;
    Component.displayName = `${name.replace(/(^|-)(\w)/g, (_, _s, c) => c.toUpperCase())}Icon`;
    return Component;
}

export const ActivityIcon = makeIcon('activity');
export const AlertTriangleIcon = makeIcon('alert-triangle');
export const ArrowDownIcon = makeIcon('arrow-down');
export const ArrowLeftIcon = makeIcon('arrow-left');
export const ArrowRightIcon = makeIcon('arrow-right');
export const ArrowUpIcon = makeIcon('arrow-up');
export const BoldIcon = makeIcon('bold');
export const BookIcon = makeIcon('book');
export const BookOpenIcon = makeIcon('book-open');
export const CheckIcon = makeIcon('check');
export const ChevronRightIcon = makeIcon('chevron-right');
export const CodeIcon = makeIcon('code');
export const CodeBlockIcon = makeIcon('codeblock');
export const CopyIcon = makeIcon('copy');
export const DownloadIcon = makeIcon('download');
export const Edit3Icon = makeIcon('edit3');
export const ExternalLinkIcon = makeIcon('external-link');
export const FileTextIcon = makeIcon('file-text');
export const FolderTreeIcon = makeIcon('folder-tree');
export const GitHubIcon = makeIcon('github');
export const HomeIcon = makeIcon('home');
export const ImageIcon = makeIcon('image');
export const ItalicIcon = makeIcon('italic');
export const LayoutDashboardIcon = makeIcon('layout-dashboard');
export const LinkIcon = makeIcon('link');
export const ListIcon = makeIcon('list');
export const ListOrderedIcon = makeIcon('list-ordered');
export const LockIcon = makeIcon('lock');
export const LogOutIcon = makeIcon('log-out');
export const MailIcon = makeIcon('mail');
export const MenuIcon = makeIcon('menu');
export const MinusIcon = makeIcon('minus');
export const PauseIcon = makeIcon('pause');
export const PencilIcon = makeIcon('pencil');
export const PlayIcon = makeIcon('play');
export const PlusIcon = makeIcon('plus');
export const QuoteIcon = makeIcon('quote');
export const SaveIcon = makeIcon('save');
export const SearchIcon = makeIcon('search');
export const SparklesIcon = makeIcon('sparkles');
export const SettingsIcon = makeIcon('settings');
export const ShieldIcon = makeIcon('shield');
export const TagIcon = makeIcon('tag');
export const Trash2Icon = makeIcon('trash2');
export const TrendingDownIcon = makeIcon('trending-down');
export const TrendingUpIcon = makeIcon('trending-up');
export const UserCircle2Icon = makeIcon('user-circle2');
export const UserIcon = makeIcon('user');
export const UsersIcon = makeIcon('users');
export const WrenchIcon = makeIcon('wrench');
export const XIcon = makeIcon('x');
