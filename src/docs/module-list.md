# 项目功能与页面清单

> 按模块分组，审查时从上到下逐项进行。每个模块内的审查顺序建议：页面 → 组件 → API → 数据层。

---

## 1. 全局基础

| 序号 | 名称 | 路径 |
|------|------|------|
| 1.1 | 根布局 | `src/app/layout.tsx` |
| 1.2 | 全局样式 | `src/app/globals.css` / `src/app/theme.css` |
| 1.3 | 加载页 | `src/app/loading.tsx` / `src/app/loading.module.css` |
| 1.4 | 404 页 | `src/app/not-found.tsx` |
| 1.5 | 403 页 | `src/app/forbidden/page.tsx` |
| 1.6 | 中间件 | `src/middleware.ts` |
| 1.7 | SEO — robots | `src/app/robots.ts` |
| 1.8 | SEO — sitemap | `src/app/sitemap.ts`（首页/列表页含 lastModified） |
| 1.9 | SEO — RSS | `src/app/feed.xml/route.ts` |
| 1.10 | PWA — manifest | `public/manifest.json`（宣纸色主题） |

---

## 2. 首页

| 序号 | 名称 | 路径 |
|------|------|------|
| 2.1 | 首页 | `src/app/page.tsx` / `src/app/page.module.css` |

---

## 3. 博客

| 序号 | 名称 | 路径 |
|------|------|------|
| 3.1 | 博客列表 | `src/app/blog/page.tsx` / `src/app/blog/page.module.css` |
| 3.2 | 博客列表客户端 | `src/app/blog/_components/blog-list-client.tsx`（useTransition + router.push） |
| 3.3 | 文章详情 | `src/app/blog/[slug]/page.tsx` / `src/app/blog/[slug]/page.module.css` |
| 3.4 | 文章详情加载 | `src/app/blog/[slug]/loading.tsx` |
| 3.5 | 文章底部操作 | `src/app/blog/[slug]/_components/article-footer-actions.tsx` |
| 3.6 | 博客 API | `src/app/api/posts/route.ts` |

---

## 4. 导航页（Nav）

| 序号 | 名称 | 路径 |
|------|------|------|
| 4.1 | 导航主页 | `src/app/nav/page.tsx` |
| 4.2 | 导航外壳（三屏滚动） | `src/app/nav/_components/nav-shell.tsx` / `.module.css` |
| 4.3 | 搜索区 | `src/app/nav/_components/search-section.tsx` / `.module.css` |
| 4.4 | 搜索栏 | `src/app/nav/_components/search-bar.tsx` / `.module.css` |
| 4.5 | 书签栏 | `src/app/nav/_components/bookmark-bar.tsx` / `.module.css` |
| 4.6 | 书签链接 | `src/app/nav/_components/bookmark-link.tsx` / `.module.css` |
| 4.7 | 书签右键菜单 | `src/app/nav/_components/bookmark-context-menu.tsx` / `.module.css` |
| 4.8 | 通用弹窗表单 | `src/app/nav/_components/common-dialog-form.module.css` |
| 4.9 | Favicon 图片 | `src/app/nav/_components/favicon-img.tsx` / `.module.css` |
| 4.10 | 备忘录区 | `src/app/nav/_components/todo-section.tsx` / `.module.css` |
| 4.11 | 笔记区 | `src/app/nav/_components/note-section.tsx` / `.module.css` |
| 4.12 | 设置区 | `src/app/nav/_components/settings-section.tsx` / `.module.css` |
| 4.13 | 认证弹窗 | `src/app/nav/_components/auth-modal.tsx` / `.module.css` |
| 4.14 | 拖拽工具 | `src/app/nav/_components/drag-utils.ts` |
| 4.15 | Nav 数据 API | `src/app/api/nav/data/route.ts` |
| 4.16 | Nav 同步 API | `src/app/api/nav/sync/route.ts` |
| 4.17 | 书签 API | `src/app/api/nav/bookmarks/route.ts` |
| 4.18 | 备忘录 API | `src/app/api/nav/todos/route.ts` |
| 4.19 | 笔记 API | `src/app/api/nav/notes/route.ts` |
| 4.20 | Favicon 代理 API | `src/app/api/favicon/route.ts` |
| 4.21 | Nav 配置 | `src/lib/nav-config.ts` |
| 4.22 | Nav 数据库层 | `src/lib/nav-db.ts` |
| 4.23 | Nav 存储层 | `src/lib/nav-storage.ts` |
| 4.24 | Nav 认证 Hook | `src/hooks/use-auth.ts` |

---

## 5. 认证系统

| 序号 | 名称 | 路径 |
|------|------|------|
| 5.1 | 登录 API | `src/app/api/auth/login/route.ts` |
| 5.2 | 注册 API | `src/app/api/auth/register/route.ts` |
| 5.3 | 登出 API | `src/app/api/auth/logout/route.ts` |
| 5.4 | 当前用户 API | `src/app/api/auth/me/route.ts` |
| 5.5 | 认证工具 | `src/lib/auth.ts` |
| 5.6 | withAdmin 中间件 | `src/lib/with-admin.ts` |
| 5.7 | withUser 中间件 | `src/lib/with-user.ts` |

---

## 6. 后台管理（Admin）

| 序号 | 名称 | 路径 |
|------|------|------|
| 6.1 | 管理布局 | `src/app/admin/layout.tsx` |
| 6.2 | 管理外壳 | `src/app/admin/_components/admin-shell.tsx` / `.module.css` |
| 6.3 | 管理侧边栏 | `src/app/admin/_components/admin-sidebar.tsx` / `.module.css` |
| 6.4 | 管理登录卡片 | `src/app/admin/_components/admin-login-card.tsx` / `.module.css` |
| 6.5 | 管理页头 | `src/app/admin/_components/admin-page-header.tsx` / `.module.css` |
| 6.6 | 共享样式 | `src/app/admin/_components/admin-shared.module.css` |
| 6.7 | CRUD Hook | `src/app/admin/_hooks/use-crud-list.ts` |
| 6.8 | 管理首页 | `src/app/admin/page.tsx` / `src/app/admin/page.module.css` |
| 6.9 | 管理加载 | `src/app/admin/loading.tsx` / `src/app/admin/loading.module.css` |
| 6.10 | 管理登录页 | `src/app/admin/login/page.tsx` |

### 6A. 文章管理

| 序号 | 名称 | 路径 |
|------|------|------|
| 6A.1 | 文章列表页 | `src/app/admin/posts/page.tsx` |
| 6A.2 | 文章列表客户端 | `src/app/admin/_components/post-management-client.tsx` / `.module.css` |
| 6A.3 | 文章编辑页 | `src/app/admin/posts/[id]/page.tsx` |
| 6A.4 | 文章编辑布局 | `src/app/admin/posts/[id]/layout.tsx` |
| 6A.5 | 文章编辑器 | `src/app/admin/posts/[id]/_components/post-editor.tsx` / `.module.css` |
| 6A.6 | Markdown 编辑器 | `src/app/admin/posts/[id]/_components/markdown-editor.tsx` / `.module.css` |
| 6A.7 | Markdown 预览 | `src/app/admin/posts/[id]/_components/markdown-preview.tsx` / `.module.css` |
| 6A.8 | 编辑器工具栏 | `src/app/admin/posts/[id]/_components/editor-toolbar.tsx` / `.module.css` |
| 6A.9 | 封面上传 | `src/app/admin/posts/[id]/_components/cover-upload.tsx` / `.module.css` |
| 6A.10 | 图片上传弹窗 | `src/app/admin/posts/[id]/_components/image-upload-dialog.tsx` / `.module.css` |
| 6A.11 | 元数据面板 | `src/app/admin/posts/[id]/_components/metadata-panel.tsx` / `.module.css` |
| 6A.12 | 文章 CRUD API | `src/app/api/admin/posts/route.ts` / `[id]/route.ts` |
| 6A.13 | 文章导出 API | `src/app/api/admin/posts/export/route.ts` |

### 6B. 分类与标签

| 序号 | 名称 | 路径 |
|------|------|------|
| 6B.1 | 分类标签管理页 | `src/app/admin/taxonomy/page.tsx` |
| 6B.2 | 分类标签管理组件 | `src/app/admin/taxonomy/_components/taxonomy-management.tsx` / `.module.css` |
| 6B.3 | 分类标签卡片 | `src/app/admin/taxonomy/_components/taxonomy-card.tsx` / `.module.css` |
| 6B.4 | 分类 API | `src/app/api/admin/categories/route.ts` / `[id]/route.ts` |
| 6B.5 | 标签 API | `src/app/api/admin/tags/route.ts` / `[id]/route.ts` |

### 6C. 用户管理

| 序号 | 名称 | 路径 |
|------|------|------|
| 6C.1 | 用户管理页 | `src/app/admin/users/page.tsx` |
| 6C.2 | 用户列表客户端 | `src/app/admin/_components/user-list-client.tsx` / `.module.css` |
| 6C.3 | 用户 API | `src/app/api/admin/users/route.ts` / `[id]/route.ts` |

### 6D. 上传管理

| 序号 | 名称 | 路径 |
|------|------|------|
| 6D.1 | 上传管理页 | `src/app/admin/uploads/page.tsx` |
| 6D.2 | 上传管理组件 | `src/app/admin/uploads/_components/upload-management.tsx` / `.module.css` |
| 6D.3 | 上传 API | `src/app/api/admin/upload/route.ts` |
| 6D.4 | 上传列表 API | `src/app/api/admin/uploads/route.ts` / `[id]/route.ts` |
| 6D.5 | 上传同步 API | `src/app/api/admin/uploads/sync/route.ts` |

### 6E. 数据统计

| 序号 | 名称 | 路径 |
|------|------|------|
| 6E.1 | 统计首页 | `src/app/admin/analytics/page.tsx` |
| 6E.2 | 统计面板 | `src/app/admin/analytics/_components/analytics-dashboard.tsx` / `.module.css` |
| 6E.3 | 站点管理页 | `src/app/admin/analytics/sites/page.tsx` |
| 6E.4 | 站点管理组件 | `src/app/admin/analytics/sites/_components/site-management.tsx` / `.module.css` |
| 6E.5 | 概览 API | `src/app/api/admin/analytics/overview/route.ts` |
| 6E.6 | 访问 API | `src/app/api/admin/analytics/visits/route.ts` |
| 6E.7 | 站点 API | `src/app/api/admin/analytics/sites/route.ts` |

### 6F. 系统设置

| 序号 | 名称 | 路径 |
|------|------|------|
| 6F.1 | 设置页 | `src/app/admin/settings/page.tsx` / `settings.module.css` |

---

## 7. 公共组件

### 7A. 前台展示组件（site/）

| 序号 | 名称 | 路径 |
|------|------|------|
| 7A.1 | 页面框架 | `src/components/site/app-frame.tsx` |
| 7A.2 | 公共外壳 | `src/components/site/public-chrome.tsx` / `.module.css` |
| 7A.3 | 文章视图 | `src/components/site/article-view.tsx` / `.module.css` |
| 7A.4 | Markdown 文章 | `src/components/site/markdown-article.tsx` / `.module.css` |
| 7A.5 | 代码块 | `src/components/site/code-block.tsx` / `.module.css` |
| 7A.6 | 内容图片 | `src/components/site/content-image.tsx` |
| 7A.7 | 文章卡片 | `src/components/site/post-card.tsx` / `.module.css` |
| 7A.8 | 项目卡片 | `src/components/site/project-card.tsx` / `.module.css` |
| 7A.9 | RSS 复制按钮 | `src/components/site/rss-copy-button.tsx` |

### 7B. 通用 UI 组件（ui/）

| 序号 | 名称 | 路径 |
|------|------|------|
| 7B.1 | 图标集 | `src/components/ui/icons.tsx` |
| 7B.2 | 弹窗 | `src/components/ui/dialog.tsx` / `.module.css` |
| 7B.3 | 确认弹窗 | `src/components/ui/confirm-dialog.tsx` / `.module.css` |
| 7B.4 | Toast | `src/components/ui/toast.tsx` / `.module.css` / `use-toast.ts` |
| 7B.5 | 数据表格 | `src/components/ui/data-table.tsx` / `.module.css` |
| 7B.6 | 分页 | `src/components/ui/pagination.tsx` / `.module.css` |
| 7B.7 | 选择器 | `src/components/ui/select.tsx` / `.module.css` |
| 7B.8 | 标签选择 | `src/components/ui/pill-select.tsx` / `.module.css` |
| 7B.9 | 文本输入 | `src/components/ui/text-input.tsx` / `.module.css` |
| 7B.10 | 提交按钮 | `src/components/ui/submit-button.tsx` / `.module.css` |
| 7B.11 | 幽灵按钮 | `src/components/ui/ghost-button.tsx` / `.module.css` |
| 7B.12 | 图标按钮 | `src/components/ui/icon-button.tsx` / `.module.css` |
| 7B.13 | 标签 | `src/components/ui/tag.tsx` / `.module.css` |
| 7B.14 | 文本链接 | `src/components/ui/text-link.tsx` / `.module.css` |
| 7B.15 | 状态页 | `src/components/ui/status-page.tsx` / `.module.css` |

---

## 8. 数据与工具层

| 序号 | 名称 | 路径 |
|------|------|------|
| 8.1 | 数据库连接 | `src/lib/db.ts` |
| 8.2 | API 响应工具 | `src/lib/api-response.ts` |
| 8.3 | HTTP 客户端 | `src/lib/http-client.ts` |
| 8.4 | 工具函数 | `src/lib/utils.ts` |
| 8.5 | 站点配置 | `src/lib/site.ts` |
| 8.6 | 文章数据层 | `src/lib/posts.ts` |
| 8.7 | 文章共享 | `src/lib/post-shared.ts` |
| 8.8 | 分类数据层 | `src/lib/categories.ts` |
| 8.9 | 标签数据层 | `src/lib/tags.ts` |
| 8.10 | 上传数据层 | `src/lib/uploads.ts` |
| 8.11 | 统计数据层 | `src/lib/analytics.ts` |
| 8.12 | 追踪站点 | `src/lib/track-sites.ts` |
| 8.13 | 地理定位 | `src/lib/geo.ts` |
| 8.14 | UA 解析 | `src/lib/ua.ts` |
| 8.15 | 旧链接重定向 | `src/lib/legacy-redirects.ts` |
| 8.16 | 采集 API | `src/app/api/collect/route.ts` |
| 8.17 | Nav 配置 | `src/lib/nav-config.ts` |
| 8.18 | Nav 数据库层 | `src/lib/nav-db.ts` |
| 8.19 | Nav 存储层 | `src/lib/nav-storage.ts` |
| 8.20 | Nav 认证 Hook | `src/hooks/use-auth.ts` |

---

## 9. 脚本

| 序号 | 名称 | 路径 |
|------|------|------|
| 9.1 | 上传同步脚本 | `src/scripts/sync-uploads.mjs` |

---

**总计：约 120 个文件，8 大模块。** 审查建议从全局基础开始，依次首页 → 博客 → 导航页 → 认证 → 后台管理 → 公共组件 → 数据层。
