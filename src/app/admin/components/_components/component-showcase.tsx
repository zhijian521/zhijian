'use client';

import { useState } from 'react';

import {
    MenuIcon, ArrowRightIcon, ArrowDownIcon, ArrowLeftIcon,
    ArrowUpIcon, MailIcon, ExternalLinkIcon, GitHubIcon, CodeIcon,
    BookIcon, BookOpenIcon, PencilIcon, Edit3Icon,
    Trash2Icon, AlertTriangleIcon, XIcon, PlusIcon,
    SearchIcon, SaveIcon, FileTextIcon, UsersIcon,
    ShieldIcon, WrenchIcon, ChevronRightIcon,
    LogOutIcon, UserCircle2Icon, LayoutDashboardIcon, FolderTreeIcon,
    SettingsIcon, TagIcon, CheckIcon, CopyIcon,
    UserIcon, LockIcon, ActivityIcon, ImageIcon,
    TrendingUpIcon, TrendingDownIcon, PauseIcon, PlayIcon,
    BoldIcon, ItalicIcon, LinkIcon,
    QuoteIcon, ListIcon, ListOrderedIcon, MinusIcon,
    CodeBlockIcon, HomeIcon, DownloadIcon,
} from '@/components/ui/icons';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { Pagination } from '@/components/ui/pagination';
import { PillSelect } from '@/components/ui/pill-select';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { TextLink } from '@/components/ui/text-link';
import { toast } from '@/components/ui/toast';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import styles from './component-showcase.module.css';

/*== 图标清单 ==*/
const ICONS = [
    /* 导航与方向 */
    { name: 'MenuIcon', Icon: MenuIcon },
    { name: 'ArrowRightIcon', Icon: ArrowRightIcon },
    { name: 'ArrowDownIcon', Icon: ArrowDownIcon },
    { name: 'ArrowLeftIcon', Icon: ArrowLeftIcon },
    { name: 'ArrowUpIcon', Icon: ArrowUpIcon },
    { name: 'ChevronRightIcon', Icon: ChevronRightIcon },
    { name: 'HomeIcon', Icon: HomeIcon },
    /* 操作 */
    { name: 'PlusIcon', Icon: PlusIcon },
    { name: 'XIcon', Icon: XIcon },
    { name: 'SearchIcon', Icon: SearchIcon },
    { name: 'PencilIcon', Icon: PencilIcon },
    { name: 'Edit3Icon', Icon: Edit3Icon },
    { name: 'Trash2Icon', Icon: Trash2Icon },
    { name: 'SaveIcon', Icon: SaveIcon },
    { name: 'CopyIcon', Icon: CopyIcon },
    { name: 'DownloadIcon', Icon: DownloadIcon },
    { name: 'CheckIcon', Icon: CheckIcon },
    /* 通讯与链接 */
    { name: 'MailIcon', Icon: MailIcon },
    { name: 'ExternalLinkIcon', Icon: ExternalLinkIcon },
    { name: 'LinkIcon', Icon: LinkIcon },
    { name: 'GitHubIcon', Icon: GitHubIcon },
    /* 内容与文件 */
    { name: 'CodeIcon', Icon: CodeIcon },
    { name: 'CodeBlockIcon', Icon: CodeBlockIcon },
    { name: 'BookIcon', Icon: BookIcon },
    { name: 'BookOpenIcon', Icon: BookOpenIcon },
    { name: 'FileTextIcon', Icon: FileTextIcon },
    { name: 'FolderTreeIcon', Icon: FolderTreeIcon },
    { name: 'ImageIcon', Icon: ImageIcon },
    { name: 'TagIcon', Icon: TagIcon },
    /* 用户与权限 */
    { name: 'UsersIcon', Icon: UsersIcon },
    { name: 'UserIcon', Icon: UserIcon },
    { name: 'UserCircle2Icon', Icon: UserCircle2Icon },
    { name: 'ShieldIcon', Icon: ShieldIcon },
    { name: 'LockIcon', Icon: LockIcon },
    /* 管理与设置 */
    { name: 'LayoutDashboardIcon', Icon: LayoutDashboardIcon },
    { name: 'SettingsIcon', Icon: SettingsIcon },
    { name: 'WrenchIcon', Icon: WrenchIcon },
    { name: 'LogOutIcon', Icon: LogOutIcon },
    /* 状态与趋势 */
    { name: 'AlertTriangleIcon', Icon: AlertTriangleIcon },
    { name: 'ActivityIcon', Icon: ActivityIcon },
    { name: 'TrendingUpIcon', Icon: TrendingUpIcon },
    { name: 'TrendingDownIcon', Icon: TrendingDownIcon },
    { name: 'PauseIcon', Icon: PauseIcon },
    { name: 'PlayIcon', Icon: PlayIcon },
    /* 编辑器工具栏 */
    { name: 'BoldIcon', Icon: BoldIcon },
    { name: 'ItalicIcon', Icon: ItalicIcon },
    { name: 'QuoteIcon', Icon: QuoteIcon },
    { name: 'ListIcon', Icon: ListIcon },
    { name: 'ListOrderedIcon', Icon: ListOrderedIcon },
    { name: 'MinusIcon', Icon: MinusIcon },
];

/*== 组件列表示例页 ==*/
export default function ComponentShowcase() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [customDialogOpen, setCustomDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(3);
    const [textInput, setTextInput] = useState('');
    const [pillValue, setPillValue] = useState('all');
    const [selectValue, setSelectValue] = useState('draft');

    return (
        <>
            <AdminPageHeader
                description='项目自建组件与图标的示例展示，便于开发时查阅。'
                eyebrow='Components'
                tag={`${ICONS.length} 个图标 · 16 个组件`}
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

                {/* Toast */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>Toast</h3>
                    <p className={styles.componentDesc}>全局提示，支持 success / error 两种类型，3 秒自动消失，可手动关闭。使用 toast.success() / toast.error() 调用。</p>
                    <div className={styles.demoRow}>
                        <GhostButton asButton onClick={() => toast.success('操作成功！')} size='medium' variant='primary'>成功提示</GhostButton>
                        <GhostButton asButton onClick={() => toast.error('操作失败，请稍后重试。')} size='medium'>错误提示</GhostButton>
                    </div>
                </div>

                {/* Tag */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>Tag</h3>
                    <p className={styles.componentDesc}>标签组件，支持 default / primary / outlined 三种变体，mini / small / medium / default 四种尺寸。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>mini</span>
                            <Tag size='mini' variant='default'>默认</Tag>
                            <Tag size='mini' variant='primary'>强调</Tag>
                            <Tag size='mini' variant='outlined'>描边</Tag>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <Tag size='small' variant='default'>默认</Tag>
                            <Tag size='small' variant='primary'>强调</Tag>
                            <Tag size='small' variant='outlined'>描边</Tag>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <Tag size='medium' variant='default'>默认</Tag>
                            <Tag size='medium' variant='primary'>强调</Tag>
                            <Tag size='medium' variant='outlined'>描边</Tag>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <Tag size='default' variant='default'>默认</Tag>
                            <Tag size='default' variant='primary'>强调</Tag>
                            <Tag size='default' variant='outlined'>描边</Tag>
                        </div>
                    </div>
                </div>

                {/* GhostButton */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>GhostButton</h3>
                    <p className={styles.componentDesc}>幽灵边框按钮，渲染为 &lt;a&gt; 标签，支持 default / primary 两种变体，small / medium / default 三种尺寸，disabled 时降低透明度并禁止交互。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <GhostButton href='#' icon={<PlusIcon className={styles.btnIcon} />} size='small' variant='primary'>新建</GhostButton>
                            <GhostButton href='#' size='small'>默认</GhostButton>
                            <GhostButton asButton disabled size='small'>禁用</GhostButton>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <GhostButton href='#' icon={<PlusIcon className={styles.btnIcon} />} size='medium' variant='primary'>新建</GhostButton>
                            <GhostButton href='#' size='medium'>默认</GhostButton>
                            <GhostButton asButton disabled size='medium' variant='primary'>禁用</GhostButton>
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <GhostButton href='#' icon={<PlusIcon className={styles.btnIcon} />} size='default' variant='primary'>新建</GhostButton>
                            <GhostButton href='#' size='default'>默认</GhostButton>
                            <GhostButton asButton disabled size='default'>禁用</GhostButton>
                        </div>
                    </div>
                </div>

                {/* IconButton */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>IconButton</h3>
                    <p className={styles.componentDesc}>正方形图标按钮，纯图标无文字，支持 default / danger 两种变体，small / medium / default 三种尺寸。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <IconButton icon={<PencilIcon />} size='small' />
                            <IconButton icon={<Trash2Icon />} size='small' variant='danger' />
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <IconButton icon={<PencilIcon />} size='medium' />
                            <IconButton icon={<Trash2Icon />} size='medium' variant='danger' />
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <IconButton icon={<PencilIcon />} size='default' />
                            <IconButton icon={<Trash2Icon />} size='default' variant='danger' />
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

                {/* Select */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>Select</h3>
                    <p className={styles.componentDesc}>下拉选择，自建面板替代原生 select，支持 small / medium / default 三种尺寸，点击外部或 Escape 关闭，选中项左侧朱砂竖线指示。</p>
                    <div className={styles.demoRow}>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>small</span>
                            <Select
                                onChange={setSelectValue}
                                options={[
                                    { value: 'all', label: '全部' },
                                    { value: 'published', label: '已发布' },
                                    { value: 'draft', label: '草稿' },
                                ]}
                                placeholder='请选择'
                                size='small'
                                value={selectValue}
                            />
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>medium</span>
                            <Select
                                onChange={setSelectValue}
                                options={[
                                    { value: 'all', label: '全部' },
                                    { value: 'published', label: '已发布' },
                                    { value: 'draft', label: '草稿' },
                                ]}
                                placeholder='请选择'
                                size='medium'
                                value={selectValue}
                            />
                        </div>
                        <div className={styles.demoCol}>
                            <span className={styles.demoLabel}>default</span>
                            <Select
                                onChange={setSelectValue}
                                options={[
                                    { value: 'all', label: '全部' },
                                    { value: 'published', label: '已发布' },
                                    { value: 'draft', label: '草稿' },
                                ]}
                                placeholder='请选择'
                                size='default'
                                value={selectValue}
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

                {/* DataTable */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>DataTable</h3>
                    <p className={styles.componentDesc}>通用数据表格，支持列定义、对齐、响应式隐藏和空状态。</p>
                    <div className={styles.demoRow}>
                        <DataTable
                            columns={[
                                { header: '名称', render: (row) => row.name },
                                { header: '状态', render: (row) => row.status },
                                { header: '更新时间', render: (row) => row.date, align: 'right', hideBelow: 'md' },
                            ]}
                            rows={[
                                { id: 1, name: '组件库搭建', status: '已完成', date: '2026-06-07' },
                                { id: 2, name: '标签系统', status: '进行中', date: '2026-06-08' },
                                { id: 3, name: '文章编辑器', status: '待开始', date: '—' },
                            ]}
                            rowKey={(row) => row.id}
                        />
                    </div>
                </div>

                {/* StatusPage */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>StatusPage</h3>
                    <p className={styles.componentDesc}>通用状态页（403/404 等），水墨背景 + 大号水印码 + 毛玻璃卡片 + 诗意文案 + 返回首页按钮。用于 not-found 和 forbidden 页面。</p>
                    <div className={styles.demoRow}>
                        <GhostButton asButton onClick={() => toast.success('StatusPage 为独立全屏页面，无法在此预览，请访问不存在的路径查看效果。')} size='medium' variant='primary'>
                            查看说明
                        </GhostButton>
                    </div>
                </div>

                {/* AdminPageHeader */}
                <div className={styles.componentBlock}>
                    <h3 className={styles.componentName}>AdminPageHeader</h3>
                    <p className={styles.componentDesc}>后台页面统一头部组件，包含 eyebrow（红色英文标签）、title（衬线标题）、description（灰色说明）、tag（统计标签）和 action（操作按钮插槽）。所有后台页面均使用此组件。</p>
                    <div className={styles.demoRow}>
                        <div style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                            <AdminPageHeader
                                description='示例页面描述文字'
                                eyebrow='Demo'
                                tag='示例标签'
                                title='页面标题'
                                action={<GhostButton asButton size='small' variant='primary'>操作按钮</GhostButton>}
                            />
                        </div>
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