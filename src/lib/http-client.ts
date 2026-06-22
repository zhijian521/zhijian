/*============================================================================
  HTTP 客户端封装（基于原生 fetch）

  所有前端 API 调用统一入口。

  特性：
  - 自动解析 JSON，返回类型安全的 ApiResponse<T>
  - HTTP 4xx/5xx 不抛异常，返回服务端的 { code, data, message }
  - 仅网络断连 / 超时等真异常才 throw
  - 泛型方法：api.get<T>(url) / api.post<T>(url, body) 等

  用法：
    import { api } from '@/lib/http-client';
    const res = await api.post<{ user: User }>('/auth/login', { username, password });
    if (res.code === 0) { ...res.data.user }
    else { showError(res.message) }

  ponytail: 原生 fetch 替代 axios — 无拦截器/retry/取消需求，axios 多余。
============================================================================*/

import type { ApiResponse } from '@/lib/api-response';
import { BizCode, fail } from '@/lib/api-response';

const BASE_URL = '/api';
const TIMEOUT_MS = 15000;

/*== 从 Response 提取标准 ApiResponse ==*/
async function extractApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let body: any;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    // 服务端返回了标准格式
    if (body && typeof body.code === 'number' && typeof body.message === 'string') {
        return body as ApiResponse<T>;
    }

    // 兜底：非标准格式
    if (response.ok) {
        return { code: BizCode.SUCCESS, data: body as T, message: 'OK' } as ApiResponse<T>;
    }

    return fail(
        response.status === 401 ? BizCode.UNAUTHORIZED :
        response.status === 403 ? BizCode.FORBIDDEN :
        response.status === 404 ? BizCode.NOT_FOUND :
        response.status === 409 ? BizCode.CONFLICT :
        BizCode.INTERNAL,
        body?.message || `请求失败 (${response.status})`,
    ) as ApiResponse<T>;
}

/*== 带超时的 fetch 封装 ==*/
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

/*== 公开 API 方法 ==*/
export const api = {
    async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
        try {
            const qs = params ? '?' + new URLSearchParams(
                Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
            ).toString() : '';
            const res = await fetchWithTimeout(`${BASE_URL}${url}${qs}`, { method: 'GET' });
            return extractApiResponse<T>(res);
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },

    async post<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            const res = await fetchWithTimeout(`${BASE_URL}${url}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body !== undefined ? JSON.stringify(body) : undefined,
            });
            return extractApiResponse<T>(res);
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },

    async put<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            const res = await fetchWithTimeout(`${BASE_URL}${url}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: body !== undefined ? JSON.stringify(body) : undefined,
            });
            return extractApiResponse<T>(res);
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },

    async patch<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            const res = await fetchWithTimeout(`${BASE_URL}${url}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: body !== undefined ? JSON.stringify(body) : undefined,
            });
            return extractApiResponse<T>(res);
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },

    async delete<T = unknown>(url: string): Promise<ApiResponse<T>> {
        try {
            const res = await fetchWithTimeout(`${BASE_URL}${url}`, { method: 'DELETE' });
            return extractApiResponse<T>(res);
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },
};
