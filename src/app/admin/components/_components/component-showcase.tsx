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
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { Pagination } from '@/components/ui/pagination';
import { PillSelect } from '@/components/ui/pill-select';
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
    const [customDialogOpen, setCustomDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(3);
    const [textInput, setTextInput] = useState('');
    const [pillValue, setPillValue] = useState('all');

    return (
        <>
            <AdminPageHeader
                description='项目自建组件与图标的示例展示，便于开发时查阅。'
                eyebrow='Components'
                tag={`${ICONS.length} 个图标 · 10 个组件`}
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
                    <p className={styles.componentDesc}>标签组件，支持 default / accent / outlined 三种变体，small / medium / default 三种尺寸。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <Tag size='small' variant='default'>默认</Tag>
                            <Tag size='small' variant='accent'>强调</Tag>
                            <Tag size='small' variant='outlined'>描边</Tag>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <Tag size='medium' variant='default'>默认</Tag>
                            <Tag size='medium' variant='accent'>强调</Tag>
                            <Tag size='medium' variant='outlined'>描边</Tag>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <Tag size='default' variant='default'>默认</Tag>
                            <Tag size='default' variant='accent'>强调</Tag>
                            <Tag size='default' variant='outlined'>描边</Tag>
                        </div>
                    </div>
                </div>

                {/* GhostButton */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>GhostButton</h3>
                    <p className={styles.componentDesc}>幽灵边框按钮，渲染为 &lt;a&gt; 标签，支持 default / primary 两种变体，small / medium / default 三种尺寸。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <GhostButton href='#' icon={<PlusIcon className={styles.btnIcon} />} size='small' variant='primary'>新建</GhostButton>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <GhostButton href='#' icon={<PlusIcon className={styles.btnIcon} />} size='medium' variant='primary'>新建</GhostButton>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <GhostButton href='#' icon={<PlusIcon className={styles.btnIcon} />} size='default' variant='primary'>新建</GhostButton>
                        </div>
                    </div>
                </div>

                {/* SubmitButton */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>SubmitButton</h3>
                    <p className={styles.componentDesc}>提交按钮，渲染为 type=&quot;submit&quot; 的 &lt;button&gt;，支持 small / medium / default 三种尺寸。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <SubmitButton size='small'>提交</SubmitButton>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <SubmitButton size='medium'>提交</SubmitButton>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <SubmitButton>提交</SubmitButton>
                        </div>
                    </div>
                </div>

                {/* TextInput */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>TextInput</h3>
                    <p className={styles.componentDesc}>带图标槽和标签的文本输入框，支持 small / medium / default 三种尺寸。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <TextInput
                                icon={<SearchIcon className={styles.inputIcon} />}
                                id='demo-search-sm'
                                inputSize='small'
                                label='搜索'
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder='输入关键词...'
                                value={textInput}
                            />
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <TextInput
                                icon={<SearchIcon className={styles.inputIcon} />}
                                id='demo-search-md'
                                inputSize='medium'
                                label='搜索'
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder='输入关键词...'
                                value={textInput}
                            />
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <TextInput
                                icon={<SearchIcon className={styles.inputIcon} />}
                                id='demo-search'
                                label='搜索'
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder='输入关键词...'
                                value={textInput}
                            />
                        </div>
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

                {/* PillSelect */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>PillSelect</h3>
                    <p className={styles.componentDesc}>药丸单选，连排扁平选项，选中项底部主色指示条，支持 small / medium / default 三种尺寸。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <PillSelect
                                name='demo-pill-sm'
                                onChange={setPillValue}
                                options={[
                                    { value: 'all', label: '全部' },
                                    { value: 'published', label: '已发布' },
                                    { value: 'draft', label: '草稿' },
                                ]}
                                size='small'
                                value={pillValue}
                            />
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <PillSelect
                                name='demo-pill-md'
                                onChange={setPillValue}
                                options={[
                                    { value: 'all', label: '全部' },
                                    { value: 'published', label: '已发布' },
                                    { value: 'draft', label: '草稿' },
                                ]}
                                size='medium'
                                value={pillValue}
                            />
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <PillSelect
                                name='demo-pill'
                                onChange={setPillValue}
                                options={[
                                    { value: 'all', label: '全部' },
                                    { value: 'published', label: '已发布' },
                                    { value: 'draft', label: '草稿' },
                                ]}
                                size='default'
                                value={pillValue}
                            />
                        </div>
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

                {/* Dialog */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>Dialog</h3>
                    <p className={styles.componentDesc}>通用弹窗容器，遮罩 + 居中面板 + 关闭按钮。</p>
                    <div className={styles.demoRow}>
                        <button className={styles.triggerBtn} onClick={() => setCustomDialogOpen(true)} type='button'>
                            打开弹窗
                        </button>
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

            <Dialog onClose={() => setCustomDialogOpen(false)} open={customDialogOpen} title='示例弹窗'>
                <p className={styles.componentDesc}>这是一个通用弹窗，可以放置任意内容。点击右上角关闭按钮或遮罩层关闭。</p>
            </Dialog>
        </>
    );
}