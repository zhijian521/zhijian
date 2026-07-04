'use client';

import { useEffect, useState, useCallback } from 'react';

import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Dialog from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { Pagination } from '@/components/ui/pagination';
import { PillSelect } from '@/components/ui/pill-select';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { SubmitButton } from '@/components/ui/submit-button';
import { toast } from '@/components/ui/toast';
import { api } from '@/lib/http-client';
import type { ListData } from '@/lib/api-response';
import styles from './user-list-client.module.css';
import shared from './admin-shared.module.css';

interface UserItem {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'disabled';
    created_at: string;
}

interface UserFormData {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    status: 'active' | 'disabled';
}

const EMPTY_FORM: UserFormData = {
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
};

/*== 后台用户列表：匹配博客表格风格。 ==*/
export default function UserListClient() {
    const [data, setData] = useState<ListData<UserItem>>({ data: [], total: 0 });
    const [searchInput, setSearchInput] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; username: string } | null>(null);

    /* 弹窗表单状态 */
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [form, setForm] = useState<UserFormData>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState<string | null>(null);

    const fetchUsers = useCallback(
        async (opts?: { page?: number; search?: string }) => {
            const p = opts?.page ?? page;
            const s = opts?.search ?? searchKeyword;
            setLoading(true);
            try {
                const params: Record<string, unknown> = { page: p, pageSize };
                if (s.trim()) params.search = s.trim();
                const res = await api.get<ListData<UserItem>>('/admin/users', params);
                if (res.code === 0 && res.data) {
                    setData(res.data);
                }
            } catch (err) {
                toast.error('获取用户列表失败');
            } finally {
                setLoading(false);
            }
        },
        [page, searchKeyword, pageSize]
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    function handleSearchSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        setSearchKeyword(searchInput);
        setPage(1);
    }

    function handleDeleteClick(userId: number, username: string) {
        setDeleteTarget({ id: userId, username });
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;

        setDeleting(deleteTarget.id);
        try {
            const res = await api.delete(`/admin/users/${deleteTarget.id}`);
            if (res.code === 0) {
                setData((prev) => ({
                    ...prev,
                    data: prev.data.filter((u) => u.id !== deleteTarget.id),
                    total: prev.total - 1,
                }));
                setDeleteTarget(null);
                toast.success('删除成功');
            } else {
                toast.error(res.message || '删除失败。');
            }
        } catch {
            toast.error('删除请求失败。');
        } finally {
            setDeleting(null);
        }
    }

    /* 弹窗表单操作 */
    function openCreateForm() {
        setFormMode('create');
        setEditingUser(null);
        setForm(EMPTY_FORM);
        setFormMessage(null);
        setFormOpen(true);
    }

    function openEditForm(user: UserItem) {
        setFormMode('edit');
        setEditingUser(user);
        setForm({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role,
            status: user.status,
        });
        setFormMessage(null);
        setFormOpen(true);
    }

    function handleFormChange<K extends keyof UserFormData>(key: K, value: UserFormData[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setFormMessage(null);
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setFormMessage(null);

        const body: Record<string, string> = {
            username: form.username.trim(),
            email: form.email.trim(),
            role: form.role,
            status: form.status,
        };
        if (form.password.trim()) body.password = form.password.trim();

        try {
            const res = formMode === 'create' ? await api.post('/admin/users', body) : await api.put(`/admin/users/${editingUser!.id}`, body);

            if (res.code !== 0) {
                setFormMessage(res.message || '操作失败。');
                return;
            }

            setFormOpen(false);
            toast.success(formMode === 'create' ? '创建成功' : '修改成功');
            fetchUsers();
        } catch {
            setFormMessage('请求失败，请稍后重试。');
        } finally {
            setSubmitting(false);
        }
    }

    const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

    const columns: DataColumn<UserItem>[] = [
        {
            header: '用户名',
            render: (user) => <span className={styles.nameCell}>{user.username}</span>,
        },
        {
            header: '邮箱',
            hideBelow: 'sm',
            render: (user) => <span className={shared.mutedCell}>{user.email}</span>,
        },
        {
            header: '角色',
            render: (user) => (
                <Tag size="mini" variant={user.role === 'admin' ? 'primary' : 'default'}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                </Tag>
            ),
        },
        {
            header: '状态',
            hideBelow: 'md',
            render: (user) => (
                <Tag size="mini" variant={user.status === 'disabled' ? 'outlined' : 'default'}>
                    {user.status === 'active' ? '正常' : '已禁用'}
                </Tag>
            ),
        },
        {
            header: '创建时间',
            hideBelow: 'lg',
            render: (user) => <span className={shared.mutedCell}>{new Date(user.created_at).toLocaleDateString('zh-CN')}</span>,
        },
        {
            header: '操作',
            width: '6rem',
            render: (user) => (
                <div className={shared.actionGroup}>
                    <IconButton icon={<PencilIcon />} onClick={() => openEditForm(user)} size="medium" title="编辑" />
                    <IconButton icon={<Trash2Icon />} onClick={() => handleDeleteClick(user.id, user.username)} size="medium" title="删除" variant="danger" disabled={deleting === user.id} />
                </div>
            ),
        },
    ];

    return (
        <div>
            {/* 顶部操作栏 */}
            <div className={styles.toolbar}>
                <form className={styles.searchForm} onSubmit={handleSearchSubmit} role="search" aria-label="搜索用户">
                    <TextInput icon={<SearchIcon />} id="user-search" inputSize="medium" onChange={(e) => setSearchInput(e.target.value)} placeholder="搜索用户名或邮箱..." value={searchInput} />
                    <GhostButton asButton size="medium" variant="primary" onClick={handleSearchSubmit}>
                        搜索
                    </GhostButton>
                </form>
                <GhostButton asButton icon={<PlusIcon className={shared.btnIcon} />} onClick={openCreateForm} size="medium" variant="primary">
                    新建用户
                </GhostButton>
            </div>

            {/* 表格 */}
            <DataTable columns={columns} emptyText={loading ? '加载中...' : '暂无用户数据'} rowKey={(user) => user.id} rows={data.data} />

            <ConfirmDialog
                open={!!deleteTarget}
                title="确认删除"
                message={`确定要删除用户「${deleteTarget?.username ?? ''}」吗？此操作不可撤销。`}
                confirmLabel="删除"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting !== null}
            />

            {/* 新增/编辑弹窗 */}
            <Dialog onClose={() => setFormOpen(false)} open={formOpen} title={formMode === 'create' ? '新建用户' : `编辑用户：${editingUser?.username || ''}`}>
                <form className={shared.form} onSubmit={handleFormSubmit}>
                    <TextInput
                        id="form-username"
                        label="用户名"
                        maxLength={50}
                        onChange={(e) => handleFormChange('username', e.target.value)}
                        placeholder="2-50 个字符"
                        required
                        value={form.username}
                    />

                    <TextInput id="form-email" label="邮箱" onChange={(e) => handleFormChange('email', e.target.value)} placeholder="user@example.com" required type="email" value={form.email} />

                    <TextInput
                        id="form-password"
                        label={formMode === 'create' ? '密码' : '新密码（留空则不修改）'}
                        minLength={6}
                        onChange={(e) => handleFormChange('password', e.target.value)}
                        placeholder={formMode === 'create' ? '至少 6 个字符' : '留空不修改密码'}
                        required={formMode === 'create'}
                        type="password"
                        value={form.password}
                    />

                    {/* 角色 */}
                    <div className={styles.field}>
                        <span className={styles.fieldLabel}>角色</span>
                        <PillSelect
                            name="role"
                            onChange={(v) => handleFormChange('role', v)}
                            options={[
                                { value: 'user', label: '普通用户' },
                                { value: 'admin', label: '管理员' },
                            ]}
                            value={form.role}
                        />
                    </div>

                    {/* 状态（仅编辑模式） */}
                    {formMode === 'edit' && (
                        <div className={styles.field}>
                            <span className={styles.fieldLabel}>状态</span>
                            <PillSelect
                                name="status"
                                onChange={(v) => handleFormChange('status', v)}
                                options={[
                                    { value: 'active', label: '正常' },
                                    { value: 'disabled', label: '已禁用' },
                                ]}
                                value={form.status}
                            />
                        </div>
                    )}

                    <div className={shared.formActions}>
                        <GhostButton asButton onClick={() => setFormOpen(false)}>
                            取消
                        </GhostButton>
                        <SubmitButton size="medium" disabled={submitting}>
                            {submitting ? '保存中...' : formMode === 'create' ? '创建用户' : '保存修改'}
                        </SubmitButton>
                    </div>

                    {formMessage && (
                        <p className={shared.formMessage} role="alert">
                            {formMessage}
                        </p>
                    )}
                </form>
            </Dialog>

            {/* 分页 */}
            <Pagination
                current={page}
                onPageChange={setPage}
                total={totalPages}
                pageSize={pageSize}
                onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                }}
            />
        </div>
    );
}
