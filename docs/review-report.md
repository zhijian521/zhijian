# 知简项目 Review 审查报告

> 日期：2026-06-08
> 状态：待修复

---

## 🔴 必须修复（Bug / 死代码 / 设计系统破坏）

| # | 问题 | 位置 |
|---|------|------|
| 1 | **PillSelect 双触发 onChange** — `<button onClick>` + 内部 `<input onChange>` 同时触发，每次点击调用两次回调 | `pill-select.tsx:23-34` |
| 2 | **硬编码主色 hover `#c41e3a`** — theme.css 缺 `--primary-hover` 变量，两处硬编码 | `submit-button.module.css`、`admin-sidebar.module.css` |
| 3 | **post-editor-form 用 Tailwind 色板** — `#e2e8f0`/`#0f172a`/`#475569`/`#059669`/`#dc2626` 完全违背暖纸色系，且 `border-radius: 0.75rem` 违反零圆角品牌语言 | `post-editor-form.module.css` |
| 4 | **user-form.tsx / user-form.module.css 是死代码** — 用户管理已改为弹窗内联表单，但 `users/new/page.tsx` 和 `users/[id]/page.tsx` 仍引用旧组件，两套表单逻辑并存 | `user-form.tsx` |
| 5 | **概览页 `force-dynamic` + 静态数据** — 矛盾配置，应改为静态或接入真实 API | `admin/page.tsx:9` |
| 6 | **settings.module.css 硬编码 `#fbf9f9`** — 应为 `var(--background)` | `settings.module.css:15,53,61` |
| 7 | **9 个 theme 变量从未使用** — `--ring`、`--destructive-foreground`、`--destructive-subtle-soft`、`--card`、`--card-foreground`、`--popover`、`--popover-foreground`、`--secondary-foreground`、`--font-ui` | `theme.css` |

---

## 🟡 建议修复（一致性 / 可维护性 / 无障碍）

| # | 问题 | 位置 |
|---|------|------|
| 1 | **组件 size 默认值不统一** — GhostButton→medium、SubmitButton→default、IconButton→small、Tag→medium、PillSelect→medium、TextInput→default | 各组件 |
| 2 | **Dialog 缺无障碍属性** — 无 `role="dialog"`、`aria-modal`、`aria-labelledby`、Escape 键关闭、焦点陷阱 | `dialog.tsx` |
| 3 | **Tag/Category 管理 90%+ 重复** — 仅 sort_order 和 API 端点不同，可提取 `useCrudList` hook | `tag-management.tsx`、`category-management.tsx` |
| 4 | **post-editor-form 未使用共享组件** — 手写 input/textarea/select，绕过了 TextInput/PillSelect 等 | `post-editor-form.tsx` |
| 5 | **用户"已禁用"用 Tag accent（红色强调）** — 禁用是负面状态，accent 有正面语义，建议用 outlined 或专门变体 | `user-list-client.tsx:208` |
| 6 | **Tag accent 用 `color-mix` 而非 `--primary-subtle-medium`** — 应统一用主题变量 | `tag.module.css:38` |
| 7 | **`--accent`（绿色）vs Tag `variant="accent"`（红色）** — 命名碰撞，容易混淆 | theme.css / tag.tsx |
| 8 | **25 处 `border-radius: 0` 应改为 `var(--radius)`** — 未来如需调圆角，只有 4 处用了变量会生效 | 多文件 |
| 9 | **admin-sidebar 3 处硬编码 `rgba(243,236,228,0.6)`** — 应为 `color-mix(in srgb, var(--secondary) 60%, transparent)` | `admin-sidebar.module.css` |
| 10 | **TextInput hasIcon 与 size 类冲突** — medium/small 尺寸同时应用 `hasIcon`(2.25rem) 和 `hasIconMedium`(2rem)，靠 CSS 顺序巧合生效 | `text-input.tsx:38` |
| 11 | **搜索表单缺 `role="search"` 和 `aria-label`** | user-list-client、post-management-client |
| 12 | **客户端 `console.error` 应替换为 toast** | 3 个管理页面 |

---

## 🟢 可选优化（打磨）

| # | 问题 |
|---|------|
| 1 | 5 处硬编码 serif 字体栈，应改用 `var(--font-serif)` |
| 2 | `.labelDefault` 重复 `.label` 的 font-size，是死 CSS |
| 3 | 各组件 `.defaultSize`/`.default` 重复基础样式的 padding/font-size |
| 4 | loading skeleton `border-radius: 2px` 应为 `var(--radius)`，且缺 `prefers-reduced-motion` |
| 5 | IconButton `variant="muted"` 与 default 视觉完全一致，可考虑删除或差异化 |

---

## 建议修复优先级

1. **PillSelect 双触发** → 功能 bug，一行可修
2. **post-editor-form Tailwind 残留** → 设计系统最大破坏点，色系和圆角都错
3. **死代码清理** → user-form + 未使用 theme 变量
4. **`--primary-hover` 提取** → 消除硬编码 `#c41e3a`
5. **Dialog 无障碍** → 影响所有弹窗交互