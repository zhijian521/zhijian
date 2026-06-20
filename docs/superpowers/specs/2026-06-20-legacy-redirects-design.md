# 旧站 URL 重定向设计

## 背景

旧站文章 URL 格式为 `/{分类}/{文章标识}`（如 `/tech/ajwd123`），新站统一为 `/blog/{slug}`。需要兼容旧站 URL，301 永久重定向到新站对应页面，避免 404 和 SEO 权重流失。

## 需求

- 50+ 条映射，逐条配置（无通配符需求）
- 支持一对一、多对一
- 支持混合目标（部分到 `/blog/{slug}`，部分到其他页面如首页）
- 301 永久重定向（旧站永久迁移）
- 配置集中管理，增删改只需编辑一个文件

## 方案

新建 `src/lib/legacy-redirects.ts` 配置文件，`next.config.ts` 读取生成 redirects 数组。

### 配置文件

```ts
// src/lib/legacy-redirects.ts
export const LEGACY_REDIRECTS = [
  { source: '/tech/ajwd123', destination: '/blog/my-article' },
  { source: '/life/xyz456', destination: '/blog/another-post' },
  { source: '/note/old-1', destination: '/blog/merged-article' },
  { source: '/note/old-2', destination: '/blog/merged-article' },
  { source: '/about', destination: '/' },
] as const;
```

- 不声明 `permanent` 字段，统一在 `next.config.ts` 中设为 `true`
- 逐条映射，无需通配符

### next.config.ts 集成

```ts
import { LEGACY_REDIRECTS } from '@/lib/legacy-redirects';

const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_REDIRECTS.map(r => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));
  },
};
```

## 涉及文件

| 文件 | 操作 |
|------|------|
| `src/lib/legacy-redirects.ts` | 新建，存放映射配置 |
| `next.config.ts` | 修改，新增 `redirects()` |

无数据库变更，无前端 UI 变更。

## 验证

- `npx tsc --noEmit` 类型检查通过
- `npx next build` 构建通过
- 本地启动后访问旧 URL 验证 301 跳转
