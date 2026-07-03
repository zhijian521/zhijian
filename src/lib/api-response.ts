/*============================================================================
  统一 API 响应结构
  
  所有 API Route 返回的 JSON 都遵循此格式：
  
  成功：{ code: 0,   data: T,       message: "操作成功" }
  失败：{ code: xxx, data: null,    message: "错误描述" }
  
  HTTP 状态码保留语义（200/201/400/401/403/404/409/500），
  body.code 承载业务错误码以便前端精确处理。
============================================================================*/

/*== 业务错误码常量。 ==*/
export const BizCode = {
    SUCCESS: 0,
    /*-- 通用 --*/
    BAD_REQUEST: 40000,
    UNAUTHORIZED: 40100,
    FORBIDDEN: 40300,
    NOT_FOUND: 40400,
    CONFLICT: 40900,
    INTERNAL: 50000,
    /*-- 用户 --*/
    USER_NOT_FOUND: 40401,
    USER_DISABLED: 40301,
    USER_EXISTS: 40901,
    USER_SELF_DELETE: 40001,
    /*-- 分类 --*/
    CATEGORY_NOT_FOUND: 40402,
    CATEGORY_EXISTS: 40902,
    /*-- 标签 --*/
    TAG_NOT_FOUND: 40403,
    TAG_EXISTS: 40903,
    /*-- 上传 --*/
    UPLOAD_NOT_FOUND: 40404,
    UPLOAD_INVALID_FILE: 40002,
    UPLOAD_TOO_LARGE: 40003,
} as const;

export type BizCodeValue = (typeof BizCode)[keyof typeof BizCode];

/*== 分页列表响应的 data 结构。 ==*/
export interface ListData<T> {
    data: T[];
    total: number;
}

/*== 统一响应类型。 ==*/
export interface ApiResponse<T = unknown> {
    code: BizCodeValue;
    data: T;
    message: string;
}

/*== 构建成功响应。 ==*/
export function success<T>(data: T, message = '操作成功'): ApiResponse<T> {
    return { code: BizCode.SUCCESS, data, message };
}

/*== 构建失败响应（code 非 0）。 ==*/
export function fail(code: BizCodeValue, message: string): ApiResponse<null> {
    return { code, data: null, message };
}
