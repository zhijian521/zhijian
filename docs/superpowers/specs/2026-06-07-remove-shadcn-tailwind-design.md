# 移除 shadcn/ui + Tailwind CSS 设计规格

> 目标：彻底移除 shadcn/ui 和 Tailwind CSS，全部替换为 CSS Modules + 自建组件 + 自建图标库。

---

## 设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| shadcn 组件替换策略 | 直接内联重写 | 减少中间抽象层，页面直接用原生 HTML + CSS Module |
| 图标处理 | 全部自建 | 彻底移除 lucide-react 依赖，与前台图标库统一 |
| 提交节奏 | 按阶段批量提交 | 4 个阶段，每阶段完成后 commit |

---

## 迁移阶段

### 阶段 1：迁移简单后台文件

建立 CSS Module 模式参考，不涉及 shadcn 组件替换。

| 文件 | 改动 |
|------|------|
| `admin/loading.tsx` | Tailwind → CSS Module |
| `admin/_components/admin-page-header.tsx` | Tailwind + Badge → CSS Module（Badge 改为 span） |
| `components/ui/confirm-dialog.tsx` | Tailwind 内联 → CSS Module |
| `admin/tags/_components/tag-management.tsx` | 图标尺寸 + lucide → CSS Module + 自建图标 |
| `admin/categories/_components/category-management.tsx` | 图标尺寸 + lucide → CSS Module + 自建图标 |

### 阶段 2：迁移复杂后台文件

消化 shadcn 组件引用，重写为 CSS Module。

| 文件 | 改动 |
|------|------|
| `admin/_components/post-editor-form.tsx` | 重写，内联替代 Button/Card/Input/Label/Textarea |
| `admin/_components/post-management-client.tsx` | 重写 + 自建图标 |
| `admin/_components/user-form.tsx` | 重写 + 自建图标 |
| `admin/_components/user-list-client.tsx` | 重写 + 自建图标 |
| `admin/page.tsx` | 重写 |
| `admin/settings/page.tsx` | 重写 + 自建图标 |

### 阶段 3：迁移 forbidden 页面

| 文件 | 改动 |
|------|------|
| `forbidden/page.tsx` | Tailwind → CSS Module |

### 阶段 4：清理收尾

| 操作 | 内容 |
|------|------|
| 删除 shadcn 组件 | badge/button/card/input/label/textarea/table.tsx |
| 删除配置 | components.json |
| 修改 globals.css | 删除 `@import 'tailwindcss'` + `@theme inline`，补 Preflight |
| 修改 postcss.config.mjs | 移除 `@tailwindcss/postcss` |
| 修改 utils.ts | `cn()` 移除 `twMerge` |
| 卸载依赖 | tailwindcss, @tailwindcss/postcss, tailwind-merge, class-variance-authority, lucide-react |
| 验证 | `npm run build` |

---

## 自建图标清单

后台使用的 lucide-react 图标，需提取为自建 SVG：

| 图标名 | 使用位置 |
|--------|----------|
| Plus | post-management-client |
| Pencil | tag-management, category-management, user-list-client |
| Trash2 | tag-management, category-management, post-management-client, user-list-client |
| Search | user-list-client |
| Settings | admin-sidebar |
| Users | admin-sidebar |
| FileText | admin-sidebar |
| ArrowLeft | user-form |
| ChevronDown | admin-sidebar |
| LogOut | admin-sidebar |
| LayoutDashboard | admin-sidebar |
| Tags | admin-sidebar |
| FolderOpen | admin-sidebar |

图标文件放置于 `src/components/ui/icons/`，与前台图标库合并。

---

## CSS Module 命名规范

- 文件命名：`<component>.module.css`
- 类名使用 camelCase：`.submitButton`, `.navIcon`
- 使用 CSS 变量：`var(--primary)`, `var(--muted-foreground)` 等
- 响应式断点与 Tailwind 一致：`sm:640px`, `md:768px`, `lg:1024px`

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| Preflight 重置丢失 | 在 globals.css 手动补齐 box-sizing/margin/padding 等重置 |
| 响应式断点不一致 | 使用 @media 精确匹配 Tailwind 断点值 |
| 样式遗漏 | 每阶段完成后 `npm run dev` 目测验证 |

---

*创建日期: 2026-06-07*
