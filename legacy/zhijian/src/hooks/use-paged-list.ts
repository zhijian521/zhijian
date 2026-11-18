/*============================================================================
  use-paged-list — 后台分页列表通用 Hook

  抽象后台列表页共用的状态机：initialData 首屏跳取、page/pageSize/keyword
  状态、requestId 递增竞态守卫、删除确认与删除后页码回退。
  页面间差异（查询参数、删除策略、提示文案、是否分页）通过配置注入，
  use-crud-list 之外的列表页（文章/用户/图片/站点）统一走此 Hook。
============================================================================*/

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/*== 数据与配置 ==*/
import { api } from '@/lib/core/http-client';
import type { ListData } from '@/lib/core/api-response';
import { getPageAfterDelete } from '@/lib/core/pagination';
import { toast } from '@/components/ui/toast';

/*== 类型定义 ==*/

/** 传给 buildQuery 的列表状态快照 */
export interface PagedListQuery {
    page: number;
    pageSize: number;
    keyword: string;
}

export interface UsePagedListMessages {
    /** 获取列表失败提示（code 非 0 时优先展示 res.message；网络异常时也用它兜底） */
    fetchError: string;
    /** code 非 0 时不弹 toast（仅网络异常时提示 fetchError） */
    silentFetchFailure?: boolean;
    /** 网络异常专用提示，缺省回退 fetchError */
    networkError?: string;
    /** 删除成功提示，缺省「删除成功」 */
    deleteSuccess?: string;
    /** 删除失败提示（code 非 0 时优先展示 res.message），缺省「删除失败。」 */
    deleteFailed?: string;
    /** 删除请求异常提示，缺省「删除请求失败。」 */
    deleteError?: string;
}

export interface UsePagedListOptions<T extends { id: number | string }> {
    /** 列表 API 端点，如 '/admin/posts' */
    endpoint: string;
    /** 服务端渲染提供的首屏数据，首屏不重复请求 */
    initialData: ListData<T>;
    initialPage?: number;
    initialPageSize?: number;
    initialKeyword?: string;
    /** false 时列表不分页：请求不带分页参数、删除后不做页码回退（如站点管理） */
    paginated?: boolean;
    /**
     * 由列表状态构造请求参数；缺省为 { page, pageSize, keyword? }。
     * 依赖额外状态（如 status 筛选）时必须用 useCallback 包裹并声明依赖，
     * 其变化会触发列表重新请求。
     */
    buildQuery?: (query: PagedListQuery) => Record<string, unknown>;
    /** local=本地移除条目；refetch=删除后重新请求当前页（如图片管理） */
    deleteMode?: 'local' | 'refetch';
    /** 自定义删除 URL，缺省 `${endpoint}/${id}` */
    deleteUrl?: (id: number | string) => string;
    messages: UsePagedListMessages;
    /** 网络异常时的额外回调（如 console.error 记录） */
    onFetchError?: (error: unknown) => void;
}

/**
 * 后台分页列表通用 hook。
 *
 * 内置：
 * - initialData 首屏跳取（skipInitialFetch）
 * - page / pageSize / keyword 状态（setKeyword、setPageSize 自动回第 1 页）
 * - requestId 递增竞态守卫，过期响应直接丢弃
 * - 删除确认状态与删除后页码回退（getPageAfterDelete）
 */
export function usePagedList<T extends { id: number | string }>(options: UsePagedListOptions<T>) {
    const {
        endpoint,
        initialData,
        initialPage = 1,
        initialPageSize = 10,
        initialKeyword = '',
        paginated = true,
        buildQuery,
        deleteMode = 'local',
        deleteUrl,
        messages,
        onFetchError,
    } = options;

    const [listData, setListData] = useState(initialData);
    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSizeState] = useState(initialPageSize);
    const [keyword, setKeywordState] = useState(initialKeyword);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState<number | string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

    const requestIdRef = useRef(0);
    const skipInitialFetchRef = useRef(true);
    /* 配置随渲染同步到 ref，避免闭包过期，同时保持 fetchData 引用稳定 */
    const configRef = useRef({ deleteMode, deleteUrl, messages, onFetchError });
    useEffect(() => {
        configRef.current = { deleteMode, deleteUrl, messages, onFetchError };
    });

    const defaultBuildQuery = useCallback(
        (query: PagedListQuery): Record<string, unknown> =>
            paginated ? { page: query.page, pageSize: query.pageSize, keyword: query.keyword || undefined } : {},
        [paginated]
    );
    const resolveQuery = buildQuery ?? defaultBuildQuery;

    /* 加载列表（自带竞态守卫：仅最后一次请求生效） */
    const fetchData = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        const { fetchError, silentFetchFailure, networkError } = configRef.current.messages;
        setLoading(true);
        try {
            const params = resolveQuery({ page, pageSize, keyword });
            const res = await api.get<ListData<T>>(
                endpoint,
                Object.keys(params).length > 0 ? params : undefined
            );
            if (requestId !== requestIdRef.current) return;
            if (res.code === 0 && res.data) {
                setListData(res.data);
            } else if (!silentFetchFailure) {
                toast.error(res.message || fetchError);
            }
        } catch (error) {
            if (requestId !== requestIdRef.current) return;
            configRef.current.onFetchError?.(error);
            toast.error(networkError ?? fetchError);
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [endpoint, page, pageSize, keyword, resolveQuery]);

    /* 首屏跳取：initialData 已覆盖首屏，之后状态变化才请求 */
    useEffect(() => {
        if (skipInitialFetchRef.current) {
            skipInitialFetchRef.current = false;
            return;
        }
        fetchData();
    }, [fetchData]);

    /* 修改每页条数，回第 1 页 */
    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setPage(1);
    }, []);

    /* 修改搜索关键词，回第 1 页（是否防抖由页面输入层决定） */
    const setKeyword = useCallback((value: string) => {
        setKeywordState(value);
        setPage(1);
    }, []);

    const totalPages = Math.max(1, Math.ceil(listData.total / pageSize));

    /* 删除确认：成功后按 deleteMode 本地移除或重新请求，并按需回退页码 */
    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        const { deleteMode: mode, deleteUrl: resolveDeleteUrl, messages: msg } = configRef.current;
        setDeleting(deleteTarget.id);
        try {
            const url = resolveDeleteUrl ? resolveDeleteUrl(deleteTarget.id) : `${endpoint}/${deleteTarget.id}`;
            const res = await api.delete(url);
            if (res.code === 0) {
                setDeleteTarget(null);
                toast.success(msg.deleteSuccess ?? '删除成功');
                const nextPage = paginated ? getPageAfterDelete(page, listData.data.length) : page;
                if (mode === 'local') {
                    setListData((prev) => ({
                        data: prev.data.filter((item) => item.id !== deleteTarget.id),
                        total: prev.total - 1,
                    }));
                    if (nextPage !== page) setPage(nextPage);
                } else if (nextPage !== page) {
                    setPage(nextPage);
                } else {
                    fetchData();
                }
            } else {
                toast.error(res.message || msg.deleteFailed || '删除失败。');
            }
        } catch {
            toast.error(msg.deleteError ?? '删除请求失败。');
        } finally {
            setDeleting(null);
        }
    }, [deleteTarget, endpoint, paginated, page, listData.data.length, fetchData]);

    return {
        data: listData.data,
        total: listData.total,
        loading,
        page,
        setPage,
        pageSize,
        setPageSize,
        keyword,
        setKeyword,
        totalPages,
        deleting,
        deleteTarget,
        setDeleteTarget,
        confirmDelete,
        refresh: fetchData,
    };
}
