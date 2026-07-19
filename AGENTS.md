# AGENTS.md

> 本文档为 AI 助手（Claude、Cursor、Copilot 等）提供项目上下文。
> 详细项目文档见 `docs/00-文档导航.md`，开发规范见 `docs/03-开发规范/00-规范导航.md`，本文档定位为快速速查卡。

---

## 项目概述

**知简** — 个人博客 + 导航页 + 后台管理 + 站点监控（观澜），Next.js 15 单体全栈应用。

- **技术栈**: Next.js 15 + React 19 + TypeScript + CSS Modules + MySQL
- **视觉风格**: 全站「文人书斋」风格（朱砂红 + 宣纸米白 + 衬线标题 + 零圆角）
- **样式方案**: CSS Modules + `theme.css` 变量，无 Tailwind/shadcn
- **路径别名**: `@/*` → `./src/*`

| 类别     | 技术                           | 版本    |
| -------- | ------------------------------ | ------- |
| 框架     | Next.js (App Router)           | 15.3.x  |
| 运行时   | React                          | 19.1.0  |
| 语言     | TypeScript (strict)            | 5.8.3   |
| 数据库   | MySQL (mysql2/promise)         | 3.15.3  |
| 密码     | bcryptjs                       | 3.0.3   |
| 图标     | 自建 SVG（`icons.tsx`，51 个） | —       |
| 图表     | Recharts                       | ^3.8.1  |
| Markdown | react-markdown + remark-gfm    | ^10.1.0 |
| GeoIP    | ip2region                      | ^2.3.0  |

---

## 目录结构（精简）

```
src/
├── app/          # Next.js App Router（页面 + API）
│   ├── admin/    # 后台管理（layout.tsx 鉴权 + 壳层分发）
│   ├── blog/     # 公开博客
│   ├── nav/      # 导航站
│   └── api/      # 33 条 API route（posts/admin/nav/auth/ai/collect/favicon）
├── components/
│   ├── ui/       # 原子组件：button/input/dialog/tag/table...
│   ├── site/     # 前台展示：article/card/chrome/markdown...
│   └── modules/  # 业务组件：admin / home / blog / nav
├── lib/
│   ├── core/     # 基础设施（11 文件）：db/auth/api/http/pagination/site/toast/utils/with-*/legacy
│   └── domain/   # 业务数据层（14 文件）：posts/categories/tags/nav-*/uploads/analytics/github/...
├── hooks/        # use-auth.ts / use-crud-list.ts
└── showcase/     # 组件展示 registry
docs/             # 产品、技术和开发规范 Markdown
```

> 完整目录树见 `docs/03-开发规范/02-目录结构.md`，文件清单见 `docs/03-开发规范/11-功能审查清单.md`。

---

## 核心约定（速查）

### 组件模式：Server → Client

```
page.tsx (Server Component) → 获取数据 → Client Component → 交互
```

### API 路由：wrapper 消除模板

```typescript
export const POST = withAdmin(async (req, admin) => { ... });
export const GET = withUser(async (req, user) => { ... });
export async function GET() { ... }  // 公开
```

### 文件组织

- 组件：`components/<layer>/component-name.tsx` + `component-name.module.css`，按层平铺
- 数据层：`lib/core/`（基础设施）、`lib/domain/`（业务），`app → domain → core` 单向依赖
- 鉴权：`withAdmin`（403）/ `withUser`（401），禁止手写重复模板

### 样式

- 三层：`tokens.css`（间距/字号）→ `theme.css`（颜色/字体）→ 组件 CSS Module
- 颜色和可映射的间距/字号使用现有 token；像素精度、断点、边框宽度等例外按 `docs/03-开发规范/04-样式规范.md` 判断

> 完整规范见 `docs/03-开发规范/03-代码风格.md`、`04-样式规范.md`、`05-接口规范.md`、`06-数据层规范.md`、`07-组件规范.md`。

---

## 数据库 Schema

### zhijian_users

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
username VARCHAR(50) NOT NULL UNIQUE
email VARCHAR(255) NOT NULL UNIQUE
password_hash VARCHAR(255) NOT NULL
role ENUM('admin','user') DEFAULT 'user'
status ENUM('active','disabled') DEFAULT 'active'
created_at / updated_at DATETIME
```

### zhijian_blog_posts

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
slug VARCHAR(120) NOT NULL UNIQUE
title VARCHAR(200) NOT NULL / summary VARCHAR(500) NOT NULL
content MEDIUMTEXT NOT NULL
cover_image VARCHAR(500) / alt_text VARCHAR(200)
category_id INT UNSIGNED / tags JSON
status ENUM('draft','published') DEFAULT 'draft'
published_at / created_at / updated_at DATETIME
```

### zhijian_blog_categories / zhijian_blog_tags

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name VARCHAR(100) NOT NULL / slug VARCHAR(120) NOT NULL UNIQUE
sort_order INT DEFAULT 0 (categories only)
created_at / updated_at DATETIME
```

### zhijian_blog_uploads

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
filename VARCHAR(255) / original VARCHAR(255) / path VARCHAR(500)
size INT UNSIGNED / mime VARCHAR(50) / alt VARCHAR(200)
created_at DATETIME
```

### zhijian_track_sites

```sql
id VARCHAR(32) PRIMARY KEY  -- 8 位随机字符
name VARCHAR(200) / domain VARCHAR(255) UNIQUE
status ENUM('active','paused','deleted') DEFAULT 'active'
```

### zhijian_track_events（90 天保留）

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
site_id VARCHAR(32)  -- FK → track_sites
type ENUM('pageview','heartbeat','leave')
path / referrer / title / duration / screen / lang
is_new / is_session TINYINT(1)
visitor_id / session_id VARCHAR(64)
ip VARCHAR(45)  -- 遮蔽末位
country / region / city VARCHAR  -- ip2region 解析
ua / browser / os VARCHAR  -- UA 解析
created_at DATETIME
-- 索引: site+created, site+type+created, site+session+type, site+path, site+country
```

### zhijian_track_daily（日聚合加速）

```sql
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
site_id VARCHAR(32) / date DATE
path VARCHAR(500) DEFAULT ''  -- 空 = 整站汇总
pv / uv / bounce / avg_duration INT UNSIGNED
UNIQUE KEY (site_id, date, path)
```

### zhijian_nav_*（每用户一条 JSON）

四表结构相同：`id` / `user_id` FK / `data` JSON / `created_at` / `updated_at`，UNIQUE KEY 约束每用户一条。

- `zhijian_nav_bookmarks` — 书签
- `zhijian_nav_todos` — 备忘录
- `zhijian_nav_notes` — 笔记
- `zhijian_nav_chat` — AI 对话历史

> 完整建表语句见 `sql/init.sql`。

---

## 环境变量

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SCRIPT_URL=http://localhost:3000  # 分析脚本分发 URL
DATABASE_URL=mysql://user:password@host:3306/database
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=your-random-secret-string
```

---

## 常用命令

```bash
npm run dev           # 开发服务器 (localhost:3000)
npm run build         # 生产构建
npm run start         # 启动生产服务器
npm run check         # 统一完成标准（lint + typecheck + docs:check）
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run docs:check    # Markdown 链接与 API 文档校验
npm run format        # Prettier 格式化
npm run format:check  # 格式检查
npm run db:seed       # 初始化管理员账户
```

---

## Git 提交约定

宽松的 Conventional Commits：

```
feat(admin): 中文描述
fix: 中文描述
refactor: 中文描述
```

常用 scope: `admin`, `app`, `blog`, `home`, `chrome`, `icons`, `theme`, `基础组件`

---

## 关键文件速查

| 用途          | 文件                                                           |
| ------------- | -------------------------------------------------------------- |
| 主题变量      | `src/app/theme.css`                                            |
| 站点配置      | `src/lib/core/site.ts`                                         |
| API 响应格式  | `src/lib/core/api-response.ts`                                 |
| 认证系统      | `src/lib/core/auth.ts`                                         |
| Admin 鉴权    | `src/lib/core/with-admin.ts`                                   |
| User 鉴权     | `src/lib/core/with-user.ts`                                    |
| 工具函数      | `src/lib/core/utils.ts`                                        |
| 旧站重定向    | `src/lib/core/legacy-redirects.ts`                             |
| 数据库连接    | `src/lib/core/db.ts`                                           |
| HTTP 客户端   | `src/lib/core/http-client.ts`                                  |
| 文章 CRUD     | `src/lib/domain/posts.ts`                                      |
| 文章类型/日期 | `src/lib/domain/post-shared.ts`                                |
| 分类          | `src/lib/domain/categories.ts`                                 |
| 标签          | `src/lib/domain/tags.ts`                                       |
| 上传          | `src/lib/domain/uploads.ts`                                    |
| 统计          | `src/lib/domain/analytics.ts`                                  |
| 统计站点      | `src/lib/domain/track-sites.ts`                                |
| 地理定位      | `src/lib/domain/geo.ts`                                        |
| UA 解析       | `src/lib/domain/ua.ts`                                         |
| SEO 推送      | `src/lib/domain/seo-submit.ts`                                 |
| Nav 配置      | `src/lib/domain/nav-config.ts`                                 |
| Nav DB        | `src/lib/domain/nav-db.ts`                                     |
| Nav 存储      | `src/lib/domain/nav-storage.ts`                                |
| Git 提交记录  | `src/lib/domain/github.ts`                                     |
| 图标库        | `src/components/ui/icons.tsx`                                  |
| Toast         | `src/components/ui/toast.tsx` + `src/lib/core/toast-store.ts`  |
| Markdown 渲染 | `src/components/site/markdown-article.tsx`                     |
| 导航栏组件    | `src/components/site/site-header.tsx`                          |
| 标题组件      | `src/components/site/section-heading.tsx`                      |
| 后台壳        | `src/app/admin/layout.tsx` + `src/app/admin/layout.module.css` |
| 公开壳        | `src/components/site/public-chrome.tsx`                        |
| 埋点脚本      | `public/script.js`                                             |
| 数据库 Schema | `sql/init.sql`                                                 |
| 文档导航      | `docs/00-文档导航.md`                                          |
| 需求与功能    | `docs/01-产品文档/`                                            |
| 架构与接口    | `docs/02-技术文档/`                                            |
| 审查清单      | `docs/03-开发规范/11-功能审查清单.md`                          |
| 编码规范      | `docs/03-开发规范/`                                            |

---

## 注意事项

### 安全

- 所有 admin API 用 `withAdmin` 鉴权，user API 用 `withUser`
- 密码 bcrypt 12 rounds，Session Token HMAC-SHA256 签名
- SQL 查询参数化，禁止字符串拼接
- `/api/collect` 唯一无鉴权 API，有令牌桶限流（10次/秒/siteId）
- IP 用 ip2region 离线解析，存储时遮蔽末位

### 性能

- 数据库连接池限制 3 连接
- 数据库不可用时用 `FALLBACK_POSTS` 兜底
- 图片走 Next.js `<Image>` 优化，背景图用 WebP

### 兼容性

- Next.js 15 动态路由 `params` 是 `Promise`，需 `await`
- 表名 `zhijian_<模块>_<实体>` 前缀

### 开发约定

- 操作反馈用 `toast.success()` / `toast.error()`，禁止 `alert()`
- 列表接口统一 `{ data: T[], total: number }`
- 新增或优化功能时按 `docs/00-文档导航.md` 的影响矩阵，在同一提交中更新受影响的产品、技术或开发规范文档
- `npm run check` 是统一完成标准

---

## 扩展指南

### 添加后台页面

1. `src/app/admin/<name>/page.tsx`
2. 交互组件放 `src/components/modules/admin/`，数据层放 `src/lib/domain/`
3. 在 `lib/core/site.ts` 的 `ADMIN_NAV_GROUPS` 添加导航
4. API 用 `withAdmin` wrapper

### 添加 UI 组件

1. `src/components/ui/<name>.tsx` + `<name>.module.css`
2. 样式用 `var(--*)`，参考 `tag.tsx` / `ghost-button.tsx`

### 添加图标

1. 在 `icons.tsx` 的 `STROKE_ICONS`/`FILL_ICONS` 添加 key → SVG
2. 文件末尾添加 `export const XxxIcon = makeIcon('key')`

### 添加公开页面

1. `src/app/<name>/page.tsx` 负责路由编排，业务组件放 `src/components/modules/<domain>/`
2. 自动被 `PublicChrome` 包裹（`/admin` 路径除外）

---

_最后更新: 2026-07-19（同步当前目录、组件清单与文档体系）_
