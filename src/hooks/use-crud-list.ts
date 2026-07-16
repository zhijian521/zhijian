/*============================================================================
  use-crud-list — 通用 CRUD 列表 Hook

  供分类/标签等管理页面复用的增删查 Hook。
  入参 endpoint 和 labelName，返回数据/分页/删除状态。
============================================================================*/

'use client';

import { useEffect, useState, useCallback } from 'react';

/*== 数据与配置 ==*/
import { api } from '@/lib/core/http-client';
import type { ListData } from '@/lib/core/api-response';
import { toast } from '@/components/ui/toast';

/**
 * 通用 CRUD 列表 hook，供 Tag/Category 等管理页面复用。
 *
 * @param endpoint  API 端点，如 '/admin/tags'
 * @param labelName 单条目名称，用于 toast 提示，如 '标签'
 */
export function useCrudList<T extends { id: number; name: string }>(endpoint: string, labelName: string) {
    const [data, setData] = useState<ListData<T>>({ data: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<ListData<T>>(endpoint);
            if (res.code === 0 && res.data) {
                setData(res.data);
            }
        } catch {
            toast.error(`获取${labelName}列表失败`);
        } finally {
            setLoading(false);
        }
    }, [endpoint, labelName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function deleteById(id: number): Promise<boolean> {
        setDeleting(id);
        try {
            const res = await api.delete(`${endpoint}/${id}`);
            if (res.code === 0) {
                setData((prev) => ({
                    data: prev.data.filter((item) => item.id !== id),
                    total: prev.total - 1,
                }));
                toast.success('删除成功');
                return true;
            } else {
                toast.error(res.message || '删除失败。');
            }
        } catch {
            toast.error('删除请求失败。');
        } finally {
            setDeleting(null);
        }

        return false;
    }

    return {
        data,
        loading,
        deleting,
        deleteById,
        fetchData,
    };
}
