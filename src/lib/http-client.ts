/*============================================================================
  HTTP 客户端封装（基于 axios）

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
============================================================================*/

import axios from 'axios';
import type { AxiosInstance } from 'axios';

import type { ApiResponse } from '@/lib/api-response';
import { BizCode, fail } from '@/lib/api-response';

/*== axios 实例 —— 同源 API，401/403/404/409/500 不抛异常，由调用方判断 code。 ==*/
const instance: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true, // 所有 HTTP 状态码都视为成功，不抛异常
});

/*== 从 axios response 提取标准 ApiResponse。 ==*/
function extractApiResponse<T>(axiosResponse: any): ApiResponse<T> {
    const body = axiosResponse.data;
    // 服务端返回了标准格式
    if (body && typeof body.code === 'number' && typeof body.message === 'string') {
        return body as ApiResponse<T>;
    }
    // 兜底：非标准格式
    if (axiosResponse.status >= 200 && axiosResponse.status < 300) {
        return { code: BizCode.SUCCESS, data: body as T, message: 'OK' } as ApiResponse<T>;
    }
    return fail(
        axiosResponse.status === 401 ? BizCode.UNAUTHORIZED :
        axiosResponse.status === 403 ? BizCode.FORBIDDEN :
        axiosResponse.status === 404 ? BizCode.NOT_FOUND :
        axiosResponse.status === 409 ? BizCode.CONFLICT :
        BizCode.INTERNAL,
        body?.message || `请求失败 (${axiosResponse.status})`,
    ) as ApiResponse<T>;
}

/*== 公开 API 方法。 ==*/
export const api = {
    async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
        try {
            return extractApiResponse<T>(await instance.get(url, { params }));
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },

    async post<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            return extractApiResponse<T>(await instance.post(url, body));
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },

    async put<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            return extractApiResponse<T>(await instance.put(url, body));
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },

    async patch<T = unknown>(url: string, body?: unknown): Promise<ApiResponse<T>> {
        try {
            return extractApiResponse<T>(await instance.patch(url, body));
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },

    async delete<T = unknown>(url: string): Promise<ApiResponse<T>> {
        try {
            return extractApiResponse<T>(await instance.delete(url));
        } catch {
            return fail(BizCode.INTERNAL, '网络错误，请检查连接后重试。') as ApiResponse<T>;
        }
    },
};
