# 旧站 URL 重定向

## 功能说明

兼容旧站文章 URL，将旧路径 301 永久重定向到新站对应页面，避免 404 和 SEO 权重流失。

旧站 URL 格式为 `/{分类}/{文章标识}`（如 `/tech/ajwd123`），新站统一为 `/blog/{slug}`。

## 支持的映射类型

| 类型 | 示例 |
|------|------|
| 一对一 | `/tech/ajwd123` → `/blog/my-article` |
| 多对一 | `/note/old-1`、`/note/old-2` → `/blog/merged-article` |
| 映射到非文章页 | `/about` → `/` |

所有映射均为 301 永久重定向。

## 配置方式

映射关系集中在 `src/lib/legacy-redirects.ts`，增删改只需编辑此文件：

```ts
export const LEGACY_REDIRECTS: LegacyRedirect[] = [
    { source: '/tech/ajwd123', destination: '/blog/my-article' },
    { source: '/life/xyz456', destination: '/blog/another-post' },
    { source: '/about', destination: '/' },
];
```

编辑后重新部署即生效，无需数据库变更或前端 UI 操作。

## 工作原理

`next.config.ts` 的 `redirects()` 读取 `LEGACY_REDIRECTS` 数组，生成 Next.js 重定向规则：

```ts
async redirects() {
    return LEGACY_REDIRECTS.map(r => ({
        source: r.source,
        destination: r.destination,
        permanent: true,
    }));
}
```

重定向在 Next.js 边缘层处理，零运行时开销，不经过应用代码。

## 涉及文件

| 文件 | 说明 |
|------|------|
| `src/lib/legacy-redirects.ts` | 映射配置，`LegacyRedirect` 类型 + `LEGACY_REDIRECTS` 数组 |
| `next.config.ts` | `redirects()` 读取配置生成 301 规则 |
