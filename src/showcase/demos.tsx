'use client';

import { useState } from 'react';

import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
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

const row = { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' } as const;

/*== Tag：3 变体 × 4 尺寸全铺开 ==*/
export function TagDemo() {
    return (
        <>
            {(['default', 'primary', 'outlined'] as const).map(v => (
                <div key={v} style={row}>
                    <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>variant: {v}</span>
                    {(['mini', 'small', 'medium', 'default'] as const).map(s => (
                        <Tag key={s} size={s} variant={v}>{s}</Tag>
                    ))}
                </div>
            ))}
        </>
    );
}

/*== GhostButton：变体 × 尺寸 + asButton + disabled + icon ==*/
export function GhostButtonDemo() {
    return (
        <>
            {(['default', 'primary'] as const).map(v => (
                <div key={v} style={row}>
                    <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>variant: {v}</span>
                    {(['small', 'medium', 'default'] as const).map(s => (
                        <GhostButton key={s} href='#' size={s} variant={v}>{s}</GhostButton>
                    ))}
                    <GhostButton asButton icon={<PlusIcon />} size='medium' variant={v}>带图标</GhostButton>
                </div>
            ))}
            <div style={row}>
                <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>disabled</span>
                <GhostButton asButton disabled>禁用态</GhostButton>
                <GhostButton asButton disabled variant='primary'>禁用主色</GhostButton>
            </div>
        </>
    );
}

/*== SubmitButton：3 尺寸 + disabled ==*/
export function SubmitButtonDemo() {
    return (
        <>
            <div style={row}>
                <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>size</span>
                {(['small', 'medium', 'default'] as const).map(s => (
                    <SubmitButton key={s} size={s}>{s}</SubmitButton>
                ))}
            </div>
            <div style={row}>
                <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>disabled</span>
                <SubmitButton disabled>禁用态</SubmitButton>
            </div>
        </>
    );
}

/*== IconButton：变体 × 尺寸 ==*/
export function IconButtonDemo() {
    return (
        <>
            {(['default', 'danger'] as const).map(v => (
                <div key={v} style={row}>
                    <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>variant: {v}</span>
                    <IconButton icon={<PencilIcon />} size='small' title='small' variant={v} />
                    <IconButton icon={<PlusIcon />} size='medium' title='medium' variant={v} />
                    <IconButton icon={<Trash2Icon />} title='default' variant={v} />
                </div>
            ))}
        </>
    );
}

/*== TextLink：箭头开关 + 尺寸（无 size，仅 showArrow） ==*/
export function TextLinkDemo() {
    return (
        <div style={row}>
            <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>showArrow</span>
            <TextLink href='#'>true（默认）</TextLink>
            <TextLink href='#' showArrow={false}>false</TextLink>
        </div>
    );
}

/*== TextInput：标签 / 图标 / 尺寸 ==*/
export function TextInputDemo() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '20rem' }}>
            <TextInput id='ti-1' label='标题' placeholder='带标签' />
            <TextInput icon={<SearchIcon />} id='ti-2' inputSize='medium' placeholder='带图标 medium' />
            <TextInput icon={<SearchIcon />} id='ti-3' inputSize='small' placeholder='带图标 small' />
            <TextInput id='ti-4' inputSize='default' placeholder='default 尺寸' />
        </div>
    );
}

/*== PillSelect：尺寸 × 选中态 ==*/
function PillSelectRow({ size }: { size: 'small' | 'medium' | 'default' }) {
    const [v, setV] = useState('all');
    return (
        <div style={row}>
            <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>size: {size}</span>
            <PillSelect
                name={`pill-${size}`}
                onChange={setV}
                options={[
                    { value: 'all', label: '全部' },
                    { value: 'active', label: '正常' },
                    { value: 'disabled', label: '已禁用' },
                ]}
                size={size}
                value={v}
            />
        </div>
    );
}

export function PillSelectDemo() {
    return (
        <>
            <PillSelectRow size='small' />
            <PillSelectRow size='medium' />
            <PillSelectRow size='default' />
        </>
    );
}

/*== Select：尺寸 + disabled + placeholder ==*/
function SelectRow({ size, disabled }: { size: 'small' | 'medium' | 'default'; disabled?: boolean }) {
    const [v, setV] = useState('draft');
    return (
        <div style={row}>
            <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>size: {size}{disabled ? ' · disabled' : ''}</span>
            <Select
                disabled={disabled}
                onChange={setV}
                options={[
                    { value: 'draft', label: '草稿' },
                    { value: 'published', label: '已发布' },
                    { value: 'archived', label: '已归档' },
                ]}
                placeholder='请选择'
                size={size}
                value={v}
            />
        </div>
    );
}

export function SelectDemo() {
    return (
        <>
            <SelectRow size='small' />
            <SelectRow size='medium' />
            <SelectRow size='default' />
            <SelectRow size='medium' disabled />
        </>
    );
}

/*== Pagination：回调模式 + 链接模式 ==*/
export function PaginationDemo() {
    const [page, setPage] = useState(3);
    const [size, setSize] = useState(10);
    return (
        <>
            <div style={row}>
                <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>回调模式</span>
                <Pagination
                    current={page}
                    onPageChange={setPage}
                    onPageSizeChange={(s) => { setSize(s); setPage(1); }}
                    pageSize={size}
                    total={8}
                />
            </div>
            <div style={row}>
                <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>链接模式</span>
                <Pagination current={3} getHref={(p) => `#page-${p}`} total={8} />
            </div>
        </>
    );
}

/*== DataTable：普通 + scrollable + 空状态 ==*/
interface DTRow { id: number; title: string; status: string }

export function DataTableDemo() {
    const rows: DTRow[] = [
        { id: 1, title: '第一篇文章标题', status: '已发布' },
        { id: 2, title: '第二篇文章标题长一些以测试打点省略', status: '草稿' },
    ];
    const columns: DataColumn<DTRow>[] = [
        { header: '标题', width: '8rem', render: (r) => r.title },
        { header: '状态', render: (r) => <Tag size='mini' variant={r.status === '已发布' ? 'primary' : 'default'}>{r.status}</Tag> },
        { header: '操作', width: '6rem', render: () => (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
                <IconButton icon={<PencilIcon />} size='medium' title='编辑' />
                <IconButton icon={<Trash2Icon />} size='medium' title='删除' variant='danger' />
            </div>
        ) },
    ];
    const emptyCols: DataColumn<DTRow>[] = [{ header: '标题', render: (r) => r.title }];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>scrollable（带 width 列打点）</div>
                <DataTable columns={columns} rowKey={(r) => r.id} rows={rows} scrollable />
            </div>
            <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>空状态</div>
                <DataTable columns={emptyCols} emptyText='暂无数据' rowKey={(r) => r.id} rows={[]} />
            </div>
        </div>
    );
}

/*== Dialog ==*/
export function DialogDemo() {
    const [open, setOpen] = useState(false);
    const [customOpen, setCustomOpen] = useState(false);
    return (
        <div style={row}>
            <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>open</span>
            <GhostButton asButton onClick={() => setOpen(true)} variant='primary'>默认宽度</GhostButton>
            <GhostButton asButton onClick={() => setCustomOpen(true)} variant='primary'>自定义宽度</GhostButton>
            <Dialog onClose={() => setOpen(false)} open={open} title='示例弹窗'>
                <p style={{ margin: 0 }}>Esc 或点击遮罩关闭。默认 maxWidth 28rem。</p>
            </Dialog>
            <Dialog maxWidth='40rem' onClose={() => setCustomOpen(false)} open={customOpen} title='宽弹窗'>
                <p style={{ margin: 0 }}>maxWidth=40rem，适合长表单。</p>
            </Dialog>
        </div>
    );
}

/*== ConfirmDialog ==*/
export function ConfirmDialogDemo() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [custom, setCustom] = useState(false);
    return (
        <div style={row}>
            <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>open</span>
            <GhostButton asButton onClick={() => setOpen(true)} variant='primary'>默认按钮</GhostButton>
            <GhostButton asButton onClick={() => setCustom(true)} variant='primary'>自定义按钮 + loading</GhostButton>
            <ConfirmDialog
                message='确定要执行此操作吗？此操作不可撤销。'
                onCancel={() => setOpen(false)}
                onConfirm={() => setOpen(false)}
                open={open}
                title='确认操作'
            />
            <ConfirmDialog
                confirmLabel='删除'
                message='确定要删除这条记录吗？'
                onCancel={() => setCustom(false)}
                onConfirm={() => { setLoading(true); setTimeout(() => { setLoading(false); setCustom(false); toast.success('已删除'); }, 1000); }}
                open={custom}
                title='删除确认'
                loading={loading}
            />
        </div>
    );
}

/*== Toast ==*/
export function ToastDemo() {
    return (
        <div style={row}>
            <span style={{ minWidth: '4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>type</span>
            <GhostButton asButton onClick={() => toast.success('操作成功')} variant='primary'>success</GhostButton>
            <GhostButton asButton onClick={() => toast.error('操作失败')}>error</GhostButton>
        </div>
    );
}
