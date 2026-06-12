# 博客 SEO 优化设计规格

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。

**目标：** 为博客前台（首页、列表页、详情页）补充完整的 SEO 优化，包括 metadata、sitemap、robots、JSON-LD、分页 URL 参数化。

**架构：** 利用 Next.js 15 内置 Metadata API（`generateMetadata`、`sitemap.ts`、`robots.ts`），配合集中站点配置，零运行时成本零额外依赖。JSON-LD 通过 `<script>` 标签内联 SSR 输出。分页改为 URL searchParams 驱动。

**技术栈：** Next.js Metadata API + CSS Modules（无新依赖）

---

## 1. 站点配置层

**改动文件：** `src/lib/site.ts`

在 `SITE_METADATA` 中新增字段：

```ts
export const SITE_METADATA = {
    name: 'Zhijian',
    adminName: 'Zhijian Admin',
    title: '知简',                                           // 改为中文
    description: '知简 — 一个简洁的个人博客网站。',             // 改为中文
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',  // 复用已有环境变量
    locale: 'zh_CN',
    ogImage: '/images/og-default.png',                       // 默认 OG 分享图
} as const;
```

**要点：**
- `siteUrl` 复用 `NEXT_PUBLIC_SITE_URL`，其他开发者克隆后改 `.env.local` 即可切换域名
- `ogImage` 为默认社交分享图，封面图为空时 fallback 用此

---

## 2. 根布局 metadata 重构

**改动文件：** `src/app/layout.tsx`

当前只有 `title` + `icons`，重构为完整 metadata：

```ts
export const metadata: Metadata = {
    metadataBase: new URL(SITE_METADATA.siteUrl),
    title: {
        default: SITE_METADATA.title,
        template: `%s | ${SITE_METADATA.title}`,
    },
    description: SITE_METADATA.description,
    icons: { icon: '/images/logo.png' },
    openGraph: {
        type: 'website',
        locale: SITE_METADATA.locale,
        siteName: SITE_METADATA.title,
    },
    twitter: {
        card: 'summary_large_image',
    },
    alternates: {
        canonical: SITE_METADATA.siteUrl,
    },
    robots: {
        index: true,
        follow: true,
    },
};
```

**要点：**
- `metadataBase` 让所有相对 URL 自动解析为绝对 URL
- `template` 让子页面只需 `title: 'xxx'`，自动输出 `xxx | 知简`
- `openGraph` 只设默认值，具体 title/description/images 由子页面覆盖
- `twitter.card: 'summary_large_image'` 有封面图时展示大图卡片

---

## 3. 三个页面的 metadata

### 3a. 首页 `src/app/page.tsx`

```ts
export const metadata: Metadata = {
    title: '首页',
    description: SITE_METADATA.description,
    alternates: { canonical: '/' },
    openGraph: {
        title: SITE_METADATA.title,
        description: SITE_METADATA.description,
        url: '/',
    },
};
```

### 3b. 列表页 `src/app/blog/page.tsx`

改为 `generateMetadata` 读取 searchParams，支持分页标题：

```ts
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const pageNum = Number(page) || 1;
    const titleSuffix = pageNum > 1 ? ` (第${pageNum}页)` : '';
    const description = '浏览知简的所有博客文章，涵盖技术、思考与生活。';

    return {
        title: `文章${titleSuffix}`,
        description,
        alternates: { canonical: pageNum > 1 ? `/blog?page=${pageNum}` : '/blog' },
        openGraph: {
            title: `文章${titleSuffix}`,
            description,
            url: pageNum > 1 ? `/blog?page=${pageNum}` : '/blog',
        },
    };
}
```

### 3c. 详情页 `src/app/blog/[slug]/page.tsx`

新增 `generateMetadata`，从数据库取文章数据：

```ts
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: '页面未找到' };

    const title = post.title;
    const description = post.summary || `${post.title} — 知简`;
    const ogImage = post.coverImage || undefined;

    return {
        title,
        description,
        alternates: { canonical: `/blog/${slug}` },
        openGraph: {
            type: 'article',
            title,
            description,
            url: `/blog/${slug}`,
            publishedTime: post.publishedAt || undefined,
            authors: [SITE_METADATA.title],
            tags: post.tagNames?.map(t => t.name),
            ...(ogImage && { images: [{ url: ogImage, alt: post.altText || title }] }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(ogImage && { images: [{ url: ogImage, alt: post.altText || title }] }),
        },
    };
}
```

**要点：**
- 详情页每篇文章有独立 title/description/OG/canonical
- `openGraph.type: 'article'` 配合 `publishedTime`、`authors`、`tags`
- 封面图存在时输出 `og:image`，不存在时 fallback 到根布局默认
- canonical 用相对路径，`metadataBase` 自动补全为绝对 URL

---

## 4. sitemap.ts + robots.ts

### 4a. `src/app/sitemap.ts`（新建）

```ts
import { SITE_METADATA } from '@/lib/site';
import { getPublishedPosts } from '@/lib/posts';

export default async function sitemap() {
    const posts = await getPublishedPosts();

    const blogPosts = posts.map((post) => ({
        url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: SITE_METADATA.siteUrl,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${SITE_METADATA.siteUrl}/blog`,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...blogPosts,
    ];
}
```

### 4b. `src/app/robots.ts`（新建）

```ts
import { SITE_METADATA } from '@/lib/site';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${SITE_METADATA.siteUrl}/sitemap.xml`,
    };
}
```

**要点：**
- sitemap 动态生成，ISR 缓存自动生效
- robots 禁止爬取 `/admin/` 和 `/api/`
- Next.js 自动在 `/sitemap.xml` 和 `/robots.txt` 路由输出

---

## 5. 结构化数据 JSON-LD

### 5a. 文章详情页 — Article Schema

在 `src/app/blog/[slug]/page.tsx` 的页面组件渲染中内联：

```tsx
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || undefined,
    author: {
        '@type': 'Person',
        name: SITE_METADATA.title,
    },
    publisher: {
        '@type': 'Organization',
        name: SITE_METADATA.title,
    },
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
    },
};

return (
    <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* 原有页面内容 */}
    </>
);
```

### 5b. 博客列表页 — Blog Schema

在 `src/app/blog/page.tsx` 的页面组件渲染中内联：

```tsx
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_METADATA.title} 文章`,
    description: '浏览知简的所有博客文章。',
    url: `${SITE_METADATA.siteUrl}/blog`,
    publisher: {
        '@type': 'Organization',
        name: SITE_METADATA.title,
    },
};

return (
    <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* 原有页面内容 */}
    </>
);
```

**要点：**
- JSON-LD SSR 直接输出到 HTML，爬虫无需执行 JS
- `undefined` 值被 `JSON.stringify` 自动跳过
- 不新建额外组件，直接在页面组件中输出

---

## 6. 分页 URL 参数化

**改动文件：** `src/app/blog/page.tsx` + `src/app/blog/_components/blog-list-client.tsx`

### 6a. 页面组件传递 searchParams

`blog/page.tsx` 将 searchParams 传给客户端组件：

```tsx
export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const pageNum = Number(page) || 1;
    // ... 获取数据
    return <BlogListClient page={pageNum} /* ... */ />;
}
```

### 6b. 客户端组件改为 URL 参数驱动

```tsx
// blog-list-client.tsx 核心改动
const searchParams = useSearchParams();
const page = Number(searchParams.get('page')) || 1;
const router = useRouter();

function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
        params.set('page', String(newPage));
    } else {
        params.delete('page');
    }
    router.push(`/blog?${params.toString()}`);
}
```

### 6c. prev/next link 标签

在列表页组件中输出分页 hint：

```tsx
{pageNum > 1 && <link rel="prev" href={`/blog${pageNum > 2 ? `?page=${pageNum - 1}` : ''}`} />}
{hasNextPage && <link rel="next" href={`/blog?page=${pageNum + 1}`} />}
```

**要点：**
- 第 1 页不带 `?page` 参数，canonical 指向 `/blog`
- 第 2 页起 `?page=2`，canonical 指向 `/blog?page=2`
- `useSearchParams` 需要 `Suspense` 包裹（Next.js 要求），博客列表页已有客户端组件边界

---

## 影响范围

| 文件 | 操作 |
|------|------|
| `src/lib/site.ts` | 修改：新增 siteUrl/locale/ogImage，改中文描述 |
| `src/app/layout.tsx` | 修改：重构 metadata |
| `src/app/page.tsx` | 修改：补全 metadata |
| `src/app/blog/page.tsx` | 修改：generateMetadata + JSON-LD + searchParams 传递 |
| `src/app/blog/[slug]/page.tsx` | 修改：新增 generateMetadata + JSON-LD |
| `src/app/blog/_components/blog-list-client.tsx` | 修改：分页改为 URL 参数驱动 + prev/next link |
| `src/app/sitemap.ts` | 新建 |
| `src/app/robots.ts` | 新建 |

**不涉及的文件：** 后台管理页面、API 路由、其他组件
