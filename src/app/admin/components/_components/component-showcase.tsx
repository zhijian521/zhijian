'use client';

import { useState } from 'react';

import {
    MenuIcon, ArrowRightIcon, ArrowDownIcon, ArrowLeftIcon,
    MailIcon, ExternalLinkIcon, GitHubIcon, CodeIcon,
    BookIcon, BookOpenIcon, PencilIcon, Edit3Icon,
    Trash2Icon, AlertTriangleIcon, XIcon, PlusIcon,
    SearchIcon, SaveIcon, FileTextIcon, UsersIcon,
    ShieldIcon, WrenchIcon, ChevronRightIcon, LogOutIcon,
    UserCircle2Icon, LayoutDashboardIcon, FolderTreeIcon,
    SettingsIcon, TagIcon,
} from '@/components/ui/icons';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { Pagination } from '@/components/ui/pagination';
import { SubmitButton } from '@/components/ui/submit-button';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { TextLink } from '@/components/ui/text-link';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import styles from './component-showcase.module.css';

/*== 图标清单 ==*/
const ICONS = [
    { name: 'MenuIcon', Icon: MenuIcon },
    { name: 'ArrowRightIcon', Icon: ArrowRightIcon },
    { name: 'ArrowDownIcon', Icon: ArrowDownIcon },
    { name: 'ArrowLeftIcon', Icon: ArrowLeftIcon },
    { name: 'ChevronRightIcon', Icon: ChevronRightIcon },
    { name: 'PlusIcon', Icon: PlusIcon },
    { name: 'XIcon', Icon: XIcon },
    { name: 'SearchIcon', Icon: SearchIcon },
    { name: 'PencilIcon', Icon: PencilIcon },
    { name: 'Edit3Icon', Icon: Edit3Icon },
    { name: 'Trash2Icon', Icon: Trash2Icon },
    { name: 'SaveIcon', Icon: SaveIcon },
    { name: 'MailIcon', Icon: MailIcon },
    { name: 'ExternalLinkIcon', Icon: ExternalLinkIcon },
    { name: 'GitHubIcon', Icon: GitHubIcon },
    { name: 'CodeIcon', Icon: CodeIcon },
    { name: 'BookIcon', Icon: BookIcon },
    { name: 'BookOpenIcon', Icon: BookOpenIcon },
    { name: 'FileTextIcon', Icon: FileTextIcon },
    { name: 'FolderTreeIcon', Icon: FolderTreeIcon },
    { name: 'TagIcon', Icon: TagIcon },
    { name: 'UsersIcon', Icon: UsersIcon },
    { name: 'UserCircle2Icon', Icon: UserCircle2Icon },
    { name: 'LayoutDashboardIcon', Icon: LayoutDashboardIcon },
    { name: 'SettingsIcon', Icon: SettingsIcon },
    { name: 'ShieldIcon', Icon: ShieldIcon },
    { name: 'WrenchIcon', Icon: WrenchIcon },
    { name: 'AlertTriangleIcon', Icon: AlertTriangleIcon },
    { name: 'LogOutIcon', Icon: LogOutIcon },
];

/*== 组件列表示例页 ==*/
export default function ComponentShowcase() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(3);
    const [textInput, setTextInput] = useState('');

    return (
        <>
            <AdminPageHeader
                description='项目自建组件与图标的示例展示，便于开发时查阅。'
                eyebrow='Components'
                tag={`${ICONS.length} 个图标 · 7 个组件`}
                title='组件列表'
            />

            {/* 图标展示区 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>图标库</h2>
                <div className={styles.iconGrid}>
                    {ICONS.map(({ name, Icon }) => (
                        <div className={styles.iconCell} key={name}>
                            <Icon className={styles.iconSample} />
                            <span className={styles.iconName}>{name}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 组件展示区 */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>组件示例</h2>

                {/* Tag */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>Tag</h3>
                    <p className={styles.componentDesc}>标签组件，支持 default / accent / outlined 三种变体。</p>
                    <div className={styles.demoRow}>
                        <Tag variant='default'>默认标签</Tag>
                        <Tag variant='accent'>强调标签</Tag>
                        <Tag variant='outlined'>描边标签</Tag>
                    </div>
                </div>

                {/* GhostButton */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>GhostButton</h3>
                    <p className={styles.componentDesc}>幽灵边框按钮，渲染为 &lt;a&gt; 标签，可选左侧图标。</p>
                    <div className={styles.demoRow}>
                        <GhostButton href='#' icon={<ArrowRightIcon className={styles.btnIcon} />}>
                            查看详情
                        </GhostButton>
                        <GhostButton href='#'>无图标</GhostButton>
                    </div>
                </div>

                {/* SubmitButton */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>SubmitButton</h3>
                    <p className={styles.componentDesc}>提交按钮，渲染为 type=&quot;submit&quot; 的 &lt;button&gt;。</p>
                    <div className={styles.demoRow}>
                        <SubmitButton>提交</SubmitButton>
                        <SubmitButton disabled>禁用状态</SubmitButton>
                    </div>
                </div>

                {/* TextInput */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>TextInput</h3>
                    <p className={styles.componentDesc}>带图标槽和标签的文本输入框。</p>
                    <div className={styles.demoRow}>
                        <TextInput
                            icon={<SearchIcon className={styles.inputIcon} />}
                            id='demo-search'
                            label='搜索'
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder='输入关键词...'
                            value={textInput}
                        />
                        <TextInput
                            id='demo-plain'
                            label='无图标输入'
                            placeholder='普通输入框'
                        />
                    </div>
                </div>

                {/* TextLink */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>TextLink</h3>
                    <p className={styles.componentDesc}>纯文字链接，可选右侧箭头。</p>
                    <div className={styles.demoRow}>
                        <TextLink href='#'>带箭头链接</TextLink>
                        <TextLink href='#' showArrow={false}>无箭头链接</TextLink>
                    </div>
                </div>

                {/* Pagination */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>Pagination</h3>
                    <p className={styles.componentDesc}>分页控件，自动省略过多页码。</p>
                    <div className={styles.demoRow}>
                        <Pagination current={currentPage} onPageChange={setCurrentPage} total={8} />
                    </div>
                </div>

                {/* ConfirmDialog */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>ConfirmDialog</h3>
                    <p className={styles.componentDesc}>二次确认弹窗，主操作填充主色，取消纯文字。</p>
                    <div className={styles.demoRow}>
                        <button className={styles.triggerBtn} onClick={() => setDialogOpen(true)} type='button'>
                            打开确认弹窗
                        </button>
                    </div>
                </div>
            </section>

            <ConfirmDialog
                message='这是一个确认弹窗的示例，点击确认或取消关闭。'
                onCancel={() => setDialogOpen(false)}
                onConfirm={() => setDialogOpen(false)}
                open={dialogOpen}
                title='示例弹窗'
            />
        </>
    );
}