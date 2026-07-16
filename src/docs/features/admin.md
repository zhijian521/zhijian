# 后台管理

知简后台管理（`/admin/*`）提供文章 CRUD、分类标签管理、图片管理、用户管理、系统设置和站点分析（观澜）功能。全部页面需要 admin 角色登录。

---

## 目录

- [布局架构](#布局架构)
- [登录页](#登录页)
- [概览页](#概览页)
- [文章管理](#文章管理)
- [文章编辑器](#文章编辑器)
- [分类标签管理](#分类标签管理)
- [图片管理](#图片管理)
- [用户管理](#用户管理)
- [系统设置](#系统设置)
- [共享组件](#共享组件)
- [涉及文件](#涉及文件)

---

## 布局架构

**文件**：`src/app/admin/layout.tsx`

后台布局根据路由路径分为三种模式：

| 路由 | 模式 | 说明 |
|------|------|------|
| `/admin/login` | 裸渲染 | 不鉴权，直接渲染登录表单 |
| `/admin/posts/:id` | 编辑器全屏 | 鉴权后渲染，脱离标准侧边栏布局，仅附带 ToastContainer |
| 其他 `/admin/*` | 标准后台 | 布局直接组合固定侧边栏和主内容区 |

```
<AdminLayout>
  ├── requireAdmin() 鉴权（login 路由跳过）
  │
  ├── login → 裸渲染 <AdminLoginCard />
  ├── editor → <children> + <ToastContainer />
  └── 其他 → <main className={styles.layout}>
                ├── <AdminSidebar /> — 16rem 固定侧边栏
                └── <section> — 带左边距的主内容区
```

### AdminSidebar

**文件**：`src/components/modules/admin/admin-sidebar.tsx`

数据驱动的二级折叠菜单，导航结构由 `src/lib/core/site.ts` 导出的 `ADMIN_NAV_GROUPS` 配置。

| 区域 | 内容 |
|------|------|
| 品牌区 | logo + "Zhijian Admin" + "Content Management" |
| 快捷操作 | 「撰写文章」按钮，POST `/api/admin/posts` 后 `window.open` 编辑器 |
| 导航区 | 概览（顶级）/ 文章管理（折叠：列表、分类标签、图片管理）/ 系统管理（折叠：用户管理、系统设置）/ 网站统计（折叠：数据概览、站点管理） |
| 底部区 | 个人资料按钮 + 退出登录按钮 |

- 当前路由匹配分组下任一子项时自动展开该分组
- 用户手动点击折叠/展开后以手动状态为准
- 折叠组通过原生 `hidden` 同时移出视觉和键盘焦点顺序，按钮使用 `aria-expanded` + `aria-controls`
- 当前页面链接使用 `aria-current="page"`
- 退出登录：POST `/api/auth/logout` 后跳转登录页

---

## 登录页

**文件**：`src/app/admin/login/page.tsx` + `src/components/modules/admin/admin-login-card.tsx`

### 服务端逻辑

- 已登录 admin → 重定向到 `/admin`
- 已登录 user → 重定向到 `/`
- 未登录 → 渲染 `AdminLoginCard`

### AdminLoginCard

Client Component，直角风格登录表单：

| 字段 | 类型 | 说明 |
|------|------|------|
| 用户名 | TextInput | `icon: UserIcon`，`autoComplete: username` |
| 密码 | TextInput | `icon: LockIcon`，`type: password` |
| 记住用户名 | checkbox | 勾选后 localStorage 存储用户名，下次自动回填 |

- 登录流程：POST `/api/auth/login` → 校验 `role === 'admin'` → 成功跳转 `/admin`
- 非管理员提示「该账号无后台管理权限」
- 使用 `useTransition` 追踪提交状态，按钮显示「登录中...」
- localStorage key：`zhijian_admin_remembered_username`

---

## 概览页

**文件**：`src/app/admin/page.tsx`

### 数据

- `getAllPosts()` + `countUsersByRole()` 并行查询
- 统计：文章总数 / 已发布数 / 草稿数 / 用户总数

### 页面结构

```
<AdminPageHeader> — eyebrow: "Overview", title: "概览", tag: "N 篇文章 · M 个用户"
├── 指标卡片 × 3（3列网格）
│    ├── 文章 — 总数，描述：X 篇已发布
│    ├── 用户 — 总数，描述：N 管理员 · M 用户
│    └── 状态 — 草稿/已发布数
└── 近期文章 — <DataTable>（最近 5 篇）
     列：标题 | 状态（Tag） | 日期 | 操作（编辑按钮）
```

---

## 文章管理

**文件**：`src/app/admin/posts/page.tsx` → `src/components/modules/admin/post-management-client.tsx`

服务端仅渲染 `<PostManagementClient />`，所有数据和交互在客户端完成。

### 功能

- 文章列表：DataTable，支持搜索 + 分页
- 新建草稿：POST `/api/admin/posts`，跳转编辑器
- 编辑：跳转 `/admin/posts/:id`（独立全屏编辑器）
- 删除：DELETE `/api/admin/posts/:id`，确认弹窗

### API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/posts` | 获取全部文章（含草稿） |
| POST | `/api/admin/posts` | 创建草稿（自动生成 slug: `draft-{timestamp}`） |
| PATCH | `/api/admin/posts/:id` | 更新文章字段 |
| DELETE | `/api/admin/posts/:id` | 删除文章 |
| GET | `/api/admin/posts/export` | 导出全部文章为 ZIP |
| GET | `/api/admin/posts/export?id=N` | 导出单篇文章为 ZIP |

详见 `features/admin-export.md`。

---

## 文章编辑器

**文件**：`src/app/admin/posts/[id]/page.tsx` → `src/components/modules/admin/post-editor.tsx`

脱离标准侧边栏布局的独立全屏页面，路由 `/admin/posts/:id`。

### 主要文件

| 组件 | 说明 |
|------|------|
| `post-editor.tsx` | 编辑器主组件：视图切换 + 数据管理 + 自动保存 |
| `editor-toolbar.tsx` | 顶部工具栏：编辑/预览/分栏视图切换 + 保存 + 返回 |
| `markdown-editor.tsx` | Markdown 编辑区（textarea） |
| `markdown-preview.tsx` | Markdown 预览区（复用 ArticleDetail 完整详情结构） |
| `metadata-panel.tsx` | 侧边元数据面板：分类选择 + 标签选择 + 封面图 + 摘要 |
| `cover-upload.tsx` | 封面图上传区 |
| `page.tsx` | 编辑器页面壳：加载数据 + 渲染 PostEditor |

### 编辑器布局

```
┌─ editor-toolbar ──────────────────────────────┐
│ ← 返回  │ 编辑 │ 预览 │ 分栏 │    保存按钮    │
├───────────────┬──────────────────────┬──────────────────────┤
│ metadata-panel│ markdown-editor      │ markdown-preview     │
│ 分类/标签     │ 标题 + 摘要 + 正文   │ ArticleDetail        │
│ 封面/状态     │                      │ 面包屑 + 正文 + 页尾 │
└───────────────┴──────────────────────┴──────────────────────┘
```

- 三种视图：编辑（左侧 260px 元数据面板 + 编辑区）、预览（全宽真实详情结构）、分栏（左侧 260px 元数据面板 + 编辑区 + 预览区）
- 自动保存：修改后 2 秒自动 PATCH
- 图片插入：工具栏选择、粘贴或拖拽图片后直接上传，并在光标位置插入 Markdown 语法
- 预览数据：编辑器表单状态组装为完整 `Post`，实时预览和放大预览统一传给 `ArticleDetail`

---

## 分类标签管理

**文件**：`src/app/admin/taxonomy/page.tsx` → `src/components/modules/admin/taxonomy-management.tsx`

分类与标签合并管理页面，双栏布局。

### API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/admin/categories` | 列表 / 创建 |
| PUT/DELETE | `/api/admin/categories/:id` | 更新 / 删除 |
| GET/POST | `/api/admin/tags` | 列表 / 创建 |
| PUT/DELETE | `/api/admin/tags/:id` | 更新 / 删除 |

---

## 图片管理

**文件**：`src/app/admin/uploads/page.tsx` → `src/components/modules/admin/upload-management.tsx`

图片上传、浏览、删除，支持本地同步。

### API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/upload` | 上传图片（multipart/form-data） |
| GET | `/api/admin/uploads` | 图片列表（分页） |
| DELETE | `/api/admin/uploads/:id` | 删除图片 |

- 图片存储：`public/uploads/YYYY/MM/` 按日期分目录
- 同步功能：调用 `sync-uploads.mjs` 从服务器拉取图片到本地（详见 `features/sync-uploads.md`）

---

## 用户管理

**文件**：`src/app/admin/users/page.tsx` → `src/components/modules/admin/user-list-client.tsx`

用户 CRUD 管理页面。

### 页面结构

```
<AdminPageHeader> — eyebrow: "Users", title: "用户管理", tag: "账号管理"
└── <UserListClient />
     ├── 搜索 + 新建用户按钮
     └── <DataTable> — 用户列表
          列：用户名 | 邮箱 | 角色（Tag） | 状态（Tag） | 操作
```

### API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/users` | 用户列表（分页 + 搜索） |
| POST | `/api/admin/users` | 创建用户 |
| PUT | `/api/admin/users/:id` | 更新用户（用户名/邮箱/密码/角色/状态） |
| DELETE | `/api/admin/users/:id` | 删除用户 |

---

## 系统设置

**文件**：`src/app/admin/settings/page.tsx`

三张卡片的响应式网格，其中搜索引擎提交卡片包含客户端操作：

| 卡片 | 内容 |
|------|------|
| 登录与权限 | Cookie 登录态、bcrypt 加密、`ADMIN_SESSION_SECRET` 环境变量 |
| 项目约定 | 统一视觉风格、扩展方式、`sql/init.sql` 初始化脚本 |
| 搜索引擎提交 | 调用 `POST /api/admin/seo/submit`，将首页、文章列表和已发布文章提交到 IndexNow 与百度 |

交互由 `src/components/modules/admin/settings-submit-button.tsx` 承接，结果展示提交 URL 总数以及各搜索引擎的成功/失败状态。

---

## 共享组件

### AdminPageHeader

**文件**：`src/components/modules/admin/page-header.tsx`

后台页面统一头部，匹配博客衬线标题风格。

```typescript
interface AdminPageHeaderProps {
    action?: React.ReactNode;   // 右侧操作区（如新建按钮）
    description: string;         // 页面描述
    eyebrow?: string;            // 小标签（kicker）
    tag?: string;                // 标签文字
    title: string;               // 页面标题
}
```

### 后台壳层样式

**文件**：`src/components/modules/admin/admin-shell.module.css`

后台没有独立 `AdminShell` 组件；`src/app/admin/layout.tsx` 直接组合侧边栏和主内容区，并使用该 CSS Module 控制固定侧边栏偏移和页面内边距。

### AdminSidebar

**文件**：`src/components/modules/admin/admin-sidebar.tsx`

数据驱动二级折叠菜单，详见上方布局架构章节。

---

## 涉及文件

| 文件 | 说明 |
|------|------|
| `src/app/admin/layout.tsx` | 后台布局（鉴权 + 路由分发） |
| `src/components/modules/admin/admin-shell.module.css` | 后台壳层样式（侧边栏偏移 + 主内容区） |
| `src/components/modules/admin/admin-sidebar.tsx` | 侧边栏导航 |
| `src/components/modules/admin/admin-login-card.tsx` | 登录表单卡片 |
| `src/components/modules/admin/page-header.tsx` | 页面统一头部 |
| `src/components/modules/admin/admin-shared.module.css` | 后台共享样式 |
| `src/app/admin/page.tsx` | 概览页 |
| `src/app/admin/login/page.tsx` | 登录页 |
| `src/app/admin/posts/page.tsx` | 文章管理页 |
| `src/components/modules/admin/post-management-client.tsx` | 文章列表交互 |
| `src/app/admin/posts/[id]/page.tsx` | 文章编辑器页 |
| `src/components/modules/admin/post-editor.tsx` | 编辑器主组件 |
| `src/components/modules/admin/editor-toolbar.tsx` | 工具栏 |
| `src/components/modules/admin/markdown-editor.tsx` | Markdown 编辑区 |
| `src/components/modules/admin/markdown-preview.tsx` | Markdown 预览区 |
| `src/components/modules/admin/metadata-panel.tsx` | 元数据面板 |
| `src/components/modules/admin/cover-upload.tsx` | 封面图上传 |
| `src/app/admin/taxonomy/page.tsx` | 分类标签管理页 |
| `src/components/modules/admin/taxonomy-management.tsx` | 分类标签 CRUD 交互 |
| `src/components/modules/admin/taxonomy-card.tsx` | 分类标签卡片 |
| `src/app/admin/uploads/page.tsx` | 图片管理页 |
| `src/components/modules/admin/upload-management.tsx` | 图片管理交互 |
| `src/app/admin/users/page.tsx` | 用户管理页 |
| `src/components/modules/admin/user-list-client.tsx` | 用户列表交互 |
| `src/app/admin/settings/page.tsx` | 系统设置页 |
| `src/components/modules/admin/settings-submit-button.tsx` | 搜索引擎提交操作 |
