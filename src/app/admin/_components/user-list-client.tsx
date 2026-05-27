'use client';

import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { APP_ROUTES } from '@/lib/site';
import { api } from '@/lib/http-client';

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

/*== 后台用户列表：搜索、分页、操作入口。 ==*/
export default function UserListClient() {
    const router = useRouter();
    const [data, setData] = useState<UserListData>({ users: [], total: 0 });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
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

    async function handleDelete(userId: number, username: string) {
        if (!confirm(`确定要删除用户「${username}」吗？此操作不可撤销。`)) return;

        setDeleting(userId);
        try {
            const res = await api.delete(`/admin/users/${userId}`);
            if (res.code === 0) {
                setData((prev) => ({
                    ...prev,
                    users: prev.users.filter((u) => u.id !== userId),
                    total: prev.total - 1,
                }));
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
            <div className="flex items-center justify-between mb-6">
                <form className="flex items-center gap-2" onSubmit={handleSearchSubmit}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-gray-400"
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="搜索用户名或邮箱..."
                            type="text"
                            value={search}
                        />
                    </div>
                    <button
                        className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        type="submit"
                    >
                        搜索
                    </button>
                </form>
                <Link
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                    href={APP_ROUTES.adminUserCreate}
                >
                    <Plus className="h-4 w-4" />
                    新建用户
                </Link>
            </div>

            {/* 表格 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">用户名</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">邮箱</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">角色</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">创建时间</th>
                            <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className="px-4 py-12 text-center text-gray-400" colSpan={6}>
                                    加载中...
                                </td>
                            </tr>
                        ) : data.users.length === 0 ? (
                            <tr>
                                <td className="px-4 py-12 text-center text-gray-400" colSpan={6}>
                                    暂无用户数据
                                </td>
                            </tr>
                        ) : (
                            data.users.map((user) => (
                                <tr className="border-b border-gray-100 hover:bg-gray-50" key={user.id}>
                                    <td className="px-4 py-3 font-medium">{user.username}</td>
                                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                        >
                                            {user.role === 'admin' ? '管理员' : '用户'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                                user.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {user.status === 'active' ? '正常' : '已禁用'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <button
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                onClick={() => router.push(`/admin/users/${user.id}`)}
                                                title="编辑"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                disabled={deleting === user.id}
                                                onClick={() => handleDelete(user.id, user.username)}
                                                title="删除"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <span>
                        共 {data.total} 个用户，第 {page}/{totalPages} 页
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            上一页
                        </button>
                        <button
                            className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
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
