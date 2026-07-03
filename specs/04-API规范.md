# 04 · API 规范

## 统一响应结构

所有 API Route 返回的 JSON 都遵循 `src/lib/core/api-response.ts`：

```ts
成功: { code: 0, data: T, message: '操作成功' }
失败: { code: xxx, data: null, message: '错误说明' }
```

要求：

- HTTP 状态码保留语义。
- `body.code` 负责细分业务错误。
- 统一使用 `success(data)` / `fail(code, message)` 构造响应。

## 业务错误码

`BizCode` 按业务区段维护，新增错误码时：

- 不复用已有含义
- 同类错误放同一段
- 与 HTTP 语义对齐

## 鉴权方式

当前有两类鉴权包装器，加上一类公开接口：

1. `withAdmin`
2. `withUser`
3. 公开接口直接导出 `GET/POST/...`

示例：

```ts
export const GET = withAdmin(async (_request, admin) => {
    return NextResponse.json(success(await listPosts()));
});

export const PUT = withUser(async (_request, user) => {
    return NextResponse.json(success(await saveProfile(user.userId)));
});

export async function GET() {
    return NextResponse.json(success(await listPublishedPosts()));
}
```

约束：

- `withAdmin` 失败返回 403
- `withUser` 失败返回 401
- 不要在 route 里重复手写同样的鉴权模板

## Route 顶部注释

每个 `route.ts` 顶部写标准 JSDoc，供接口文档整理：

```ts
/**
 * @api 文章列表
 * @group posts
 * @auth none
 * @method GET 返回全部已发布文章
 * @method POST 创建草稿（需 admin）
 * @returns success<Post[]> | fail
 */
```

字段含义：

| 字段 | 含义 |
|---|---|
| `@api` | 接口中文名 |
| `@group` | 分组，如 `posts` / `nav` / `auth` / `admin` / `ai` / `collect` |
| `@auth` | `none` / `user` / `admin` |
| `@method` | 方法 + 说明，可多行 |
| `@returns` | 返回结构 |

## API_REGISTRY

接口索引放在 `src/docs/api/_registry.ts`，手写登记，不做自动反射。

```ts
export interface ApiEntry {
    path: string;
    name: string;
    group: string;
    auth: 'none' | 'user' | 'admin';
    methods: { method: string; desc: string }[];
}
```

手写 registry 的原因：

- 动态路由和条件导出不适合全自动扫描
- 接口说明本来就需要人工判断和组织
- 维护成本可控，且容易做校验

## 什么时候必须建立 API 文档

从 **第一个** `src/app/api/**/route.ts` 落地开始，必须同时满足：

1. 存在 `src/docs/api/_registry.ts`
2. 新接口已登记到 registry
3. route 顶部带标准注释

也就是说，允许“还没有任何 API Route 时暂时没有 API_REGISTRY”；但一旦开始写 API，就不能继续空着。

## 错误处理

- 业务校验失败：返回对应 `fail(BizCode.XXX, '中文说明')`
- 非预期异常：catch 后统一转成 500 + `BizCode.INTERNAL`
- 不把内部堆栈、数据库错误原文直接回给前端

## 入参与分页

- 入参校验发生在信任边界，也就是 route 入口
- domain 层做基础健壮性校验，不直接信任 route
- 列表接口统一使用 `ListData<T>`：`{ data: T[]; total: number }`
