# 知简项目 Review 审查报告

> 日期：2026-06-09（第二轮修复）
> 状态：已全部修复 ✅

---

## 本轮修复清单

| # | 问题 | 级别 | 修复方式 |
|---|------|------|----------|
| 1 | 概览页 `force-dynamic` + 静态数据矛盾 | 🔴 | 保持静态，更新注释说明待接入 API |
| 2 | 7 个未使用 theme 变量 | 🔴 | 删除 `--ring`/`--destructive-foreground`/`--destructive-subtle-soft`/`--card-foreground`/`--popover-foreground`/`--secondary-foreground`/`--font-ui` |
| 3 | 组件 size 默认值不统一 | 🟡 | 统一所有组件默认值为 `medium` |
| 4 | Dialog 缺焦点陷阱 | 🟡 | 添加 Tab/Shift+Tab 循环焦点 + 打开时自动聚焦首个元素 |
| 5 | Tag/Category 管理 90%+ 重复 | 🟡 | 提取 `useCrudList` hook 到 `_hooks/use-crud-list.ts` |
| 6 | `--accent`（绿）vs Tag `accent`（红）命名碰撞 | 🟡 | Tag variant 从 `accent` 改名为 `primary`，全局替换引用 |
| 7 | TextInput hasIcon 与 size 类冲突 | 🟡 | 重构 class 逻辑：`default` 不加额外 size class，icon 按尺寸选 `hasIcon`/`hasIconMedium`/`hasIconSmall` |
| 8 | 客户端 `console.error` 未替换 toast | 🟡 | 替换为 `toast.error()`，useCrudList hook 内也统一为 toast |
| 9 | `.labelDefault` 重复 `.label` 死 CSS | 🟢 | 删除 `.labelDefault`，default 不再加额外 label class |
| 10 | 各组件 `.defaultSize`/`.default` 重复基础样式 | 🟢 | 将 default 值合入 base class，删除冗余 CSS class |
| 11 | loading skeleton `border-radius: 2px` | 🟢 | 改为 `var(--radius)` |
| 12 | IconButton `variant="muted"` 与 default 一致 | 🟢 | 删除 muted variant，default 即是原 muted 效果 |
