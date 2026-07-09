/*============================================================================
  demos — 组件示例集合

  SHOWCASE_REGISTRY 中每个组件对应一个 Demo 函数。
  调好一个加一个，不提前注册未调优的组件。
============================================================================*/

'use client';

/*== 依赖导入 ==*/
import { useState } from 'react';

/*== 组件导入 ==*/
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import { PillSelect } from '@/components/ui/pill-select';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { TextLink } from '@/components/ui/text-link';
import Dialog from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { ToastContainer, toast } from '@/components/ui/toast';

/*== 样式导入 ==*/
import styles from './demos.module.css';

export function TagDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 默认变体下展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <Tag size="mini">mini</Tag>
                    <Tag size="small">small</Tag>
                    <Tag size="medium">medium</Tag>
                </div>
            </div>
            {/*-- 变体 — medium 尺寸下展示全部变体 --*/}
            <div className={styles.row}>
                <span className={styles.label}>变体</span>
                <div className={styles.items}>
                    <Tag size="medium">default</Tag>
                    <Tag size="medium" variant="primary">primary</Tag>
                    <Tag size="medium" variant="outlined">outlined</Tag>
                </div>
            </div>

            {/*-- 代码块 — 尺寸/变体 + 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 尺寸：mini | small | medium（默认）
// 变体：default（默认）| primary | outlined

// 使用方式
<Tag size="medium">标签</Tag>
<Tag size="medium" variant="primary">主色</Tag>
<Tag size="medium" variant="outlined">描边</Tag>`}</code></pre>
        </div>
    );
}

export function SubmitButtonDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <SubmitButton size="small">small</SubmitButton>
                    <SubmitButton size="medium">medium</SubmitButton>
                </div>
            </div>
            {/*-- 禁用态 --*/}
            <div className={styles.row}>
                <span className={styles.label}>禁用</span>
                <div className={styles.items}>
                    <SubmitButton disabled>禁用态</SubmitButton>
                </div>
            </div>

            {/*-- 代码块 — 尺寸/状态 + 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 尺寸：small | medium（默认）
// 状态：disabled

// 使用方式
<SubmitButton size="medium">提交</SubmitButton>`}</code></pre>
        </div>
    );
}

export function IconButtonDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <IconButton icon={<SearchIcon />} size="mini" />
                    <IconButton icon={<SearchIcon />} size="small" />
                    <IconButton icon={<SearchIcon />} size="medium" />
                </div>
            </div>
            {/*-- 变体 — medium 尺寸下展示全部变体 --*/}
            <div className={styles.row}>
                <span className={styles.label}>变体</span>
                <div className={styles.items}>
                    <IconButton icon={<SearchIcon />} size="medium" />
                    <IconButton icon={<Trash2Icon />} size="medium" variant="danger" />
                </div>
            </div>
            {/*-- 禁用态 --*/}
            <div className={styles.row}>
                <span className={styles.label}>禁用</span>
                <div className={styles.items}>
                    <IconButton icon={<SearchIcon />} disabled />
                    <IconButton icon={<Trash2Icon />} disabled variant="danger" />
                </div>
            </div>

            {/*-- 代码块 — 尺寸/变体/状态 + 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 尺寸：mini | small | medium（默认）
// 变体：default（默认）| danger
// disabled

// 使用方式
<IconButton icon={<SearchIcon />} size="medium" />
<IconButton icon={<Trash2Icon />} size="medium" variant="danger" />`}</code></pre>
        </div>
    );
}

export function TextLinkDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 带箭头（默认） --*/}
            <div className={styles.row}>
                <span className={styles.label}>默认</span>
                <div className={styles.items}>
                    <TextLink href="#">阅读全文</TextLink>
                </div>
            </div>
            {/*-- 无箭头 --*/}
            <div className={styles.row}>
                <span className={styles.label}>无箭头</span>
                <div className={styles.items}>
                    <TextLink href="#" showArrow={false}>查看更多</TextLink>
                </div>
            </div>

            {/*-- 代码块 — 配置 + 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// showArrow：默认 true

// 使用方式
<TextLink href="#">阅读全文</TextLink>
<TextLink href="#" showArrow={false}>查看更多</TextLink>`}</code></pre>
        </div>
    );
}

export function GhostButtonDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 默认变体下展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <GhostButton href="#" size="small">small</GhostButton>
                    <GhostButton href="#" size="medium">medium</GhostButton>
                    <GhostButton href="#" size="large">large</GhostButton>
                </div>
            </div>
            {/*-- 变体 — medium 尺寸下展示全部变体 --*/}
            <div className={styles.row}>
                <span className={styles.label}>变体</span>
                <div className={styles.items}>
                    <GhostButton href="#" size="medium">default</GhostButton>
                    <GhostButton href="#" size="medium" variant="primary">primary</GhostButton>
                </div>
            </div>
            {/*-- 图标 — medium 尺寸带图标 --*/}
            <div className={styles.row}>
                <span className={styles.label}>图标</span>
                <div className={styles.items}>
                    <GhostButton href="#" icon={<PlusIcon />} size="medium">新增</GhostButton>
                    <GhostButton href="#" icon={<PlusIcon />} size="medium" variant="primary">新增</GhostButton>
                </div>
            </div>
            {/*-- 禁用态 — asButton 模式 --*/}
            <div className={styles.row}>
                <span className={styles.label}>禁用</span>
                <div className={styles.items}>
                    <GhostButton asButton disabled>禁用态</GhostButton>
                    <GhostButton asButton disabled variant="primary">禁用主色</GhostButton>
                </div>
            </div>

            {/*-- 代码块 — 尺寸/变体/模式 + 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 尺寸：small | medium（默认）| large
// 变体：default（默认）| primary
// asButton 模式渲染 <button>，disabled 仅 asButton 生效

// 使用方式
<GhostButton href="#" size="medium">按钮</GhostButton>
<GhostButton href="#" size="medium" variant="primary">主色</GhostButton>
<GhostButton href="#" size="medium" icon={<PlusIcon />}>图标</GhostButton>`}</code></pre>
        </div>
    );
}

export function SelectDemo() {
    const [val1, setVal1] = useState('a');
    const [val2, setVal2] = useState('a');

    const options = [
        { value: 'a', label: '选项 A' },
        { value: 'b', label: '选项 B' },
        { value: 'c', label: '选项 C' },
    ];

    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <Select options={options} value={val1} onChange={setVal1} size="small" placeholder="small" />
                    <Select options={options} value={val2} onChange={setVal2} size="medium" placeholder="medium" />
                </div>
            </div>
            {/*-- 禁用态 --*/}
            <div className={styles.row}>
                <span className={styles.label}>禁用</span>
                <div className={styles.items}>
                    <Select options={options} value="a" onChange={() => {}} disabled />
                </div>
            </div>

            {/*-- 代码块 — 尺寸/状态 + 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 尺寸：small | medium（默认）
// disabled

// 使用方式
const [value, setValue] = useState('a');
const options = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
];

<Select
  options={options}
  value={value}
  onChange={setValue}
  size="medium"
  placeholder="请选择"
/>`}</code></pre>
        </div>
    );
}

export function TextInputDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <TextInput inputSize="small" placeholder="small" />
                    <TextInput inputSize="medium" placeholder="medium" />
                </div>
            </div>
            {/*-- 标签 --*/}
            <div className={styles.row}>
                <span className={styles.label}>标签</span>
                <div className={styles.items}>
                    <TextInput label="标题" inputSize="medium" placeholder="带标签输入" />
                </div>
            </div>
            {/*-- 图标 --*/}
            <div className={styles.row}>
                <span className={styles.label}>图标</span>
                <div className={styles.items}>
                    <TextInput icon={<SearchIcon />} inputSize="small" placeholder="搜索..." />
                    <TextInput icon={<SearchIcon />} inputSize="medium" placeholder="搜索..." />
                </div>
            </div>

            {/*-- 代码块 — 尺寸 + 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 尺寸：small | medium（默认）

// 使用方式
<TextInput inputSize="medium" placeholder="输入..." />
<TextInput label="标题" inputSize="medium" placeholder="带标签" />
<TextInput icon={<SearchIcon />} inputSize="medium" placeholder="搜索..." />`}</code></pre>
        </div>
    );
}

export function PillSelectDemo() {
    const [val1, setVal1] = useState('all');
    const [val2, setVal2] = useState('all');

    const options = [
        { value: 'all', label: '全部' },
        { value: 'published', label: '已发布' },
        { value: 'draft', label: '草稿' },
    ];

    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <PillSelect options={options} value={val1} onChange={setVal1} name="ps1" size="small" />
                    <PillSelect options={options} value={val2} onChange={setVal2} name="ps2" size="medium" />
                </div>
            </div>

            {/*-- 代码块 — 尺寸 + 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 尺寸：small | medium（默认）

// 使用方式
const [value, setValue] = useState('all');
const options = [
  { value: 'all', label: '全部' },
  { value: 'published', label: '已发布' },
];

<PillSelect
  options={options}
  value={value}
  onChange={setValue}
  name="filter"
  size="medium"
/>`}</code></pre>
        </div>
    );
}

export function DialogDemo() {
    const [open, setOpen] = useState(false);

    return (
        <div className={styles.demo}>
            {/*-- 触发按钮 --*/}
            <div className={styles.row}>
                <span className={styles.label}>弹窗</span>
                <div className={styles.items}>
                    <GhostButton asButton onClick={() => setOpen(true)} size="medium">
                        打开弹窗
                    </GhostButton>
                </div>
            </div>
            {/*-- 基础弹窗 --*/}
            <Dialog open={open} title="弹窗标题" onClose={() => setOpen(false)}>
                <p className={styles.dialogContent}>这是弹窗内容区域，可以放入任意 React 节点。</p>
            </Dialog>

            {/*-- 代码块 — 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 使用方式
const [open, setOpen] = useState(false);

<Dialog
  open={open}
  title="弹窗标题"
  onClose={() => setOpen(false)}
  maxWidth="28rem"  // 可选
>
  {/* 任意内容 */}
</Dialog>`}</code></pre>
        </div>
    );
}

export function ConfirmDialogDemo() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setOpen(false);
        }, 1500);
    };

    return (
        <div className={styles.demo}>
            {/*-- 触发按钮 --*/}
            <div className={styles.row}>
                <span className={styles.label}>弹窗</span>
                <div className={styles.items}>
                    <GhostButton asButton onClick={() => setOpen(true)} size="medium">
                        打开确认弹窗
                    </GhostButton>
                </div>
            </div>
            {/*-- 确认弹窗 — 含 loading 态 --*/}
            <ConfirmDialog
                open={open}
                title="确认删除"
                message="删除后不可恢复，确定要删除吗？"
                confirmLabel="删除"
                loading={loading}
                onConfirm={handleConfirm}
                onCancel={() => setOpen(false)}
            />

            {/*-- 代码块 — 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 使用方式
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);

<ConfirmDialog
  open={open}
  title="确认删除"
  message="删除后不可恢复，确定要删除吗？"
  confirmLabel="删除"
  loading={loading}
  onConfirm={handleConfirm}
  onCancel={() => setOpen(false)}
/>`}</code></pre>
        </div>
    );
}

export function StatusPageDemo() {
    return (
        <div className={styles.demo}>
            <p className={styles.dialogContent}>
                状态页为全屏固定定位组件，请在 <code>/404</code> 或 <code>/forbidden</code> 页面查看实际效果。
            </p>
            <pre className={styles.codeBlock}><code>{`// 使用方式
<StatusPage
  code={404}
  title="此页云深不知处，且向别处寻芳踪。"
  subtitle="页面不存在或已被移除"
/>`}</code></pre>
        </div>
    );
}

export function ToastDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 触发按钮 --*/}
            <div className={styles.row}>
                <span className={styles.label}>类型</span>
                <div className={styles.items}>
                    <GhostButton asButton onClick={() => toast.success('操作成功')} size="medium">
                        成功提示
                    </GhostButton>
                    <GhostButton asButton onClick={() => toast.error('操作失败')} size="medium">
                        错误提示
                    </GhostButton>
                </div>
            </div>
            {/*-- Toast 容器 --*/}
            <ToastContainer />

            {/*-- 代码块 — 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 使用方式
import { toast, ToastContainer } from '@/components/ui/toast';

// 在布局中挂载容器
<ToastContainer />

// 任意位置调用
toast.success('操作成功');
toast.error('操作失败');`}</code></pre>
        </div>
    );
}

export function PaginationDemo() {
    const [page, setPage] = useState(3);
    const [pageSize, setPageSize] = useState(10);

    return (
        <div className={styles.demo}>
            {/*-- 客户端回调模式 --*/}
            <div className={styles.row}>
                <span className={styles.label}>回调</span>
                <div className={styles.items}>
                    <Pagination
                        current={page}
                        total={10}
                        onPageChange={setPage}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            </div>
            {/*-- 服务端链接模式 --*/}
            <div className={styles.row}>
                <span className={styles.label}>链接</span>
                <div className={styles.items}>
                    <Pagination current={1} getHref={(p) => `?page=${p}`} total={5} />
                </div>
            </div>

            {/*-- 代码块 — 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 客户端回调模式
const [page, setPage] = useState(1);
<Pagination
  current={page}
  total={10}
  onPageChange={setPage}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
/>

// 服务端链接模式
<Pagination current={1} total={5} getHref={(p) => \`?page=\${p}\`} />`}</code></pre>
        </div>
    );
}

export function DataTableDemo() {
    interface DemoRow {
        id: number;
        name: string;
        role: string;
        date: string;
    }

    const columns: DataColumn<DemoRow>[] = [
        { header: 'ID', render: (r) => r.id, width: '60px' },
        { header: '名称', render: (r) => r.name, width: '120px' },
        { header: '角色', render: (r) => <Tag size="mini">{r.role}</Tag>, hideBelow: 'sm' },
        { header: '日期', render: (r) => r.date, hideBelow: 'md' },
    ];

    const rows: DemoRow[] = [
        { id: 1, name: '张三', role: 'admin', date: '2026-07-01' },
        { id: 2, name: '李四', role: 'user', date: '2026-07-02' },
        { id: 3, name: '王五', role: 'user', date: '2026-07-03' },
    ];

    return (
        <div className={styles.demo}>
            {/*-- 基础表格 --*/}
            <DataTable columns={columns} rowKey={(r) => r.id} rows={rows} />
            {/*-- 空态 --*/}
            <div style={{ marginTop: 'var(--space-4)' }}>
                <DataTable columns={columns} rowKey={(r) => r.id} rows={[]} emptyText="暂无记录" />
            </div>

            {/*-- 代码块 — 使用方式 --*/}
            <pre className={styles.codeBlock}><code>{`// 使用方式
interface Row { id: number; name: string; role: string; date: string; }

const columns: DataColumn<Row>[] = [
  { header: 'ID', render: (r) => r.id, width: '60px' },
  { header: '名称', render: (r) => r.name, width: '120px' },
  { header: '角色', render: (r) => <Tag size="mini">{r.role}</Tag>, hideBelow: 'sm' },
  { header: '日期', render: (r) => r.date, hideBelow: 'md' },
];

<DataTable columns={columns} rowKey={(r) => r.id} rows={rows} />
<DataTable columns={columns} rowKey={(r) => r.id} rows={[]} emptyText="暂无记录" />`}</code></pre>
        </div>
    );
}
