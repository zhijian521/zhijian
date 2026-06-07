# 全站风格统一方案 — 以公开博客风格为基准

> 目标：消除「公开博客」与「管理后台」的双轨风格，全站统一为**文人书斋**风格。后台、未来新增页面全部使用同一套色彩、排版和组件体系。

---

## 📌 进度总览

> **最后更新: 2026-06-07**

| 步骤 | 内容 | 状态 |
|------|------|------|
| 第 1 步 | 简化 globals.css，删除 `body[data-app]` 覆盖 | ✅ 已完成 — 创建了 `theme.css` 替代 |
| 第 2 步 | 删除 AppFrame 主题切换逻辑 | ✅ 已完成 — `app-frame.tsx` 不再设置 `dataset.app`，`layout.tsx` 不再有 `data-app` |
| 第 3 步 | 修改后台侧边栏配色 | ✅ 自动完成 — 变量统一后 `var(--muted)` 自动变为 `#f6efe7` |
| 第 4 步 | 修改后台 Tailwind 硬编码色值 | ❌ 未开始 — 后台页面仍用 Tailwind 内联 |
| 第 5 步 | 统一 `--radius` 为 0 | ✅ 已完成 — `theme.css` 中 `--radius: 0` |
| 第 6 步 | 重命名 `.admin-*` 工具类 | ❌ 未开始 — 仍为 `.admin-panel` 等名称 |

---

## 📌 现状：两套风格并存的代价

| 问题 | 说明 |
|------|------|
| 维护成本翻倍 | 改一个颜色要改两套 CSS 变量，改一个组件要检查两种主题下是否正常 |
| 认知负担 | 开发时需要记住哪套变量在哪个 `data-app` 下生效 |
| 扩展困难 | 新增页面要先决定"属于哪套风格"，再按对应的规则写 |
| 风格割裂 | 用户从博客进入后台，视觉跳变明显 |

**统一后**：一套变量、一套组件、一套规则，任何新增页面直接用，无需选择。

---

## 🏗️ 统一后的视觉体系

### 统一色彩

以公开博客的温暖色调为基准，**删除后台专属的冷灰色变量**：

| 变量 | 统一值 | 说明 |
|------|--------|------|
| `--primary` | `#9f000f` | 朱砂红（全站唯一主色） |
| `--primary-foreground` | `#ffffff` | 主色上的白字 |
| `--foreground` | `#1d1b20` | 浓墨（正文） |
| `--muted-foreground` | `#6f655c` | 淡墨（副文） |
| `--background` | `#fbf9f9` | 温白纸 |
| `--muted` | `#f6efe7` | 米黄宣纸（次级背景、侧边栏、表格头） |
| `--secondary` | `#f3ece4` | 旧纸色（次级按钮） |
| `--accent` | `#e6efe5` | 青苔绿（标签、hover 背景） |
| `--accent-foreground` | `#31483f` | 青苔深色 |
| `--border` | `#e7ddd1` | 驼色边框 |
| `--input` | `#d9cbbc` | 深驼色（输入框边框） |
| `--ring` | `#c8161d` | 焦点环色 |
| `--destructive` | `#ba1a1a` | 错误/危险色 |
| `--card` | `rgba(255, 255, 255, 0.8)` | 卡片半透明背景 |
| `--radius` | `0` | 全站零圆角 |

### 统一删除的变量

这些变量曾在 `body[data-app='admin']` 下覆盖，统一后**全部删除**：

```
--border: #e3bebd    → 删除（统一用 #e7ddd1）
--input: #e3bebd     → 删除（统一用 #d9cbbc）
--muted: #f5f3f3     → 删除（统一用 #f6efe7）
--secondary: #e2dfde → 删除（统一用 #f3ece4）
--accent: #efeded    → 删除（统一用 #e6efe5）
--muted-foreground: #5b4040 → 删除（统一用 #6f655c）
--primary: #9e0027   → 删除（统一用 #9f000f）
```

### 统一字体

| 用途 | 字体 |
|------|------|
| 标题/大数字 | `var(--font-serif)` — `Noto Serif SC, Songti SC, STSong, Georgia, serif` |
| 正文/UI | `var(--font-sans)` — `system-ui, PingFang SC, Microsoft YaHei, sans-serif` |

### 统一交互规格

| 元素 | 规格 |
|------|------|
| 悬停上浮 | `translateY(-2px)`（全站统一，不再区分 1px/2px） |
| 悬停边框 | `rgba(159, 0, 15, 0.4)`（全站统一） |
| 按压回缩 | `scale(0.98)` |
| 过渡时长 | `0.2s ease` |
| 按钮高度 | `2.25rem`（与输入框等高） |
| 输入框高度 | `2.25rem` |
| 正文行高 | `1.85~2` |
| 边框圆角 | `0` |

---

## 🔧 实现步骤

### 第 1 步：简化 globals.css ✅ 已完成

> 实际实现比方案更彻底：创建了独立的 `src/app/theme.css`（133行）集中管理所有 CSS 变量，
> `globals.css` 通过 `@import './theme.css'` 引入。`body[data-app]` 覆盖块已全部删除。

**删除 `body[data-app='admin']` 和 `body[data-app='admin-login']` 整块覆盖**，让全站共享 `:root` 变量。

```css
/* ❌ 删除以下两整块 */
body[data-app='admin'] { ... }       /* 约 20 行 */
body[data-app='admin-login'] { ... } /* 约 20 行 */
```

**修改 `--radius` 值**：

```css
/* 之前 */
--radius: 0.75rem;

/* 之后 */
--radius: 0;
```

**保留不变**：
- `:root` 下的所有变量（已在上方确认为统一值）
- 全局重置样式
- 滚动条样式
- `::selection`
- `.admin-*` 工具类（后续可重命名为更通用的名字，但样式值不变）

### 第 2 步：删除 AppFrame 的主题切换逻辑 ✅ 已完成

> `app-frame.tsx` 已不再设置 `document.body.dataset.app`，`layout.tsx` 的 `<body>` 标签已移除 `data-app='public'` 属性。

**修改 `src/components/site/app-frame.tsx`**

```tsx
// 之前：根据路由切换 body[data-app]
useEffect(() => {
  const appName = pathname.startsWith('/admin/login')
    ? 'admin-login'
    : pathname.startsWith('/admin')
      ? 'admin'
      : 'public'
  document.body.dataset.app = appName
}, [pathname])

// 之后：删除这段逻辑，不再设置 body[data-app]
// body 不需要 data-app 属性，全站用同一套 :root 变量
```

**同时修改 `src/app/layout.tsx`**：

```tsx
// 之前
<body data-app='public'>

// 之后
<body>
```

### 第 3 步：修改后台侧边栏配色 ✅ 自动完成

> 删除 `body[data-app='admin']` 后，所有使用 `var(--muted)`、`var(--border)` 等变量的地方自动回退到 `:root` 值。
> `admin-sidebar.module.css` 中使用 `var(--muted)` 的代码无需修改，自动变为 `#f6efe7` 米黄色。

后台侧边栏原来是冷灰 (`#f5f3f3`)，统一后用温暖米黄 (`#f6efe7`)，边框从玫瑰灰改为驼色。

**修改 `src/app/admin/_components/admin-sidebar.module.css`**：

```css
/* 之前 */
.sidebar {
  background: var(--muted);  /* admin模式下是 #f5f3f3 冷灰 */
}

/* 之后 — 不需要改代码，因为 var(--muted) 统一后就是 #f6efe7 米黄 */
/* 删除 body[data-app='admin'] 覆盖后，var(--muted) 自动变为 #f6efe7 */
```

**实际上大部分 CSS Module 文件不需要改**，因为它们使用 `var(--muted)`、`var(--border)` 等变量，变量值统一后自动生效。

需要手动检查的后台专属硬编码色值：

| 文件 | 需替换的硬编码 | 替换为 |
|------|---------------|--------|
| `admin-sidebar.module.css` | `background: rgba(228, 226, 226, 0.55)` (hover) | `background: rgba(243, 236, 228, 0.6)` |
| `admin-login-card.module.css` | `background: #ffffff` (input) | `background: var(--background)` |
| `admin-login-card.module.css` | `color: #636262` | `color: var(--muted-foreground)` |
| `admin-login-card.module.css` | `box-shadow: 0 0 0 2px rgba(158, 0, 39, 0.1)` | `box-shadow: 0 0 0 2px rgba(159, 0, 15, 0.1)` |
| `admin-login-card.module.css` | `color: #999` | `color: var(--muted-foreground)` |
| `admin-login-card.module.css` | `background: #c41e3a` (hover) | `background: var(--primary); filter: brightness(1.1)` |

### 第 4 步：修改后台 Tailwind 类名中的硬编码色值 ❌ 未开始

> 后台页面仍大量使用 Tailwind 内联类名，此步骤将在 Tailwind → CSS Module 迁移时一并处理。

后台页面使用 Tailwind 类名时，直接写了 admin 模式下的颜色值，需要统一为公开风格：

| 原写法 (admin 冷色) | 替换为 (统一暖色) |
|---|---|
| `bg-[#f5f3f3]` | `bg-[var(--muted)]` |
| `bg-[#fbf9f9]` | `bg-[var(--background)]` |
| `border-[var(--primary)]` + `rgba(158,0,39,0.06)` | `border-[var(--primary)]` + `rgba(159,0,15,0.06)` |
| `hover:bg-[#f5f3f3]` | `hover:bg-[var(--muted)]` |
| `bg-[rgba(158,0,39,0.08)]` | `bg-[rgba(159,0,15,0.08)]` |
| `border-[rgba(158,0,39,0.5)]` | `border-[rgba(159,0,15,0.4)]` |
| `bg-[#c41e3a]` (按钮hover) | 统一用 CSS 变量或 `filter: brightness(1.1)` |

**注意**：如果同时进行 Tailwind → CSS Module 迁移，这一步会被迁移覆盖，无需单独处理。

### 第 5 步：统一 `--radius` 为 0 ✅ 已完成

> `theme.css` 中 `--radius: 0` 已生效。所有使用 `border-radius: var(--radius)` 的地方自动变为 0。

当前 `--radius: 0.75rem`，但项目实际设计语言是零圆角。统一为 0：

```css
:root {
  --radius: 0;
}
```

这样所有使用 `border-radius: var(--radius)` 的地方自动变为 0，无需逐个修改。

同时删除 `@theme inline` 中的 radius 计算（如果还在使用 Tailwind）：

```css
/* ❌ 删除 */
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 8px);
```

### 第 6 步：重命名工具类（可选但推荐） ❌ 未开始

> `.admin-*` 工具类仍保持原名，全局查找替换尚未执行。

`.admin-*` 工具类改为更通用的名字，因为它们不再是"后台专属"：

| 原名 | 新名 | 说明 |
|------|------|------|
| `.admin-panel` | `.panel` | 红线面板 |
| `.admin-panel-muted` | `.panel-muted` | 灰线面板 |
| `.admin-kicker` | `.kicker` | 小标签 |
| `.admin-title` | `.title` | 衬线大标题 |
| `.admin-copy` | `.copy` | 副文 |
| `.admin-input` | `.input` | 输入框样式 |
| `.admin-stitch-card` | `.stitch-card` | 指标卡片 |
| `.admin-stitch-number` | `.stitch-number` | 衬线大数字 |
| `.admin-table` | `.data-table` | 数据表格 |

**这是一个全局查找替换操作**，可以在项目范围内批量完成。

---

## 📁 文件改动清单

> **状态标注**：✅ 已完成 | ❌ 未开始

### 必须修改

| 文件 | 改动 | 状态 |
|------|------|------|
| `src/app/theme.css` | 🆕 新建：全站统一主题变量（替代 `:root` + `body[data-app]`） | ✅ |
| `src/app/globals.css` | 删除 `body[data-app]` 覆盖块；引入 `theme.css` | ✅ |
| `src/components/site/app-frame.tsx` | 删除 `body.dataset.app` 切换逻辑 | ✅ |
| `src/app/layout.tsx` | 删除 `<body data-app='public'>`，改为 `<body>` | ✅ |

### 需要检查硬编码色值

| 文件 | 改动 | 状态 |
|------|------|------|
| `src/app/admin/_components/admin-sidebar.module.css` | 替换冷灰硬编码为暖色 | ✅ 自动完成（变量统一后） |
| `src/app/admin/_components/admin-login-card.module.css` | 替换冷灰硬编码为暖色 | ❌ 待检查 |

### 可选（重命名工具类）

| 文件 | 改动 | 状态 |
|------|------|------|
| `src/app/globals.css` | `.admin-*` → `.panel` / `.kicker` 等通用名 | ❌ |
| 所有引用 `.admin-*` 类名的组件文件 | 同步替换类名 | ❌ |

### 无需修改

| 文件 | 改动 |
|------|------|
| `src/app/globals.css` | 删除 `body[data-app='admin']` 和 `body[data-app='admin-login']` 块；`--radius` 改为 0 |
| `src/components/site/app-frame.tsx` | 删除 `body.dataset.app` 切换逻辑 |
| `src/app/layout.tsx` | 删除 `<body data-app='public'>`，改为 `<body>` |

### 需要检查硬编码色值

| 文件 | 改动 |
|------|------|
| `src/app/admin/_components/admin-sidebar.module.css` | 替换冷灰硬编码为暖色 |
| `src/app/admin/_components/admin-login-card.module.css` | 替换冷灰硬编码为暖色 |

### 可选（重命名工具类）

| 文件 | 改动 |
|------|------|
| `src/app/globals.css` | `.admin-*` → `.panel` / `.kicker` 等通用名 |
| 所有引用 `.admin-*` 类名的组件文件 | 同步替换类名 |

### 无需修改

| 文件 | 原因 |
|------|------|
| `src/app/admin/_components/admin-shell.module.css` | 使用 `var(--border)` 等变量，自动适配 |
| `src/app/page.module.css` | 纯公开风格，无需改动 |
| `src/app/blog/page.module.css` | 纯公开风格，无需改动 |
| `src/components/site/public-chrome.module.css` | 纯公开风格，无需改动 |
| `src/app/loading.module.css` | 使用 `var(--primary)` 变量，自动适配 |

---

## 🎯 实现顺序

```
第 1 步：修改 globals.css
  ├─ 删除 body[data-app='admin'] 块
  ├─ 删除 body[data-app='admin-login'] 块
  └─ --radius 改为 0

第 2 步：移除主题切换机制
  ├─ 修改 app-frame.tsx（删除 dataset.app 逻辑）
  └─ 修改 layout.tsx（删除 data-app='public'）

第 3 步：修复后台硬编码色值
  ├─ admin-sidebar.module.css
  └─ admin-login-card.module.css

第 4 步：全局验证
  ├─ 逐页检查后台各页面视觉效果
  ├─ 确认输入框/按钮/卡片颜色正确
  └─ npm run build 确保无报错

第 5 步（可选）：重命名 .admin-* 工具类
  └─ 全局查找替换
```

---

## ⚠️ 注意事项

### 迁移影响范围小

这次统一**只改 CSS 变量和 3 个核心文件**，大部分组件因为使用 `var(--muted)`、`var(--border)` 等变量，删除 admin 覆盖后自动回退到 `:root` 值，无需逐个修改。

### 后台视觉变化

统一后后台的视觉变化：

| 元素 | 之前（冷灰） | 之后（暖色） |
|------|-------------|-------------|
| 侧边栏背景 | `#f5f3f3` 冷灰 | `#f6efe7` 米黄 |
| 边框色 | `#e3bebd` 玫瑰灰 | `#e7ddd1` 驼色 |
| 输入框边框 | `#e3bebd` 玫瑰灰 | `#d9cbbc` 深驼色 |
| 次级背景 | `#f5f3f3` 冷灰 | `#f3ece4` 旧纸色 |
| 强调色 | `#efeded` 近白灰 | `#e6efe5` 青苔绿 |
| 主色 | `#9e0027` 偏玫瑰 | `#9f000f` 朱砂 |
| 副文字 | `#5b4040` 褐偏红 | `#6f655c` 暖褐 |

**整体感受**：后台从"冷峻裁缝铺"变为"温暖书斋"，与博客气质一致。

### 未来新增页面

统一后，新增任何页面（不论功能）直接使用：

- `var(--primary)` 朱砂红
- `var(--muted)` 米黄背景
- `var(--border)` 驼色边框
- `var(--font-serif)` 衬线标题
- `.panel` / `.kicker` / `.stitch-card` 等工具类

无需选择"用哪套风格"，因为只有一套。

---

*最后更新: 2026-06-07*
