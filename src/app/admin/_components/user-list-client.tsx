'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { APP_ROUTES } from '@/lib/site';
import { api } from '@/lib/http-client';
import styles from './user-list-client.module.css';

interface UserItem {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
    status: 'active' | 'disabled';
    created_at: string;
}

interface UserListData {
    users: UserItem[];
    total: number;
}

/*== 后台用户列表：匹配博客表格风格。 ==*/
export default function UserListClient() {
    const router = useRouter();
    const [data, setData] = useState<UserListData>({ users: [], total: 0 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; username: string } | null>(null);
    const pageSize = 20;

    const fetchUsers = useCallback(async (opts?: { page?: number; search?: string }) => {
        const p = opts?.page ?? page;
        const s = opts?.search ?? search;
        setLoading(true);
        try {
            const params: Record<string, unknown> = { page: p, pageSize };
            if (s.trim()) params.search = s.trim();
            const res = await api.get<UserListData>('/admin/users', params);
            if (res.code === 0) {
                setData(res.data!);
            }
        } catch (err) {
            console.error('获取用户列表失败：', err);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPage(1);
        fetchUsers({ page: 1 });
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
                    users: prev.users.filter((u) => u.id !== deleteTarget.id),
                    total: prev.total - 1,
                }));
                setDeleteTarget(null);
            } else {
                alert(res.message || '删除失败。');
            }
        } catch {
            alert('删除请求失败。');
        } finally {
            setDeleting(null);
        }
    }

    const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

    return (
        <div>
            {/* 顶部操作栏 */}
            <div className={styles.toolbar}>
                <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
                    <div className={styles.searchWrapper}>
                        <SearchIcon className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="搜索用户名或邮箱..."
                            type="text"
                            value={search}
                        />
                    </div>
                    <button className={styles.searchBtn} type="submit">
                        搜索
                    </button>
                </form>
                <Link className={styles.createLink} href={APP_ROUTES.adminUserCreate}>
                    <PlusIcon className={styles.iconSmall} />
                    新建用户
                </Link>
            </div>

            {/* 表格 */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.thead}>
                            <th className={styles.th}>用户名</th>
                            <th className={`${styles.th} ${styles.hideSm}`}>邮箱</th>
                            <th className={styles.th}>角色</th>
                            <th className={`${styles.th} ${styles.hideMd}`}>状态</th>
                            <th className={`${styles.th} ${styles.hideLg}`}>创建时间</th>
                            <th className={styles.thAction}>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className={styles.emptyRow} colSpan={6}>
                                    加载中...
                                </td>
                            </tr>
                        ) : data.users.length === 0 ? (
                            <tr>
                                <td className={styles.emptyRow} colSpan={6}>
                                    暂无用户数据
                                </td>
                            </tr>
                        ) : (
                            data.users.map((user) => (
                                <tr className={styles.row} key={user.id}>
                                    <td className={styles.tdName}>{user.username}</td>
                                    <td className={`${styles.td} ${styles.hideSm}`}>{user.email}</td>
                                    <td className={styles.td}>
                                        <span className={user.role === 'admin' ? styles.badgePrimary : styles.badgeMuted}>
                                            {user.role === 'admin' ? '管理员' : '用户'}
                                        </span>
                                    </td>
                                    <td className={`${styles.td} ${styles.hideMd}`}>
                                        <span className={user.status === 'active' ? styles.badgeMuted : styles.badgePrimary}>
                                            {user.status === 'active' ? '正常' : '已禁用'}
                                        </span>
                                    </td>
                                    <td className={`${styles.tdMuted} ${styles.hideLg}`}>
                                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                                    </td>
                                    <td className={styles.tdAction}>
                                        <div className={styles.actionGroup}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                                title="编辑"
                                            >
                                                <PencilIcon className={styles.iconSmall} />
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                disabled={deleting === user.id}
                                                onClick={() => handleDeleteClick(user.id, user.username)}
                                                title="删除"
                                            >
                                                <Trash2Icon className={styles.iconSmall} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                open={!!deleteTarget}
                title="确认删除"
                message={`确定要删除用户「${deleteTarget?.username ?? ''}」吗？此操作不可撤销。`}
                confirmLabel="删除"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting !== null}
            />

            {/* 分页 */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <span>
                        共 {data.total} 个用户，第 {page}/{totalPages} 页
                    </span>
                    <div className={styles.pageButtons}>
                        <button
                            className={styles.pageBtn}
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            上一页
                        </button>
                        <button
                            className={styles.pageBtn}
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            下一页
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}