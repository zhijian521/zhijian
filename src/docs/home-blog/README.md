# 博客前台

知简博客前台由三个页面组成：首页、文章列表页、文章详情页。

所有页面均为 Server Component，使用 `force-dynamic` 策略，每次请求直接读取 MySQL 最新数据，不经过 ISR 缓存。数据查询通过 React `cache()` 包裹，同一请求内 `generateMetadata` 与渲染函数共享结果，避免重复查库。

---

## 目录

- [首页](#首页)
- [文章列表页](#文章列表页)
- [文章详情页](#文章详情页)
- [共享组件](#共享组件)
- [数据层](#数据层)
- [SEO 与结构化数据](#seo-与结构化数据)
- [样式体系](#样式体系)

---

## 首页

**文件**：`src/app/page.tsx`  
**路由**：`/`  
**组件类型**：Server Component

### 页面结构

```
<main>
  ├── Hero 区 — 全屏山水背景 + 标题 + 副标题 + 简介 + 锚点按钮
  ├── 个人信息区 — 头像 + 姓名 + 定位语 + 简介 + GhostButton 按钮（联系我 · GitHub · RSS订阅）
  ├── 最新文章区 — 3 篇文章 PostCard 网格
  └── 开源项目区 — ProjectCard 网格（静态数据）
</main>
```

### 数据流

1. 调用 `getPublishedPosts({ limit: 3 })` 获取最新 3 篇已发布文章（SQL `LIMIT 3`，不拉全量）
2. 开源项目数据为组件内硬编码的 `PROJECTS` 常量

### 关键细节

| 项目 | 说明 |
|------|------|
| 渲染策略 | `export const dynamic = 'force-dynamic'`，禁用 ISR |
| 文章为空 | 显示「暂无文章，去后台写一篇吧。」 |
| Hero 背景 | `/images/home-hero-bg.png`，`object-fit: cover` |
| 头像 | `/images/logo.png`，7.5rem 方形带边框阴影 |
| PostCard 封面 | 有 `coverImage` 时渲染 `<ContentImage>`，无则纯文字卡片 |
| 联系方式 | GhostButton 组件（`size="small"`），统一按钮风格 |
| RSS 订阅 | `RssCopyButton` 客户端组件，点击复制 `/feed.xml` 地址，1.5s 反馈 |

---

## 文章列表页

**文件**：`src/app/blog/page.tsx`（服务端逻辑）  
**展示组件**：`src/app/blog/_components/blog-list-client.tsx`  
**路由**：`/blog`、`/blog?category=tech`、`/blog?tags=react,nextjs`、`/blog?category=tech&tags=react&page=2`  
**组件类型**：Server Component（page）+ Server Component（blog-list-client，纯展示）

### URL 参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `category` | `string` | 分类 slug，单选 | `?category=tech` |
| `tags` | `string` | 标签 slug，逗号分隔，多选 | `?tags=react,nextjs` |
| `page` | `number` | 页码，默认 1 | `?page=2` |

### 数据流

```
searchParams
  │
  ▼
resolveBlogFilters()          — 解析 category / page / tags 参数
  │
  ▼
resolveFilterState()          — 用数据库分类/标签校验 slug 有效性
  │
  ▼
getPublishedPosts({ categorySlug, tagSlugs })
  │                             — SQL 动态 WHERE 过滤
  ▼                             — enrichPostsWithTagNames() 批量补标签名
分页计算
  │  totalPages = ceil(总数 / 10)
  │  pagedPosts = slice((page-1)*10, page*10)
  ▼
buildFilterOptions()          — 生成分类/标签筛选链接
buildPaginationHrefs()        — 生成每页的 URL
  │
  ▼
<BlogListClient />            — 纯展示，接收预计算数据
```

### 页面布局

```
<main>
  ├── <header> — "文章" 标题
  └── <div layout> — 桌面端左右分栏，移动端上下反转
       ├── <section main> — 文章列表 + 分页
       │    ├── 文章卡片 × N
       │    │    ├── 标题 + 摘要 + 元数据行（分类 · 标签 · 日期）
       │    │    └── 可选封面图（180px 宽，16:9）
       │    └── <Pagination />（totalPages > 1 时显示）
       └── <aside sidebar> — 筛选区（桌面 240px 固定宽度）
            ├── 分类卡片 — 单选，点击切换分类
            └── 标签卡片 — 多选，点击切换（再次点击取消）
</main>
```

### 标签筛选交互

- 点击未选中的标签 → URL 添加该标签 slug
- 点击已选中的标签 → URL 移除该标签 slug
- 多标签以逗号分隔：`?tags=react,nextjs`

### 分页

- 每页 10 篇（`PAGE_SIZE = 10`）
- URL 通过 `?page=N` 控制
- 页码超出范围时自动修正为最后一页
- `generateMetadata` 输出 `alternates.prev` / `alternates.next`（即 `<link rel="prev/next">`）

### 筛选与 SEO

| 筛选状态 | `robots.index` | 原因 |
|----------|----------------|------|
| 无筛选（`/blog`） | `true` | 列表首页应被索引 |
| 有筛选（分类/标签/翻页） | `false` | 筛选页为辅助导航，不需索引 |

### 渲染策略

- `export const dynamic = 'force-dynamic'`，禁用 ISR
- 数据查询通过 React `cache()` 包裹（`cachedCategories` / `cachedTags` / `cachedPublishedPosts`），同一请求内 `generateMetadata` 与 `BlogListPage` 共享查询结果

---

## 文章详情页

**文件**：`src/app/blog/[slug]/page.tsx`  
**路由**：`/blog/:slug`  
**组件类型**：Server Component

### 数据流

```
params.slug
  │
  ▼
getPostBySlug(slug)           — 查询数据库，仅返回 published 文章
  │                             — enrichPostWithTagNames() 补标签名
  ▼
post 为空 → notFound()        — 返回 404
post 存在 → 渲染页面
```

### 页面布局

```
<main>
  └── <article>
       ├── <ArticleView />     — 文章头部 + 正文
       │    ├── 封面图（可选）
       │    ├── 标题
       │    ├── 摘要（斜体）
       │    ├── 元数据行（分类徽章 + 标签 + 日期）
       │    └── <MarkdownArticle /> — Markdown 渲染
       └── <footer>
            ├── 标签列表
            └── <ArticleFooterActions /> — 返回列表 / 返回主页 / 返回顶部
```

### 阅读时间估算

`estimateReadingMinutes(content)` —— 去除空白后按 450 字/分钟计算，最少 1 分钟。结果写入 JSON-LD 的 `timeRequired` 字段。

### ArticleFooterActions

Client Component，三个 `<IconButton>`：

| 按钮 | 行为 |
|------|------|
| 返回列表 | `<Link href="/blog">` |
| 返回主页 | `<Link href="/">` |
| 返回顶部 | `window.scrollTo({ top: 0, behavior: 'smooth' })` |

---

## 共享组件

### PostCard

**文件**：`src/components/site/post-card.tsx`

文章卡片，用于首页「最新文章」区域。

```typescript
interface PostCardProps {
    visual?: React.ReactNode;    // 封面图或渐变背景
    tag?: string;                // 分类名
    tagVariant?: 'default' | 'primary';
    date?: string;               // 格式化日期
    title: string;
    summary?: string;
    href: string;                // 链接地址
}
```

两种渲染模式：

| 模式 | 条件 | 布局 |
|------|------|------|
| 视觉卡片 | `visual` 存在 | 图片区 + 渐变叠层 + 内容区上移 -2rem 覆盖图片底部 |
| 纯文字卡片 | `visual` 不存在 | 纯文字内容 + 底部分割线 + 「阅读更多」链接 |

### ArticleView

**文件**：`src/components/site/article-view.tsx`

文章渲染视图，博客详情页与后台编辑器预览共用。

```typescript
interface ArticleViewProps {
    content: string;
    title?: string;
    summary?: string;
    coverImage?: string | null;
    altText?: string | null;
    categoryName?: string | null;
    tagNames?: { id: number; name: string; slug: string }[] | string[];
    publishedAt?: string | null;
}
```

- `tagNames` 兼容对象数组和字符串数组
- 无任何头部字段时，仅渲染正文（编辑器预览场景）

### MarkdownArticle

**文件**：`src/components/site/markdown-article.tsx`

Markdown 渲染器，`ArticleView` 内部使用。

```typescript
interface MarkdownArticleProps {
    content: string;
}
```

渲染管线：

```
Markdown 字符串
  → ReactMarkdown
  → remarkGfm（表格、任务列表、删除线）
  → rehypeHighlight（代码高亮）
  → CodeBlock（复制按钮）
```

### ContentImage

**文件**：`src/components/site/content-image.tsx`

自适应图片组件，根据来源选择渲染方式：

| 来源 | 渲染 | 原因 |
|------|------|------|
| 本地路径（`/uploads/...`） | Next.js `<Image>` | 自动优化、懒加载 |
| 远程 URL（`https://...`） | 原生 `<img>` | 无需配置 remotePatterns |

### CodeBlock

**文件**：`src/components/site/code-block.tsx`

代码块组件，Client Component（需要 `navigator.clipboard`）。

- 递归提取代码文本用于复制
- 点击复制按钮后显示 ✓ 图标 1.5 秒
- 保留 highlight.js 的语法高亮 class

---

## 数据层

### Post 类型

```typescript
type PostStatus = 'draft' | 'published';

interface Post {
    id: number;
    slug: string;
    title: string;
    summary: string;
    content: string;
    coverImage: string | null;
    altText: string | null;
    categoryId: number | null;
    tags: number[];          // 标签 ID 数组
    status: PostStatus;
    publishedAt: string | null;
    updatedAt: string | null;
    categoryName?: string;
    tagNames?: { id: number; name: string; slug: string }[];
}
```

### 公开查询函数

| 函数 | 文件 | 说明 |
|------|------|------|
| `getPublishedPosts(filter?)` | `src/lib/posts.ts` | 查询已发布文章，支持分类/标签筛选和数量限制 |
| `getPostBySlug(slug)` | `src/lib/posts.ts` | 按 slug 查询单篇已发布文章，不存在返回 `null` |
| `listCategories()` | `src/lib/categories.ts` | 查询全部分类，按 sort_order 排序 |
| `listTags()` | `src/lib/tags.ts` | 查询全部标签，按 id 排序 |

### 查询流程

1. **主查询**：`zhijian_blog_posts LEFT JOIN zhijian_blog_categories`，动态拼接 WHERE 条件
   - `status = 'published'` 必选
   - `categorySlug` → JOIN 分类表匹配
   - `tagSlugs` → `JSON_CONTAINS` 子查询匹配标签表
   - `limit` → SQL `LIMIT N`（首页传 3，列表页不传）
   - 排序：`published_at DESC, id DESC`（未发布的排最后）
2. **标签补全**：收集所有文章的 `tags` ID，批量查询 `zhijian_blog_tags`，Map 匹配后附加 `tagNames`
3. 容错：数据库不可用时 `listCategories()` / `listTags()` 返回空数组

### 涉及的数据库表

| 表 | 用途 |
|----|------|
| `zhijian_blog_posts` | 文章主表 |
| `zhijian_blog_categories` | 分类表（LEFT JOIN） |
| `zhijian_blog_tags` | 标签表（筛选子查询 + 批量名称补全） |

---

## SEO 与结构化数据

### 标题规则

| 页面 | `<title>` 格式 |
|------|----------------|
| 首页 | `Zhijian - 简静造物` |
| 列表页 | `文章列表 - [分类] - [标签] - Zhijian - 简静造物` |
| 详情页 | `文章标题 - Zhijian - 简静造物` |

列表页和详情页通过根布局 `title.template` 自动拼接品牌后缀：
```typescript
template: `%s - ${SITE_METADATA.brandTitle}`
```
`brandTitle` 当前值为 `'Zhijian - 简静造物'`，改此一处全站生效。

### 元数据

所有页面均输出完整的 `<meta description>`、OG、Twitter Card：

| 字段 | 首页 | 列表页 | 详情页 |
|------|------|--------|--------|
| `description` | `SITE_METADATA.description` | `SITE_METADATA.blogDescription` + 筛选上下文 | `post.summary` |
| `keywords` | `SITE_METADATA.keywords` | 筛选标签 + 分类 + 站点关键词 | 文章标签 + 分类 + 站点关键词 |
| `og.type` | `website` | `website` | `article` |
| `og.image` | 默认 OG 图 | 默认 OG 图 | 文章封面图（有则用） |
| `canonical` | 站点根 URL | 含筛选参数的完整 URL | `/blog/{slug}` |

详情页额外输出 `article:published_time`、`article:modified_time`、`article:section`（分类）、`article:tag`（标签）。

### JSON-LD 结构化数据

#### 首页

```
@graph: [
  WebSite     — 站点身份
  Person      — 作者
  CollectionPage — 首页
  ItemList    — 最新 3 篇文章（含 position / url / name / description）
]
```

#### 列表页

```
@graph: [
  CollectionPage — 列表页
  ItemList       — 当页文章列表
]
```

#### 详情页

```
@graph: [
  WebSite        — 站点身份
  Person         — 作者
  Organization   — 出版者（含 logo）
  BreadcrumbList — 首页 > 文章 > 文章标题
  BlogPosting    — 完整文章 schema
                   headline / description / image
                   datePublished / dateModified
                   author / publisher
                   articleSection / keywords
                   timeRequired / wordCount
                   inLanguage: zh-CN
]
```

### RSS Feed

| 项目 | 说明 |
|------|------|
| 路由 | `/feed.xml`（`src/app/feed.xml/route.ts`） |
| 格式 | RSS 2.0 + Atom namespace |
| 内容 | 全部已发布文章（title / link / guid / description / pubDate / category） |
| 自动发现 | 根布局 `alternates.types` 输出 `<link rel="alternate" type="application/rss+xml">` |
| 首页入口 | `RssCopyButton` 客户端组件，点击复制 feed 地址到剪贴板 |

---

## 样式体系

### 全局变量

所有样式通过 CSS 自定义属性（`theme.css`）控制，零 Tailwind：

| 变量 | 用途 |
|------|------|
| `--primary` | 朱砂红 `#9f000f`，标题、链接、强调 |
| `--foreground` | 主文字色 |
| `--muted-foreground` | 辅助文字色 |
| `--muted` / `--highlight` | 次级背景 / 高亮背景 |
| `--border` | 边框色 |
| `--radius` | 圆角（本项目为 `0`，零圆角风格） |
| `--font-serif` | 衬线字体，标题/引用使用 |

### 响应式断点

| 断点 | 适配 |
|------|------|
| `≤ 1024px` | 网格降为 2 列或单列，侧边栏宽度调整 |
| `≤ 768px` | Hero 区缩减间距，个人卡片竖排 |
| `≤ 640px` | 所有网格单列，侧边栏移至内容下方 |

### 文章正文排版

Markdown 渲染区域（`.body`）遵循「水墨宣纸 · 温润雅致」设计主题：

| 元素 | 样式特征 |
|------|----------|
| `h2` / `h3` | 衬线字体，4px 左侧朱砂边框 |
| `blockquote` | 2px 左侧朱砂边框，米色背景，斜体衬线 |
| `ul` | 无默认圆点，自定义 5px 朱砂方块伪元素 |
| `ol` | 计数器编号，朱砂色衬线数字 |
| `code`（行内） | 1px 边框，米色背景，等宽字体 0.875em |
| `a` | 朱砂色，底部 40% 透明度边线，hover 渐显 |
| `img` | 块级，最大宽度 100%，带边框 |
| `table` | 全宽，折叠边框，偶数行高亮背景 |
| `del` | 辅助文字色（GFM 删除线） |
| `input[checkbox]` | 朱砂色 accent（GFM 任务列表） |

### 关键文件速查

| 文件 | 说明 |
|------|------|
| `src/app/page.tsx` | 首页 |
| `src/app/page.module.css` | 首页样式 |
| `src/app/blog/page.tsx` | 列表页（服务端逻辑 + metadata） |
| `src/app/blog/_components/blog-list-client.tsx` | 列表页展示 |
| `src/app/blog/page.module.css` | 列表页样式 |
| `src/app/blog/[slug]/page.tsx` | 详情页 |
| `src/app/blog/[slug]/page.module.css` | 详情页样式 |
| `src/app/blog/[slug]/_components/article-footer-actions.tsx` | 详情页底部操作 |
| `src/components/site/post-card.tsx` | 文章卡片 |
| `src/components/site/article-view.tsx` | 文章视图（详情 + 编辑器预览共用） |
| `src/components/site/markdown-article.tsx` | Markdown 渲染器 |
| `src/components/site/code-block.tsx` | 代码块 + 复制按钮 |
| `src/components/site/content-image.tsx` | 自适应图片 |
| `src/lib/posts.ts` | 文章数据层 |
| `src/lib/post-shared.ts` | Post 类型 + 日期工具函数 |
| `src/lib/categories.ts` | 分类数据层 |
| `src/lib/tags.ts` | 标签数据层 |
| `src/lib/site.ts` | 站点元数据与路由配置 |
| `src/app/feed.xml/route.ts` | RSS 2.0 feed 生成 |
| `src/app/_components/rss-copy-button.tsx` | RSS 订阅按钮（复制 feed 地址） |
