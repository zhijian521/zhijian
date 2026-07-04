# 功能审查清单

> 按功能模块和页面逐一列出对应文件，便于逐项审查。

---

## 1. 前台博客

### 首页 `/`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/page.tsx` |
| 样式 | `src/app/page.module.css` |
| 数据层 | `src/lib/domain/posts.ts`, `src/lib/core/site.ts` |
| 共享组件 | `src/components/site/post-card.tsx`, `src/components/site/project-card.tsx`, `src/components/site/content-image.tsx`, `src/components/site/rss-copy-button.tsx` |
| UI 组件 | `src/components/ui/ghost-button.tsx`, `src/components/ui/icons.tsx`, `src/components/ui/text-link.tsx` |

### 文章列表 `/blog`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/blog/page.tsx` |
| 私有组件 | `src/app/blog/_components/blog-list-client.tsx` |
| 样式 | `src/app/blog/page.module.css` |
| 数据层 | `src/lib/domain/posts.ts`, `src/lib/domain/categories.ts`, `src/lib/domain/tags.ts`, `src/lib/domain/post-shared.ts`, `src/lib/core/site.ts` |
| 共享组件 | `src/components/site/content-image.tsx` |
| UI 组件 | `src/components/ui/dialog.tsx`, `src/components/ui/icons.tsx`, `src/components/ui/pagination.tsx`, `src/components/ui/tag.tsx` |

### 文章详情 `/blog/[slug]`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/blog/[slug]/page.tsx` |
| 私有组件 | `src/app/blog/[slug]/_components/article-footer-actions.tsx` |
| 加载态 | `src/app/blog/[slug]/loading.tsx` |
| 样式 | `src/app/blog/[slug]/page.module.css` |
| 数据层 | `src/lib/domain/posts.ts`, `src/lib/core/site.ts`, `src/lib/core/utils.ts` |
| 共享组件 | `src/components/site/article-view.tsx` → `src/components/site/markdown-article.tsx` → `src/components/site/code-block.tsx`, `src/components/site/content-image.tsx` |
| UI 组件 | `src/components/ui/icon-button.tsx`, `src/components/ui/icons.tsx` |

### RSS / Sitemap / Robots
| 功能 | 文件 | 数据层 |
|------|------|--------|
| RSS Feed | `src/app/feed.xml/route.ts` | `src/lib/domain/posts.ts`, `src/lib/core/site.ts` |
| Sitemap | `src/app/sitemap.ts` | `src/lib/domain/posts.ts`, `src/lib/core/site.ts` |
| Robots | `src/app/robots.ts` | `src/lib/core/site.ts` |

### 前台壳层
| 类型 | 文件 |
|------|------|
| 根布局 | `src/app/layout.tsx` |
| 全局样式 | `src/app/globals.css`, `src/app/theme.css`, `src/app/tokens.css` |
| 共享组件 | `src/components/site/app-frame.tsx`, `src/components/site/public-chrome.tsx` |
| 数据层 | `src/lib/core/site.ts`, `src/lib/core/utils.ts` |

### 错误/状态页
| 功能 | 文件 |
|------|------|
| 404 | `src/app/not-found.tsx` |
| 403 | `src/app/forbidden/page.tsx` |
| 全局加载 | `src/app/loading.tsx` |
| UI 组件 | `src/components/ui/status-page.tsx` |

---

## 2. 导航站 `/nav`

| 功能 | 文件 |
|------|------|
| 页面入口 | `src/app/nav/page.tsx` |
| Shell 容器 | `src/app/nav/_components/nav-shell.tsx` |
| 搜索 + 书签 | `src/app/nav/_components/search-section.tsx`, `search-bar.tsx`, `bookmark-bar.tsx`, `bookmark-link.tsx`, `bookmark-context-menu.tsx`, `favicon-img.tsx` |
| AI 对话 | `src/app/nav/_components/ai-section.tsx` |
| 备忘录 | `src/app/nav/_components/todo-section.tsx` |
| 笔记 | `src/app/nav/_components/note-section.tsx`, `note-markdown-editor.tsx` |
| 设置 + 鉴权 | `src/app/nav/_components/settings-section.tsx`, `auth-modal.tsx` |
| 拖拽工具 | `src/app/nav/_components/drag-utils.ts` |
| 共用样式 | `src/app/nav/_components/common-dialog-form.module.css` |
| 数据层 | `src/lib/domain/nav-config.ts`, `src/lib/domain/nav-storage.ts`, `src/lib/domain/nav-db.ts` |
| 鉴权 Hook | `src/hooks/use-auth.ts` |
| API (6 条) | `/api/nav/data`, `/api/nav/sync`, `/api/nav/bookmarks`, `/api/nav/todos`, `/api/nav/notes`, `/api/nav/chat` |

---

## 3. 后台管理 `/admin`

### 后台壳层
| 类型 | 文件 |
|------|------|
| 布局（鉴权） | `src/app/admin/layout.tsx` |
| Shell | `src/app/admin/_components/admin-shell.tsx` |
| 侧边栏 | `src/app/admin/_components/admin-sidebar.tsx` |
| 公共样式 | `src/app/admin/_components/admin-shared.module.css` |
| 后台全局样式 | `src/app/admin/globals.css` |
| 加载态 | `src/app/admin/loading.tsx` |

### 登录 `/admin/login`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/admin/login/page.tsx` |
| 登录卡片 | `src/app/admin/_components/admin-login-card.tsx` |
| API | `POST /api/auth/login` |
| 数据层 | `src/lib/core/auth.ts`, `src/lib/core/site.ts` |

### Dashboard `/admin`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/admin/page.tsx` |
| 样式 | `src/app/admin/page.module.css` |
| 数据层 | `src/lib/domain/posts.ts`, `src/lib/core/auth.ts`, `src/lib/core/site.ts` |
| 共享组件 | `src/components/modules/admin/admin-page-header/admin-page-header.tsx` |
| UI 组件 | `src/components/ui/data-table.tsx`, `src/components/ui/icons.tsx`, `src/components/ui/icon-button.tsx`, `src/components/ui/tag.tsx` |

### 文章管理 `/admin/posts`
| 类型 | 文件 |
|------|------|
| 列表页 | `src/app/admin/posts/page.tsx` |
| 列表组件 | `src/app/admin/_components/post-management-client.tsx` |
| 编辑器页 | `src/app/admin/posts/[id]/page.tsx` |
| 编辑器布局 | `src/app/admin/posts/[id]/layout.tsx` |
| 编辑器组件 | `src/app/admin/posts/[id]/_components/post-editor.tsx` |
| Markdown 编辑 | `src/app/admin/posts/[id]/_components/markdown-editor.tsx` |
| Markdown 预览 | `src/app/admin/posts/[id]/_components/markdown-preview.tsx` |
| 工具栏 | `src/app/admin/posts/[id]/_components/editor-toolbar.tsx` |
| 元数据面板 | `src/app/admin/posts/[id]/_components/metadata-panel.tsx` |
| 封面上传 | `src/app/admin/posts/[id]/_components/cover-upload.tsx` |
| API | `GET/POST /api/admin/posts`, `PATCH/DELETE /api/admin/posts/[id]`, `GET /api/admin/posts/export` |
| 数据层 | `src/lib/domain/posts.ts`, `src/lib/domain/categories.ts`, `src/lib/domain/tags.ts`, `src/lib/core/http-client.ts` |

### 分类标签 `/admin/taxonomy`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/admin/taxonomy/page.tsx` |
| 管理组件 | `src/app/admin/taxonomy/_components/taxonomy-management.tsx` |
| 卡片组件 | `src/app/admin/taxonomy/_components/taxonomy-card.tsx` |
| CRUD Hook | `src/app/admin/_hooks/use-crud-list.ts` |
| API | `GET/POST/PUT/DELETE /api/admin/categories`, `GET/POST/PUT/DELETE /api/admin/tags` |
| 数据层 | `src/lib/core/http-client.ts` |

### 图片管理 `/admin/uploads`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/admin/uploads/page.tsx` |
| 管理组件 | `src/app/admin/uploads/_components/upload-management.tsx` |
| API | `GET /api/admin/uploads`, `PATCH/DELETE /api/admin/uploads/[id]`, `POST /api/admin/upload`, `GET /api/admin/uploads/sync` |
| 数据层 | `src/lib/domain/uploads.ts`, `src/lib/core/http-client.ts` |

### 用户管理 `/admin/users`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/admin/users/page.tsx` |
| 列表组件 | `src/app/admin/_components/user-list-client.tsx` |
| API | `GET/POST /api/admin/users`, `GET/PUT/DELETE /api/admin/users/[id]` |
| 数据层 | `src/lib/core/auth.ts`, `src/lib/core/http-client.ts` |

### 网站统计 `/admin/analytics`
| 类型 | 文件 |
|------|------|
| 概览页 | `src/app/admin/analytics/page.tsx` |
| 仪表盘 | `src/app/admin/analytics/_components/analytics-dashboard.tsx` |
| 站点管理页 | `src/app/admin/analytics/sites/page.tsx` |
| 站点管理 | `src/app/admin/analytics/sites/_components/site-management.tsx` |
| API | `GET /api/admin/analytics/overview\|visits`, `DELETE /api/admin/analytics/data`, `GET/POST/PUT/DELETE /api/admin/analytics/sites` |
| 数据层 | `src/lib/domain/analytics.ts`, `src/lib/domain/track-sites.ts`, `src/lib/core/http-client.ts` |

### 设置 `/admin/settings`
| 类型 | 文件 |
|------|------|
| 页面 | `src/app/admin/settings/page.tsx` |
| 提交按钮 | `src/app/admin/settings/_components/settings-submit-button.tsx` |
| 数据层 | `src/lib/core/site.ts`, `src/lib/domain/seo-submit.ts` |

### Showcase `/admin/showcase`
| 类型 | 文件 |
|------|------|
| 入口 | `src/app/admin/showcase/page.tsx` |
| 组件预览 | `src/app/admin/showcase/components/page.tsx` |
| 图标预览 | `src/app/admin/showcase/icons/page.tsx` |
| 注册表 | `src/showcase/registry.ts`, `src/showcase/demos.tsx` |
| 图标源 | `src/components/ui/icons.tsx` |

### 文档中心 `/admin/docs`
| 类型 | 文件 |
|------|------|
| 功能文档列表 | `src/app/admin/docs/page.tsx` |
| 功能文档详情 | `src/app/admin/docs/[slug]/page.tsx` |
| 接口文档 | `src/app/admin/docs/api/page.tsx` |
| 接口列表 | `src/app/admin/docs/api/api-list.tsx` |
| 注册表 | `src/docs/features/_registry.ts`, `src/docs/api/_registry.ts` |

---

## 4. API 层 (33 条路由)

### posts（公开）
| 方法 | 路由 | 鉴权 | 文件 |
|------|------|------|------|
| GET | `/api/posts` | none | `src/app/api/posts/route.ts` |

### admin（后台管理）
| 方法 | 路由 | 鉴权 | 文件 |
|------|------|------|------|
| GET POST | `/api/admin/posts` | admin | `src/app/api/admin/posts/route.ts` |
| PATCH DELETE | `/api/admin/posts/[id]` | admin | `src/app/api/admin/posts/[id]/route.ts` |
| GET | `/api/admin/posts/export` | admin | `src/app/api/admin/posts/export/route.ts` |
| GET POST | `/api/admin/categories` | admin | `src/app/api/admin/categories/route.ts` |
| PUT DELETE | `/api/admin/categories/[id]` | admin | `src/app/api/admin/categories/[id]/route.ts` |
| GET POST | `/api/admin/tags` | admin | `src/app/api/admin/tags/route.ts` |
| PUT DELETE | `/api/admin/tags/[id]` | admin | `src/app/api/admin/tags/[id]/route.ts` |
| POST | `/api/admin/upload` | admin | `src/app/api/admin/upload/route.ts` |
| GET | `/api/admin/uploads` | admin | `src/app/api/admin/uploads/route.ts` |
| PATCH DELETE | `/api/admin/uploads/[id]` | admin | `src/app/api/admin/uploads/[id]/route.ts` |
| GET | `/api/admin/uploads/sync` | admin | `src/app/api/admin/uploads/sync/route.ts` |
| GET POST | `/api/admin/users` | admin | `src/app/api/admin/users/route.ts` |
| GET PUT DELETE | `/api/admin/users/[id]` | admin | `src/app/api/admin/users/[id]/route.ts` |
| POST | `/api/admin/seo/submit` | admin | `src/app/api/admin/seo/submit/route.ts` |
| GET | `/api/admin/analytics/overview` | admin | `src/app/api/admin/analytics/overview/route.ts` |
| GET | `/api/admin/analytics/visits` | admin | `src/app/api/admin/analytics/visits/route.ts` |
| DELETE | `/api/admin/analytics/data` | admin | `src/app/api/admin/analytics/data/route.ts` |
| GET POST PUT DELETE | `/api/admin/analytics/sites` | admin | `src/app/api/admin/analytics/sites/route.ts` |

### nav（导航站）
| 方法 | 路由 | 鉴权 | 文件 |
|------|------|------|------|
| GET | `/api/nav/data` | user | `src/app/api/nav/data/route.ts` |
| POST | `/api/nav/sync` | user | `src/app/api/nav/sync/route.ts` |
| PUT | `/api/nav/bookmarks` | user | `src/app/api/nav/bookmarks/route.ts` |
| PUT | `/api/nav/todos` | user | `src/app/api/nav/todos/route.ts` |
| PUT | `/api/nav/notes` | user | `src/app/api/nav/notes/route.ts` |
| GET PUT | `/api/nav/chat` | user | `src/app/api/nav/chat/route.ts` |

### auth（认证）
| 方法 | 路由 | 鉴权 | 文件 |
|------|------|------|------|
| POST | `/api/auth/login` | none | `src/app/api/auth/login/route.ts` |
| POST | `/api/auth/register` | none | `src/app/api/auth/register/route.ts` |
| GET | `/api/auth/me` | none | `src/app/api/auth/me/route.ts` |
| POST | `/api/auth/logout` | none | `src/app/api/auth/logout/route.ts` |

### ai（AI 对话）
| 方法 | 路由 | 鉴权 | 文件 |
|------|------|------|------|
| POST | `/api/ai/chat` | user | `src/app/api/ai/chat/route.ts` |
| GET | `/api/ai/models` | user | `src/app/api/ai/models/route.ts` |

### collect / util
| 方法 | 路由 | 鉴权 | 文件 |
|------|------|------|------|
| POST | `/api/collect` | none | `src/app/api/collect/route.ts` |
| GET | `/api/favicon` | none | `src/app/api/favicon/route.ts` |

---

## 5. 组件层

### `components/ui/` — 通用 UI 组件（15 个）
| 组件 | 文件 |
|------|------|
| DataTable | `src/components/ui/data-table.tsx` |
| Dialog | `src/components/ui/dialog.tsx` |
| ConfirmDialog | `src/components/ui/confirm-dialog.tsx` |
| GhostButton | `src/components/ui/ghost-button.tsx` |
| IconButton | `src/components/ui/icon-button.tsx` |
| Icons | `src/components/ui/icons.tsx` |
| Pagination | `src/components/ui/pagination.tsx` |
| PillSelect | `src/components/ui/pill-select.tsx` |
| Select | `src/components/ui/select.tsx` |
| StatusPage | `src/components/ui/status-page.tsx` |
| SubmitButton | `src/components/ui/submit-button.tsx` |
| Tag | `src/components/ui/tag.tsx` |
| TextInput | `src/components/ui/text-input.tsx` |
| TextLink | `src/components/ui/text-link.tsx` |
| Toast | `src/components/ui/toast.tsx` + `use-toast.ts` |

### `components/site/` — 前台展示组件（9 个）
| 组件 | 文件 |
|------|------|
| AppFrame | `src/components/site/app-frame.tsx` |
| PublicChrome | `src/components/site/public-chrome.tsx` |
| ArticleView | `src/components/site/article-view.tsx` |
| MarkdownArticle | `src/components/site/markdown-article.tsx` |
| CodeBlock | `src/components/site/code-block.tsx` |
| ContentImage | `src/components/site/content-image.tsx` |
| PostCard | `src/components/site/post-card.tsx` |
| ProjectCard | `src/components/site/project-card.tsx` |
| RssCopyButton | `src/components/site/rss-copy-button.tsx` |

### `components/modules/` — 业务模块组件（1 个）
| 组件 | 文件 |
|------|------|
| AdminPageHeader | `src/components/modules/admin/admin-page-header/admin-page-header.tsx` |

---

## 6. 数据层

### `lib/core/` — 基础设施（9 个）
| 文件 | 职责 |
|------|------|
| `src/lib/core/db.ts` | MySQL 连接池 |
| `src/lib/core/auth.ts` | 用户/密码/session 管理 |
| `src/lib/core/site.ts` | 站点元数据、路由、导航常量 |
| `src/lib/core/api-response.ts` | 统一响应 `{ code, data, message }` |
| `src/lib/core/http-client.ts` | 前端 fetch 封装 |
| `src/lib/core/with-admin.ts` | admin 鉴权 wrapper |
| `src/lib/core/with-user.ts` | user 鉴权 wrapper |
| `src/lib/core/utils.ts` | cn(), isNavItemActive(), toAbsoluteUrl() |
| `src/lib/core/legacy-redirects.ts` | 旧站 301 映射 |

### `lib/domain/` — 业务数据层（13 个）
| 文件 | 职责 |
|------|------|
| `src/lib/domain/posts.ts` | 文章 CRUD |
| `src/lib/domain/post-shared.ts` | 文章类型 + 日期工具 |
| `src/lib/domain/categories.ts` | 分类 CRUD |
| `src/lib/domain/tags.ts` | 标签 CRUD |
| `src/lib/domain/uploads.ts` | 图片上传管理 |
| `src/lib/domain/analytics.ts` | 统计仪表盘数据 |
| `src/lib/domain/track-sites.ts` | 统计站点管理 |
| `src/lib/domain/geo.ts` | IP → 地理信息 |
| `src/lib/domain/ua.ts` | User-Agent 解析 |
| `src/lib/domain/seo-submit.ts` | SEO 推送 |
| `src/lib/domain/nav-config.ts` | 导航类型 + 默认数据 |
| `src/lib/domain/nav-storage.ts` | 导航 localStorage + API 双写 |
| `src/lib/domain/nav-db.ts` | 导航 MySQL 持久化 |

---

## 7. 基础设施

| 分类 | 文件 |
|------|------|
| 样式 | `src/app/theme.css`, `src/app/tokens.css`, `src/app/globals.css` |
| 中间件 | `src/middleware.ts` |
| Hooks | `src/hooks/use-auth.ts` |
| 脚本 | `scripts/docs-check.mjs`, `scripts/sync-uploads.mjs` |
| 埋点 | `public/script.js` |
| 数据库 | `sql/init.sql`, `sql/seed-admin.mjs` |
| 规范 | `specs/` (9 篇) |
| 文档 | `src/docs/` (功能文档 + 接口文档 + registry) |

---

> 使用方式：按行逐项审查，勾选即通过。改代码后同步更新本文档。
