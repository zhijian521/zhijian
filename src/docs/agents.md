# AGENTS.md

> 本文档为 AI 助手（Claude、Cursor、Copilot 等）提供项目上下文，帮助快速理解代码库并遵循项目约定。

---

## 项目概述

**知简** —— 个人博客网站 + 导航页 + 站点监控平台（观澜），包含公开博客、导航页、管理后台和网站分析四部分。

- **技术栈**: Next.js 15 + React 19 + TypeScript + CSS Modules + MySQL
- **架构**: 单体全栈应用，App Router 模式，前后端代码在同一仓库
- **视觉风格**: 全站统一「文人书斋」风格（朱砂红 + 宣纸米白 + 衬线标题 + 零圆角）
- **样式方案**: 全站 CSS Modules + theme.css 变量，已移除 Tailwind CSS 和 shadcn/ui

---

## 技术栈详情

| 类别 | 技术 | 版本 | 状态 |
|------|------|------|------|
| 框架 | Next.js (App Router) | 15.3.x | ✅ 使用中 |
| 运行时 | React | 19.1.0 | ✅ 使用中 |
| 语言 | TypeScript (strict) | 5.8.3 | ✅ 使用中 |
| 样式 | CSS Modules + theme.css | — | ✅ 唯一方案 |
| 数据库 | MySQL (mysql2/promise) | 3.15.3 | ✅ 使用中 |
| 密码 | bcryptjs | 3.0.3 | ✅ 使用中 |
| HTTP | axios | 1.16.1 | ✅ 使用中 |
| 图标 | 自建 SVG 图标库 | — | ✅ `src/components/ui/icons.tsx`（50 个图标） |
| UI 组件 | 自建 CSS Module 组件 | — | ✅ 14 个组件 |
| 图表 | Recharts | ^3.8.1 | ✅ 观澜仪表盘 |
| Markdown | react-markdown + remark-gfm | ^10.1.0 | ✅ 使用中 |
| GeoIP | ip2region | ^2.3.0 | ✅ IP 地理定位（替代 geoip-lite） |
| 图片上传 | 本地文件系统 public/uploads/ | — | ✅ 按日期分目录存储 |

**路径别名**: `@/*` → `./src/*`

---

## 目录结构

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # 后台管理 (/admin/*)
│   │   ├── _components/          # 后台私有组件
│   │   │   ├── admin-shared.module.css   # 后台共享样式（表格操作/弹窗表单/提示消息）
│   │   │   ├── admin-login-card.tsx + .module.css  # 登录表单卡片
│   │   │   ├── admin-shell.tsx           # 后台布局壳（侧边栏+内容区）
│   │   │   ├── admin-sidebar.tsx         # 侧边栏导航（数据驱动二级折叠菜单）
│   │   │   ├── admin-page-header.tsx     # 页面标题区（eyebrow+title+tag+description）
│   │   │   ├── post-management-client.tsx # 文章列表（客户端）
│   │   │   └── user-list-client.tsx      # 用户列表（客户端）
│   │   ├── layout.tsx            # 后台布局（鉴权+AdminShell）
│   │   ├── login/                # 后台登录页
│   │   ├── posts/                # 文章管理 CRUD
│   │   │   ├── [id]/             # 文章编辑器（独立全屏页面）
│   │   │   │   ├── page.tsx      # 编辑器页面（脱离 AdminShell）
│   │   │   │   └── _components/ # 编辑器组件（8 个）
│   │   │   │       ├── post-editor.tsx + .module.css         # 编辑器主组件（视图切换+数据管理）
│   │   │   │       ├── editor-toolbar.tsx + .module.css      # 顶部工具栏（视图切换+保存+返回）
│   │   │   │       ├── markdown-editor.tsx + .module.css     # Markdown 编辑区
│   │   │   │       ├── markdown-preview.tsx + .module.css    # Markdown 预览区
│   │   │   │       ├── metadata-panel.tsx + .module.css      # 侧边元数据面板（分类/标签/封面/摘要）
│   │   │   │       ├── cover-upload.tsx + .module.css        # 封面图上传区
│   │   │   │       └── image-upload-dialog.tsx + .module.css # 图片选择弹窗（插入图片到正文）
│   │   ├── uploads/              # 图片管理（上传/浏览/删除）
│   │   │   ├── _components/
│   │   │   │   └── upload-management.tsx + .module.css  # 图片管理组件
│   │   │   └── page.tsx
│   │   ├── categories/           # 分类管理（数据库驱动）
│   │   │   └── _components/
│   │   │       └── category-management.tsx
│   │   ├── tags/                 # 标签管理（数据库驱动）
│   │   │   └── _components/
│   │   │       └── tag-management.tsx
│   │   ├── users/                # 用户管理 CRUD
│   │   ├── components/           # 组件列表示例页
│   │   ├── analytics/            # 观澜 — 站点监控
│   │   │   ├── _components/
│   │   │   │   ├── analytics-dashboard.tsx    # 仪表盘主组件
│   │   │   │   └── analytics-dashboard.module.css
│   │   │   ├── sites/
│   │   │   │   ├── _components/
│   │   │   │   │   ├── site-management.tsx    # 站点管理
│   │   │   │   │   └── site-management.module.css
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx          # 仪表盘页面
│   │   └── settings/             # 设置页
│   ├── api/                      # API 路由
│   │   ├── admin/                # 后台 API（需鉴权）
│   │   │   ├── posts/            # 文章 CRUD
│   │   │   │   └── [id]/         # 单文章操作（GET/PUT/DELETE）
│   │   │   ├── upload/           # 图片上传（POST，multipart/form-data）
│   │   │   ├── uploads/          # 图片列表（GET，分页）
│   │   │   │   └── [id]/         # 单图片操作（DELETE）
│   │   │   ├── categories/       # 分类 CRUD
│   │   │   ├── tags/             # 标签 CRUD
│   │   │   ├── users/            # 用户 CRUD
│   │   │   └── analytics/        # 站点监控 API
│   │   │       ├── overview/     # 仪表盘数据
│   │   │       ├── visits/       # 访问记录（分页）
│   │   │       └── sites/        # 站点 CRUD
│   │   ├── auth/                 # 认证 API
│   │   │   ├── login/            # 登录
│   │   │   ├── logout/           # 登出
│   │   │   └── me/               # 当前用户
│   │   ├── collect/              # 数据收集（无鉴权，供 script.js 上报）
│   │   ├── nav/                  # 导航页 API（需用户鉴权）
│   │   │   ├── data/             # 导航数据查询/更新
│   │   │   ├── sync/             # 导航数据同步
│   │   │   ├── bookmarks/        # 书签 CRUD
│   │   │   ├── todos/            # 备忘录 CRUD
│   │   │   └── notes/            # 笔记 CRUD
│   │   ├── favicon/              # Favicon 代理
│   │   └── posts/                # 公开文章列表
│   ├── blog/                     # 公开博客 (/blog/*)
│   │   ├── [slug]/               # 文章详情页（CSS Modules）
│   │   │   └── _components/      # 详情页私有组件
│   │   │       └── article-footer-actions.tsx  # 底部操作按钮（返回列表/主页/顶部）
│   │   ├── _components/          # 列表页私有组件
│   │   │   └── blog-list-client.tsx # 博客列表（客户端，useTransition+router.push 加载追踪）
│   │   └── page.tsx              # 博客列表页
│   ├── nav/                      # 导航页 (/nav)
│   │   ├── _components/          # 导航页私有组件
│   │   │   ├── nav-shell.tsx + .module.css         # 全屏分页容器（scroll-snap + Dock）
│   │   │   ├── search-section.tsx + .module.css     # 第一屏：搜索栏 + 书签
│   │   │   ├── search-bar.tsx + .module.css         # 搜索栏 + 搜索引擎切换
│   │   │   ├── bookmark-bar.tsx + .module.css       # 书签栏
│   │   │   ├── bookmark-link.tsx + .module.css      # 单个书签链接
│   │   │   ├── bookmark-context-menu.tsx + .module.css # 书签右键菜单
│   │   │   ├── favicon-img.tsx + .module.css        # Favicon 图片
│   │   │   ├── todo-section.tsx + .module.css       # 第二屏：备忘录
│   │   │   ├── note-section.tsx + .module.css       # 第三屏：笔记
│   │   │   ├── settings-section.tsx + .module.css   # 设置区
│   │   │   ├── auth-modal.tsx + .module.css         # 认证弹窗
│   │   │   ├── drag-utils.ts                        # 拖拽排序工具
│   │   │   └── common-dialog-form.module.css        # 通用弹窗表单样式
│   │   └── page.tsx              # 导航页入口
│   ├── forbidden/                # 403 页面
│   ├── theme.css                 # 全站统一主题变量
│   ├── globals.css               # 全局样式 + 工具类
│   └── layout.tsx                # 根布局（manifest / favicon / OG 配置）
├── components/
│   ├── site/                     # 公开站点共享组件（全部 CSS Modules）
│   │   ├── app-frame.tsx         # 应用框架（路由分发）
│   │   ├── public-chrome.tsx     # 公开站点壳（头部+底部）
│   │   ├── markdown-article.tsx  # Markdown 渲染组件
│   │   ├── post-card.tsx         # 博客文章卡片
│   │   └── project-card.tsx      # 项目展示卡片
│   └── ui/                       # 自建 UI 组件库（全部 CSS Modules）
│       ├── icons.tsx             # 自建 SVG 图标库（50 个图标，单文件）
│       ├── confirm-dialog.tsx + .module.css   # 确认弹窗
│       ├── data-table.tsx + .module.css       # 数据表格
│       ├── dialog.tsx + .module.css           # 弹窗
│       ├── ghost-button.tsx + .module.css     # 幽灵按钮（a/button 双模式）
│       ├── icon-button.tsx + .module.css      # 图标按钮（正方形，default/danger/muted）
│       ├── pagination.tsx + .module.css       # 分页
│       ├── pill-select.tsx + .module.css      # 胶囊选择器
│       ├── select.tsx + .module.css            # 下拉选择器
│       ├── submit-button.tsx + .module.css    # 提交按钮
│       ├── tag.tsx + .module.css              # 标签（mini/small/medium/default）
│       ├── text-input.tsx + .module.css       # 文本输入框
│       ├── text-link.tsx + .module.css        # 文字链接
│       ├── toast.tsx + .module.css            # Toast 提示（success/error，3秒自动消失）
│       └── use-toast.ts                       # Toast hook（单例 store + useSyncExternalStore）
├── lib/                          # 核心业务逻辑
│   ├── api-response.ts           # API 响应格式 + BizCode + ListData<T>
│   ├── auth.ts                   # 认证系统 + 用户数据层
│   ├── categories.ts             # 分类数据层
│   ├── db.ts                     # 数据库连接池
│   ├── http-client.ts            # axios 封装
│   ├── post-shared.ts            # 文章共享类型/工具
│   ├── posts.ts                  # 文章数据层（数据库）
│   ├── tags.ts                   # 标签数据层
│   ├── uploads.ts                # 图片上传数据层（CRUD + 文件系统操作）
│   ├── site.ts                   # 路由/导航配置（NavGroup 二级菜单）
│   ├── analytics.ts              # 站点监控分析数据层（聚合+查询）
│   ├── geo.ts                    # IP 地理定位（ip2region 离线库）
│   ├── ua.ts                     # User-Agent 解析（浏览器/OS 提取）
│   ├── track-sites.ts            # 站点数据层（CRUD）
│   ├── nav-config.ts             # 导航页配置（书签、搜索引擎）
│   ├── nav-db.ts                 # 导航页数据库层（bookmarks/todos/notes）
│   ├── nav-storage.ts            # 导航页存储层（登录走 API，未登录走 localStorage）
│   └── utils.ts                  # 工具函数 (cn + isNavItemActive)
├── hooks/
│   └── use-auth.ts               # 导航页认证 Hook（登录/注册/会话管理）
└── middleware.ts                 # 中间件（注入路径头）

sql/
├── init.sql                      # 数据库初始化脚本（zhijian_ 前缀表名）
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

**命名约定**:
- 客户端交互组件: `*-client.tsx` (如 `user-list-client.tsx`)
- 表单组件: `*-form.tsx` (如 `post-editor-form.tsx`)
- 布局壳组件: `*-shell.tsx` (如 `admin-shell.tsx`)

### 2. API 路由模式

所有 API 遵循统一流程：

```typescript
// 1. 鉴权（admin 路由）
const session = requireAdminFromRequest(request)
if (!session) {
  return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 })
}

// 2. 解析请求体
const body = await request.json()

// 3. 字段校验
if (!body.name) {
  return NextResponse.json(fail(BizCode.BAD_REQUEST, '分类名不能为空。'), { status: 400 })
}

// 4. 执行数据库操作
const result = await createCategory(body)

// 5. 返回标准响应
return NextResponse.json(success(result, '创建成功'))
```

**动态路由参数** (Next.js 15):
```typescript
// [id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // 注意：params 是 Promise
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

**列表响应结构**（统一格式）:
```typescript
interface ListData<T> {
  data: T[]    // 列表数据数组
  total: number // 总条数
}
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
| `USER_NOT_FOUND` | 40401 | 用户不存在 |
| `USER_EXISTS` | 40901 | 用户已存在 |
| `CATEGORY_NOT_FOUND` | 40402 | 分类不存在 |
| `CATEGORY_EXISTS` | 40902 | 分类已存在 |
| `TAG_NOT_FOUND` | 40403 | 标签不存在 |
| `TAG_EXISTS` | 40903 | 标签已存在 |

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
const session = requireAdminFromRequest(request)

// 仅获取当前会话（不强制）
const session = getSessionFromRequest(request)
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

const [rows] = await db.execute<RowDataPacket[]>('SELECT * FROM zhijian_blog_posts WHERE id = ?', [id])
```

**重要约定**:
- 所有查询使用参数化（防 SQL 注入）
- 无 ORM，直接使用 `mysql2` 的 `execute()` / `query()`
- 数据库未配置时，部分模块返回硬编码的 `FALLBACK_POSTS` 作为兜底数据
- 连接池限制: `connectionLimit: 3`
- **表名规范**: `zhijian_<模块>_<实体>`，如 `zhijian_blog_posts`、`zhijian_users`

**数据库表**:
| 表名 | 用途 |
|------|------|
| `zhijian_users` | 用户表（通用模块） |
| `zhijian_blog_posts` | 文章表（博客模块） |
| `zhijian_blog_uploads` | 图片上传记录表（博客模块） |
| `zhijian_blog_categories` | 分类表（博客模块） |
| `zhijian_blog_tags` | 标签表（博客模块） |
| `zhijian_track_sites` | 站点注册表（监控模块） |
| `zhijian_track_events` | 原始事件表（监控模块，写入密集） |
| `zhijian_track_daily` | 日聚合统计表（监控模块，查询加速） |
| `zhijian_nav_bookmarks` | 导航页书签表（导航模块，每用户一条 JSON） |
| `zhijian_nav_todos` | 导航页备忘录表（导航模块，每用户一条 JSON） |
| `zhijian_nav_notes` | 导航页笔记表（导航模块，每用户一条 JSON） |

### 6. HTTP 客户端

**使用方式** (`src/lib/http-client.ts`):
```typescript
import { api } from '@/lib/http-client'

// GET
const res = await api.get<ListData<PostItem>>('/admin/posts')

// POST
const res = await api.post<{ id: number }>('/admin/posts', { title: '标题' })

// PUT
const res = await api.put<Post>('/admin/posts/123', { title: '新标题' })

// DELETE
const res = await api.delete('/admin/users/456')

// 统一处理响应
if (res.code === 0 && res.data) {
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
| 公开博客 | `/`, `/blog`, `/blog/[slug]` | `PublicChrome` (头部+底部) |
| 导航页 | `/nav` | `PublicChrome` (头部+底部) |
| 管理后台 | `/admin/*` | `AdminShell` (侧边栏+内容区) |
| 文章编辑器 | `/admin/posts/[id]` | 无壳（独立全屏页面，脱离 AdminShell） |
| 图片管理 | `/admin/uploads` | `AdminShell` |
| 分类管理 | `/admin/categories` | `AdminShell` |
| 标签管理 | `/admin/tags` | `AdminShell` |
| 后台登录 | `/admin/login` | 无壳（独立页面） |
| 403 页面 | `/forbidden` | 无壳 |

### 布局分发机制

```
RootLayout
    └── AppFrame (src/components/site/app-frame.tsx)
            ├── pathname.startsWith('/admin/login') → AdminLoginLayout
            ├── pathname.match(/^\/admin\/posts\/\d+/) → 无壳（编辑器独立全屏页面）
            ├── pathname.startsWith('/admin')       → AdminShell
            └── 其他（/ /blog/* /nav）              → PublicChrome
```

### 主题系统

全站使用 `src/app/theme.css` 定义 CSS 变量：

```css
/* theme.css — 全站唯一变量源 */
:root {
  --primary: #9f000f;       /* 朱砂红 */
  --background: #f9f5f0;    /* 米白纸 */
  --foreground: #1d1b20;    /* 浓墨 */
  --muted: #f6efe7;         /* 米黄宣纸 */
  --border: #e7ddd1;        /* 驼色 */
  --radius: 0;              /* 全站零圆角 */
  --font-serif: 'Noto Serif SC', ...;
  --font-sans: system-ui, 'PingFang SC', ...;
}
```

---

## 样式约定

### 统一 CSS Modules 方案

全站已统一使用 CSS Modules + theme.css 变量，无 Tailwind、无 shadcn/ui、无 lucide-react。

### 新组件约定（CSS Modules）

所有 UI 组件遵循统一模式：

```typescript
// 组件文件：kebab-case.tsx
import styles from './kebab-case.module.css'

export interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'default' | 'accent'
    size?: 'default' | 'medium' | 'small' | 'mini'
}

export function Component({ variant = 'default', size = 'default', className, ...props }: ComponentProps) {
    return (
        <element
            className={`${styles.base} ${styles[variant]}${className ? ` ${className}` : ''}`}
            {...props}
        />
    )
}
```

**关键规则**:
- 文件命名：kebab-case，组件 + 配对 `.module.css`
- 导出：仅 named export，不用 default export（布局壳/页面组件除外）
- Props：继承原生 HTML 属性，`className` 模板字符串合并
- 样式：所有值引用 `var(--*)` 变量，用 `color-mix()` 做透明度
- CSS 变体排序：基础类写默认值，变体按 default → medium → small → mini 排序（后者覆盖前者）
- 注释：中文分隔符 `/*== ... ==*/`
- 图标：使用 `@/components/ui/icons` 自建库

### 图标系统

全站统一使用 `src/components/ui/icons/` 自建 SVG 图标库（40 个图标）：

```typescript
import { ArrowRightIcon, PencilIcon, Trash2Icon } from '@/components/ui/icons'

// 尺寸由消费方 CSS 控制，颜色用 currentColor 继承
<PencilIcon className={shared.actionIcon} />
```

### 后台共享样式

`src/app/admin/_components/admin-shared.module.css` 提供三个管理页面共用的样式类：

| 类名 | 用途 |
|------|------|
| `.mutedCell` | 次要文字颜色 |
| `.actionGroup` | 表格操作按钮组布局 |
| `.btnIcon` | 工具栏按钮内图标 |
| `.form` / `.formActions` | 弹窗表单布局 |
| `.formMessage` | 表单错误/成功提示 |

### Toast 提示

全站统一使用 `toast` 进行操作反馈，禁止使用 `alert()`：

```typescript
import { toast } from '@/components/ui/toast'

// 成功提示
toast.success('删除成功')

// 错误提示
toast.error('操作失败，请稍后重试。')
```

**特点**：
- 单例 store + `useSyncExternalStore`，无需 Provider 包裹
- `ToastContainer` 已挂载在 `AdminShell`，所有后台页面自动可用
- 3 秒自动消失，支持手动关闭
- 视觉：success 朱砂淡底 + error 危险淡底，零圆角

### 常用 CSS 变量

| 变量 | 用途 | 值 |
|------|------|-----|
| `--primary` | 主色（强调） | `#9f000f` (朱砂红) |
| `--background` | 背景色 | `#f9f5f0` (米白) |
| `--foreground` | 前景色（正文） | `#1d1b20` (墨色) |
| `--muted` | 次要背景 | `#f6efe7` (米黄宣纸) |
| `--muted-foreground` | 次要文字 | `#6f655c` (暖褐) |
| `--border` | 边框色 | `#e7ddd1` (驼色) |
| `--radius` | 圆角 | `0` (全站零圆角) |
| `--font-sans` | 无衬线字体 | system-ui + CJK |
| `--font-serif` | 衬线字体 | Noto Serif SC |

> 完整变量列表见 `src/app/theme.css`

---

## 数据库 Schema

### zhijian_users 表（通用模块）

```sql
id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
username      VARCHAR(50) NOT NULL UNIQUE
email         VARCHAR(255) NOT NULL UNIQUE
password_hash VARCHAR(255) NOT NULL
role          ENUM('admin', 'user') DEFAULT 'user'
status        ENUM('active', 'disabled') DEFAULT 'active'
created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

INDEX idx_zhijian_users_role (role)
INDEX idx_zhijian_users_status (status)
```

### zhijian_blog_posts 表（博客模块）

```sql
id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
slug         VARCHAR(120) NOT NULL UNIQUE
title        VARCHAR(200) NOT NULL
summary      VARCHAR(500) NOT NULL
content      MEDIUMTEXT NOT NULL
cover_image  VARCHAR(500) DEFAULT NULL           -- 封面图路径
alt_text     VARCHAR(200) DEFAULT NULL           -- 封面图 alt 描述
category_id  INT UNSIGNED DEFAULT NULL           -- 分类ID
tags         JSON DEFAULT NULL                   -- 标签ID数组，如 [1,3,5]
status       ENUM('draft', 'published') DEFAULT 'draft'
published_at DATETIME NULL
created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

INDEX idx_zhijian_blog_posts_status_published_at (status, published_at)
INDEX idx_zhijian_blog_posts_category (category_id)
```

### zhijian_blog_categories 表（博客模块）

```sql
id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name        VARCHAR(100) NOT NULL
slug        VARCHAR(120) NOT NULL UNIQUE
sort_order  INT NOT NULL DEFAULT 0
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### zhijian_blog_tags 表（博客模块）

```sql
id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name        VARCHAR(100) NOT NULL
slug        VARCHAR(120) NOT NULL UNIQUE
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### zhijian_blog_uploads 表（博客模块 — 图片上传记录）

```sql
id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
filename    VARCHAR(255) NOT NULL              -- 哈希文件名
original    VARCHAR(255) NOT NULL              -- 原始文件名
path        VARCHAR(500) NOT NULL              -- 存储路径 /uploads/2026/06/xxx.jpg
size        INT UNSIGNED NOT NULL              -- 文件大小（字节）
mime        VARCHAR(50) NOT NULL               -- MIME 类型
alt         VARCHAR(200) DEFAULT ''            -- alt 描述
created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

INDEX idx_zhijian_blog_uploads_created (created_at)
```

### zhijian_track_sites 表（监控模块）

```sql
id          VARCHAR(32) NOT NULL PRIMARY KEY           -- 8位随机字符
name        VARCHAR(200) NOT NULL
domain      VARCHAR(255) NOT NULL UNIQUE
status      ENUM('active', 'paused', 'deleted') DEFAULT 'active'
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### zhijian_track_events 表（监控模块，写入密集，保留 90 天）

```sql
id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
site_id     VARCHAR(32) NOT NULL                      -- FK → track_sites
type        ENUM('pageview', 'heartbeat', 'leave') DEFAULT 'pageview'
path        VARCHAR(500) NOT NULL
referrer    VARCHAR(500) NULL
title       VARCHAR(500) NULL
duration    INT UNSIGNED NULL                         -- 停留秒数（leave 事件）
screen      VARCHAR(20) NULL                          -- 如 1920x1080
lang        VARCHAR(10) NULL
is_new      TINYINT(1) DEFAULT 0                      -- 新访客标识
is_session  TINYINT(1) DEFAULT 0                      -- 会话首页标识
visitor_id  VARCHAR(64) NULL                          -- 访客匿名ID（随机 cookie）
session_id  VARCHAR(64) NULL
ip          VARCHAR(45) NULL                          -- 遮蔽 IP（末位 xxx）
country     VARCHAR(50) NULL                          -- 国家（中文名，ip2region）
region      VARCHAR(50) NULL                          -- 省份/州（中文名）
city        VARCHAR(100) NULL
ua          VARCHAR(500) NULL                         -- 原始 User-Agent
browser     VARCHAR(50) NULL                          -- 解析后的浏览器名
os          VARCHAR(50) NULL                          -- 解析后的操作系统名
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP

INDEX idx_zhijian_track_events_site_created (site_id, created_at)
INDEX idx_zhijian_track_events_site_type_created (site_id, type, created_at)
INDEX idx_zhijian_track_events_site_session_type (site_id, session_id, type)
INDEX idx_zhijian_track_events_site_path (site_id, path(191))
INDEX idx_zhijian_track_events_site_country (site_id, country)
```

### zhijian_track_daily 表（监控模块，日聚合统计，查询加速）

```sql
id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
site_id      VARCHAR(32) NOT NULL
date         DATE NOT NULL
path         VARCHAR(500) NOT NULL DEFAULT ''          -- 空=整站汇总
pv           INT UNSIGNED DEFAULT 0
uv           INT UNSIGNED DEFAULT 0
bounce       INT UNSIGNED DEFAULT 0
avg_duration INT UNSIGNED DEFAULT 0                    -- 平均停留秒数
created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

UNIQUE KEY uniq_zhijian_track_daily_site_date_path (site_id, date, path)
```

---

## 环境变量

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SCRIPT_URL=http://localhost:3000  # 分析脚本分发 URL（默认同 SITE_URL）
DATABASE_URL=mysql://user:password@host:3306/database
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=your-random-secret-string
```

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 站点 URL（公开） |
| `NEXT_PUBLIC_SCRIPT_URL` | 分析脚本分发 URL（供第三方站点嵌入） |
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
npm run typecheck    # TypeScript 类型检查 (tsc --noEmit)

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

**常用 scope**: `admin`, `app`, `blog`, `home`, `chrome`, `icons`, `theme`, `基础组件`

**示例**:
```
feat(admin): 分类/标签接入真实数据库
refactor(基础组件): 统一五组件三档尺寸体系
fix(api): handle null response from database
```

---

## 关键文件速查

| 用途 | 文件 |
|------|------|
| 统一主题变量 | `src/app/theme.css` |
| 路由/导航配置 | `src/lib/site.ts` |
| API 响应格式 + ListData | `src/lib/api-response.ts` |
| 认证系统 + 用户数据层 | `src/lib/auth.ts` |
| 分类数据层 | `src/lib/categories.ts` |
| 标签数据层 | `src/lib/tags.ts` |
| 文章数据层（数据库） | `src/lib/posts.ts` |
| 图片上传数据层 | `src/lib/uploads.ts` |
| 数据库连接 | `src/lib/db.ts` |
| HTTP 客户端 | `src/lib/http-client.ts` |
| 全局样式 | `src/app/globals.css` |
| 自建图标库 | `src/components/ui/icons.tsx` |
| Toast 提示 | `src/components/ui/toast.tsx` + `use-toast.ts` |
| 站点监控嵌入脚本 | `public/script.js` |
| 站点监控数据层 | `src/lib/analytics.ts` + `track-sites.ts` |
| IP 地理定位 | `src/lib/geo.ts` |
| UA 解析 | `src/lib/ua.ts` |
| 数据收集 API | `src/app/api/collect/route.ts` |
| 仪表盘页面 | `src/app/admin/analytics/page.tsx` |
| 站点管理页面 | `src/app/admin/analytics/sites/page.tsx` |
| 文章编辑器 | `src/app/admin/posts/[id]/_components/post-editor.tsx` |
| 图片管理页面 | `src/app/admin/uploads/page.tsx` |
| 后台布局 | `src/app/admin/layout.tsx` |
| 后台共享样式 | `src/app/admin/_components/admin-shared.module.css` |
| 后台壳组件 | `src/app/admin/_components/admin-shell.tsx` |
| 公开站点壳 | `src/components/site/public-chrome.tsx` |
| 导航页入口 | `src/app/nav/page.tsx` |
| 导航页配置 | `src/lib/nav-config.ts` |
| 导航页数据库层 | `src/lib/nav-db.ts` |
| 导航页存储层 | `src/lib/nav-storage.ts` |
| 导航页认证 Hook | `src/hooks/use-auth.ts` |
| Markdown 渲染 | `src/components/site/markdown-article.tsx` |
| PWA 清单 | `public/manifest.json` |
| 路由分发 | `src/components/site/app-frame.tsx` |
| 数据库 Schema | `sql/init.sql` |

---

## 注意事项

### 安全

- 所有 admin API 必须调用 `requireAdminFromRequest()` 鉴权
- 密码使用 bcrypt (12 rounds)，不存储明文
- Session Token 使用 HMAC-SHA256 签名，防篡改
- SQL 查询必须参数化，禁止字符串拼接
- `/api/collect` 是唯一无鉴权 API，有令牌桶限流（10次/秒/siteId），验证 siteId 存在且启用
- IP 地址使用 ip2region 离线库解析地理位置（中国 IP 精度高），存储时遮蔽末位（如 `192.168.1.xxx`）
- User-Agent 在服务端解析为浏览器/操作系统名称，原始 UA 也存储

### 性能

- 数据库连接池限制 3 连接，避免过度占用
- 使用 `FALLBACK_POSTS` 兜底数据，数据库不可用时页面仍可渲染
- 图片使用 Next.js `<Image>` 组件自动优化
- 博客背景图和 OG 图已转为 WebP 格式，减小文件体积
- 图片上传存储在 `public/uploads/` 本地文件系统，按日期分目录（如 `/uploads/2026/06/`）

### 兼容性

- Next.js 15 动态路由参数是 `Promise`，需 `await context.params`
- React 19 不再需要 `useEffect` 中的清理函数处理某些场景

### 开发约定

- 全站使用 CSS Modules，不使用 Tailwind 类名
- 新建 UI 组件必须用 CSS Modules，不要引入任何 UI 框架
- 新增图标加入 `src/components/ui/icons/`，不要引入图标库
- 表名使用 `zhijian_<模块>_<实体>` 前缀规范
- 列表接口统一返回 `{ data: T[], total: number }` 格式
- 操作反馈使用 `toast.success()` / `toast.error()`，禁止 `alert()`

---

## 扩展指南

### 添加新的后台页面

1. 在 `src/app/admin/` 下创建目录和 `page.tsx`
2. 如需交互，创建对应的 `*-client.tsx` 组件
3. 在 `src/lib/site.ts` 的 `ADMIN_NAV_GROUPS` 中添加导航项
4. 如需 API，在 `src/app/api/admin/` 创建路由
5. 数据层在 `src/lib/` 下创建，使用 `RowDataPacket[]` 类型

### 添加新的自建 UI 组件

1. 在 `src/components/ui/` 下创建 `component-name.tsx` + `component-name.module.css`
2. Props 继承原生 HTML 属性，导出 interface
3. 使用 `var(--*)` 变量，不要硬编码颜色
4. CSS 变体排序：default → medium → small → mini（后者覆盖前者）
5. 参考 `tag.tsx` / `ghost-button.tsx` 的模式

### 添加新的图标

1. 在 `src/components/ui/icons/` 下创建 `icon-name.tsx`
2. 遵循 `IconProps` 接口，用 `currentColor` + `strokeWidth={2}`
3. 在 `index.ts` 添加导出
4. 参考 `pencil-icon.tsx` 的模式

### 添加新的公开页面

1. 在 `src/app/` 下创建 `page.tsx`
2. 使用 CSS Modules 编写样式 (`*.module.css`)
3. 引用 `theme.css` 中的 CSS 变量
4. 自动被 `PublicChrome` 包裹（除非在 `/admin` 路径下）

---

*最后更新: 2026-06-27（博客前台：面包屑 UI + 相关文章 + 筛选加载条 + filter chip 服务端预计算；PWA manifest；sitemap lastModified；WebP 图片优化；blogTitle 重命名；enrichPostWithTagNames 内联）*
