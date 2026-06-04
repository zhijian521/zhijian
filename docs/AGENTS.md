# AGENTS.md

> 本文档为 AI 助手（Claude、Cursor、Copilot 等）提供项目上下文，帮助快速理解代码库并遵循项目约定。

---

## 项目概述

**知简** —— 个人博客网站，包含公开博客和管理后台两部分。

- **技术栈**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + MySQL
- **架构**: 单体全栈应用，App Router 模式，前后端代码在同一仓库
- **视觉风格**: 前台（公开博客）与后台（管理面板）风格故意分离

---

## 技术栈详情

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 15.3.2 |
| 运行时 | React | 19.1.0 |
| 语言 | TypeScript (strict) | 5.8.3 |
| 样式 | Tailwind CSS | v4 (CSS-based config) |
| 数据库 | MySQL (mysql2/promise) | 3.15.3 |
| 密码 | bcryptjs | 3.0.3 |
| HTTP | axios | 1.16.1 |
| 图标 | lucide-react | 1.16.0 |
| UI 组件 | shadcn/ui (new-york style) | - |

**路径别名**: `@/*` → `./src/*`

---

## 目录结构

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # 后台管理 (/admin/*)
│   │   ├── _components/          # 后台私有组件
│   │   │   ├── admin-shell.tsx   # 后台布局壳（侧边栏+内容区）
│   │   │   ├── admin-sidebar.tsx # 侧边栏导航
│   │   │   ├── post-editor-form.tsx    # 文章编辑表单
│   │   │   ├── post-management-client.tsx # 文章列表（客户端）
│   │   │   ├── user-form.tsx     # 用户编辑表单
│   │   │   └── user-list-client.tsx    # 用户列表（客户端）
│   │   ├── layout.tsx            # 后台布局（鉴权+AdminShell）
│   │   ├── login/                # 后台登录页
│   │   ├── posts/                # 文章管理 CRUD
│   │   ├── users/                # 用户管理 CRUD
│   │   └── settings/             # 设置页
│   ├── api/                      # API 路由
│   │   ├── admin/                # 后台 API（需鉴权）
│   │   │   ├── posts/            # 文章 CRUD
│   │   │   └── users/            # 用户 CRUD
│   │   ├── auth/                 # 认证 API
│   │   │   ├── login/            # 登录
│   │   │   ├── logout/           # 登出
│   │   │   ├── me/               # 当前用户
│   │   │   └── register/         # 注册
│   │   └── posts/                # 公开文章列表
│   ├── blog/                     # 公开博客 (/blog/*)
│   │   ├── [slug]/               # 文章详情页
│   │   ├── _components/          # 博客私有组件
│   │   └── page.tsx              # 博客列表页
│   ├── forbidden/                # 403 页面
│   ├── login/                    # 前台登录
│   ├── register/                 # 前台注册
│   ├── globals.css               # 全局样式 + CSS 变量
│   └── layout.tsx                # 根布局
├── components/
│   ├── site/                     # 公开站点共享组件
│   │   ├── app-frame.tsx         # 应用框架（路由分发）
│   │   └── public-chrome.tsx     # 公开站点壳（头部+底部）
│   └── ui/                       # shadcn/ui 组件
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── lib/                          # 核心业务逻辑
│   ├── api-response.ts           # API 响应格式
│   ├── auth.ts                   # 认证系统
│   ├── db.ts                     # 数据库连接池
│   ├── http-client.ts            # axios 封装
│   ├── post-shared.ts            # 文章共享类型/工具
│   ├── posts.ts                  # 文章数据层
│   ├── site.ts                   # 路由/导航配置
│   └── utils.ts                  # 工具函数 (cn)
└── middleware.ts                 # 中间件（注入路径头）

sql/
├── init.sql                      # 数据库初始化脚本
└── seed-admin.mjs                # 管理员种子数据
```

---

## 核心约定

### 1. 页面组件模式：Server + Client

**模式**: 服务端组件负责数据获取，客户端组件负责交互。

```
page.tsx (Server Component)
    ↓ 获取数据、鉴权
    ↓ 传递 props
client-component.tsx (Client Component)
    ↓ 处理交互（搜索、筛选、表单）
```

**示例**:
```tsx
// page.tsx (Server)
import { PostManagementClient } from './_components/post-management-client'

export default async function PostsPage() {
  const posts = await getAllPosts()  // 服务端获取数据
  return <PostManagementClient initialPosts={posts} />
}

// post-management-client.tsx (Client)
'use client'

export function PostManagementClient({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts)
  // ... 交互逻辑
}
```

**命名约定**:
- 客户端交互组件: `*-client.tsx` (如 `post-management-client.tsx`)
- 表单组件: `*-form.tsx` (如 `post-editor-form.tsx`)
- 布局壳组件: `*-shell.tsx` (如 `admin-shell.tsx`)

### 2. API 路由模式

所有 API 遵循统一流程：

```typescript
// 1. 鉴权（admin 路由）
const session = await requireAdminFromRequest(request)
if (!session) {
  return NextResponse.json(fail(BizCode.UNAUTHORIZED, '未授权'), { status: 401 })
}

// 2. 解析请求体
const body = await request.json()

// 3. 字段校验
if (!body.title) {
  return NextResponse.json(fail(BizCode.BAD_REQUEST, '标题不能为空'), { status: 400 })
}

// 4. 执行数据库操作
const result = await createPost(body)

// 5. 返回标准响应
return NextResponse.json(success(result, '创建成功'))
```

**动态路由参数** (Next.js 15):
```typescript
// [id]/route.ts
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params  // 注意：params 是 Promise
  // ...
}
```

### 3. API 响应格式

**标准响应结构**:
```typescript
interface ApiResponse<T> {
  code: number      // 0 = 成功，非 0 = 错误
  data: T | null    // 成功时为数据，失败时为 null
  message: string   // 人类可读消息
}
```

**使用方式**:
```typescript
// 成功
return NextResponse.json(success(data, '操作成功'))
// { code: 0, data: {...}, message: "操作成功" }

// 失败
return NextResponse.json(fail(BizCode.NOT_FOUND, '文章不存在'), { status: 404 })
// { code: 40400, data: null, message: "文章不存在" }
```

**业务错误码** (`src/lib/api-response.ts`):
| 常量 | 值 | 含义 |
|------|-----|------|
| `SUCCESS` | 0 | 成功 |
| `BAD_REQUEST` | 40000 | 请求错误 |
| `UNAUTHORIZED` | 40100 | 未认证 |
| `FORBIDDEN` | 40300 | 无权限 |
| `NOT_FOUND` | 40400 | 资源不存在 |
| `CONFLICT` | 40900 | 冲突（如重复） |
| `INTERNAL` | 50000 | 服务器错误 |

### 4. 认证系统

**Session 机制**: 自定义 HMAC-SHA256 签名 Token（非 JWT）

```
Token 格式: userId:username:role:expiresAt.signature
Cookie: zhijian_session (max-age: 7天)
签名密钥: ADMIN_SESSION_SECRET (环境变量)
```

**服务端组件鉴权**:
```typescript
import { requireAuth, requireAdmin } from '@/lib/auth'

// 需要登录
const user = await requireAuth()

// 需要管理员
const admin = await requireAdmin()  // 失败自动重定向到 /admin/login 或 /forbidden
```

**API 路由鉴权**:
```typescript
import { requireAdminFromRequest, getSessionFromRequest } from '@/lib/auth'

// 需要管理员（返回 null 表示未授权）
const session = await requireAdminFromRequest(request)

// 仅获取当前会话（不强制）
const session = await getSessionFromRequest(request)
```

**用户角色**: `admin` | `user`
**用户状态**: `active` | `disabled`

### 5. 数据库访问

**连接池** (`src/lib/db.ts`):
```typescript
import { getDb } from '@/lib/db'

const db = getDb()
if (!db) {
  throw new Error('数据库未配置')  // 或返回空数据
}

const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM posts WHERE id = ?', [id])
```

**重要约定**:
- 所有查询使用参数化（防 SQL 注入）
- 无 ORM，直接使用 `mysql2` 的 `execute()` / `query()`
- 数据库未配置时，部分模块返回硬编码的 `FALLBACK_POSTS` 作为兜底数据
- 连接池限制: `connectionLimit: 3`

### 6. HTTP 客户端

**使用方式** (`src/lib/http-client.ts`):
```typescript
import { api } from '@/lib/http-client'

// GET
const res = await api.get<Post[]>('/admin/posts')

// POST
const res = await api.post<{ id: number }>('/admin/posts', { title: '标题' })

// PATCH
const res = await api.patch<Post>('/admin/posts/123', { status: 'published' })

// DELETE
const res = await api.delete('/admin/users/456')

// 统一处理响应
if (res.code === 0) {
  console.log(res.data)   // 成功数据
} else {
  console.log(res.message) // 错误消息
}
```

**特点**:
- `baseURL: '/api'`，调用时无需写 `/api` 前缀
- `timeout: 15000` (15秒)
- 不在 HTTP 状态码层面抛错，所有错误通过 `res.code` 判断
- 网络错误返回 `{ code: 50000, message: '网络错误' }`

---

## 前台与后台分离

### 路由分离

| 区域 | 路由前缀 | 布局 |
|------|----------|------|
| 公开博客 | `/`, `/blog`, `/login`, `/register` | `PublicChrome` (头部+底部) |
| 管理后台 | `/admin/*` | `AdminShell` (侧边栏+内容区) |
| 后台登录 | `/admin/login` | 无壳（独立页面） |

### 布局分发机制

```
RootLayout
    └── AppFrame (src/components/site/app-frame.tsx)
            ├── pathname.startsWith('/admin/login') → body[data-app='admin-login']
            ├── pathname.startsWith('/admin')       → body[data-app='admin'] + AdminShell
            └── 其他                                 → body[data-app='public'] + PublicChrome
```

### CSS 主题切换

`globals.css` 通过 `body[data-app]` 属性切换主题：

```css
/* 公开站点（默认） */
:root {
  --primary: #9f000f;
  --background: #f9f5f0;
  --foreground: #281715;
}

/* 后台管理 */
body[data-app='admin'] {
  --primary: #9e0027;
  --background: #f8f4f0;
}

/* 后台登录 */
body[data-app='admin-login'] {
  --primary: #9e0027;
}
```

---

## 样式约定

### 双轨样式系统

| 场景 | 方式 | 示例 |
|------|------|------|
| 公开站点 | CSS Modules | `styles.hero`, `styles.blogItem` |
| 后台管理 | Tailwind 内联 | `className='space-y-4 p-6'` |
| 全局 | CSS 变量 + Tailwind v4 | `var(--primary)`, `text-[var(--foreground)]` |

### Tailwind v4 配置

**无 `tailwind.config.ts`**，配置在 `globals.css`:

```css
@import 'tailwindcss';

@theme inline {
  --color-primary: #9f000f;
  --color-background: #f9f5f0;
  --font-sans: "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-serif: "Noto Serif SC", "Songti SC", serif;
}
```

### 常用 CSS 变量

| 变量 | 用途 | 值 |
|------|------|-----|
| `--primary` | 主色（强调） | `#9f000f` (深红) |
| `--background` | 背景色 | `#f9f5f0` (米白) |
| `--foreground` | 前景色（正文） | `#281715` (墨色) |
| `--muted` | 次要背景 | `#f6efe7` |
| `--muted-foreground` | 次要文字 | `#6f655c` |
| `--border` | 边框色 | `#e7ddd1` |
| `--font-sans` | 无衬线字体 | 系统字体 + CJK |
| `--font-serif` | 衬线字体 | Noto Serif SC |

### 后台通用样式类

`globals.css` 提供的后台工具类：

| 类名 | 用途 |
|------|------|
| `.admin-panel` | 后台面板容器 |
| `.admin-panel-muted` | 次要面板 |
| `.admin-kicker` | 小标题/标签 |
| `.admin-title` | 大标题 |
| `.admin-copy` | 正文文本 |
| `.admin-input` | 输入框统一样式 |
| `.admin-stitch-card` | 卡片样式 |
| `.admin-stitch-number` | 数字统计 |

---

## 数据库 Schema

### posts 表

```sql
id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
slug         VARCHAR(120) NOT NULL UNIQUE      -- URL 别名
title        VARCHAR(200) NOT NULL             -- 标题
summary      VARCHAR(500) NOT NULL             -- 摘要
content      MEDIUMTEXT NOT NULL               -- 正文（Markdown）
status       ENUM('draft', 'published')        -- 状态
published_at DATETIME NULL                     -- 发布时间
created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

INDEX idx_posts_status_published_at (status, published_at)
```

### users 表

```sql
id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
username      VARCHAR(50) NOT NULL UNIQUE
email         VARCHAR(255) NOT NULL UNIQUE
password_hash VARCHAR(255) NOT NULL
role          ENUM('admin', 'user') DEFAULT 'user'
status        ENUM('active', 'disabled') DEFAULT 'active'
created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

INDEX idx_users_role (role)
INDEX idx_users_status (status)
```

---

## 环境变量

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=mysql://user:password@host:3306/database
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=your-random-secret-string
```

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 站点 URL（公开） |
| `DATABASE_URL` | MySQL 连接字符串 |
| `ADMIN_USERNAME` | 初始管理员用户名 |
| `ADMIN_PASSWORD` | 初始管理员密码 |
| `ADMIN_SESSION_SECRET` | Session 签名密钥 |

---

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器 (localhost:3000)

# 构建
npm run build        # 生产构建
npm run start        # 启动生产服务器

# 代码检查
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript 类型检查

# 数据库
node sql/seed-admin.mjs  # 初始化管理员账户
```

---

## Git 提交约定

项目使用宽松的 Conventional Commits 风格：

```
feat(scope): 中文描述
fix: 中文描述
refactor: 中文描述
```

**常用 scope**: `admin`, `app`, `blog`, `home`, `web`

**示例**:
```
feat(admin): 后台管理风格优化
feat(app): 新增用户管理
fix: 页面流畅优化
refactor: 注释&代码格式
```

---

## 关键文件速查

| 用途 | 文件 |
|------|------|
| 路由/导航配置 | `src/lib/site.ts` |
| 文章数据层 | `src/lib/posts.ts` |
| 认证系统 | `src/lib/auth.ts` |
| 数据库连接 | `src/lib/db.ts` |
| API 响应格式 | `src/lib/api-response.ts` |
| HTTP 客户端 | `src/lib/http-client.ts` |
| 全局样式/主题 | `src/app/globals.css` |
| 后台布局 | `src/app/admin/layout.tsx` |
| 后台壳组件 | `src/app/admin/_components/admin-shell.tsx` |
| 公开站点壳 | `src/components/site/public-chrome.tsx` |
| 路由分发 | `src/components/site/app-frame.tsx` |
| 数据库 Schema | `sql/init.sql` |

---

## 注意事项

### 安全

- 所有 admin API 必须调用 `requireAdminFromRequest()` 鉴权
- 密码使用 bcrypt (12 rounds)，不存储明文
- Session Token 使用 HMAC-SHA256 签名，防篡改
- SQL 查询必须参数化，禁止字符串拼接

### 性能

- 数据库连接池限制 3 连接，避免过度占用
- 使用 `FALLBACK_POSTS` 兜底数据，数据库不可用时页面仍可渲染
- 图片使用 Next.js `<Image>` 组件自动优化

### 兼容性

- Next.js 15 动态路由参数是 `Promise`，需 `await context.params`
- Tailwind v4 使用 CSS 配置，无 `tailwind.config.ts`
- React 19 不再需要 `useEffect` 中的清理函数处理某些场景

---

## 扩展指南

### 添加新的后台页面

1. 在 `src/app/admin/` 下创建目录和 `page.tsx`
2. 如需交互，创建对应的 `*-client.tsx` 组件
3. 在 `src/lib/site.ts` 的 `ADMIN_NAV_ITEMS` 添加导航项
4. 如需 API，在 `src/app/api/admin/` 创建路由

### 添加新的 shadcn/ui 组件

```bash
npx shadcn@latest add <component-name>
```

组件会自动生成到 `src/components/ui/`。

### 添加新的公开页面

1. 在 `src/app/` 下创建 `page.tsx`
2. 使用 CSS Modules 编写样式 (`*.module.css`)
3. 自动被 `PublicChrome` 包裹（除非在 `/admin` 路径下）

---

*最后更新: 2026-06-04*
