# 知简项目风格指南

> 本文档定义「知简」项目的统一视觉风格：文人书斋 · 水墨宣纸 · 温润雅致。
> 全站（博客、后台、未来新增页面）共用同一套色彩、排版和组件体系。

---

## 设计哲学

「知简」坚持**一套视觉风格贯穿全站**——无论公开博客还是管理后台，都是同一个文人书斋的气质。

- **文人书斋**：朱砂印章 · 浓墨宣纸 · 温润雅致
- 统一不是单调，而是品牌一致性：用户从博客进入后台，视觉感受连贯自然

---

## 色彩体系

### 主色板

| 变量 | 值 | 用途 | 感觉 |
|------|-----|------|------|
| `--primary` | `#9f000f` | 标题强调、边框、按钮 | 朱砂印章 |
| `--primary-foreground` | `#ffffff` | 主色上的白字 | — |
| `--foreground` | `#1d1b20` | 正文墨色 | 浓墨 |
| `--muted-foreground` | `#6f655c` | 副文、描述 | 淡墨 |
| `--background` | `#fbf9f9` | 页面底色 | 温白纸 |
| `--muted` | `#f6efe7` | 次级背景、侧边栏、表格头 | 米黄宣纸 |
| `--secondary` | `#f3ece4` | 次级按钮背景 | 旧纸色 |
| `--accent` | `#e6efe5` | 标签、hover 背景 | 青苔绿 |
| `--accent-foreground` | `#31483f` | 青苔深色 | — |
| `--border` | `#e7ddd1` | 分割线、边框 | 驼色 |
| `--input` | `#d9cbbc` | 输入框边框 | 深驼色 |
| `--ring` | `#c8161d` | 焦点环色 | 焦朱 |
| `--destructive` | `#ba1a1a` | 错误/危险色 | — |
| `--card` | `rgba(255, 255, 255, 0.8)` | 卡片半透明背景 | — |
| `--radius` | `0` | 全站零圆角 | — |

**调性关键词**：朱砂 · 浓墨 · 宣纸 · 青苔 · 驼色 → 温润、文人、书斋

### 特殊页面色

| 变量 | 值 | 用途 |
|------|-----|------|
| `--public-ink` | `#281715` | 首页正文（浓墨偏暖） |
| `--public-ink-soft` | `#5c403c` | 首页副文（淡墨偏暖） |
| `--public-paper` | `#f9f5f0` | 首页背景（米白） |

---

## 字体

| 用途 | 字体栈 |
|------|--------|
| 标题/装饰 | `'Noto Serif SC', 'Songti SC', 'STSong', Georgia, serif` |
| 正文/UI | `system-ui, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif` |
| 小标签(kicker) | 同正文，但 `letter-spacing: 0.3em`, `text-transform: uppercase` |

---

## 关键排版规格

| 元素 | 规格 |
|------|------|
| Hero 标题 | `font-serif`, `clamp(2.75rem, 6vw, 4.75rem)`, `line-height: 1.2`, `letter-spacing: 0.04em` |
| 区域标题 | `font-serif`, `2rem`, `line-height: 1.3`, `font-weight: 600` |
| 文章 H2 | `font-serif`, `1.875rem`, `border-left: 4px solid var(--primary)`, `padding-left: 1.5rem` |
| 文章 H3 | `font-serif`, `1.875rem`（无左侧红线） |
| 正文段落 | `1rem`, `line-height: 2rem`（即 line-height: 2） |
| 首字下沉 | `float: left`, `font-serif`, `2.5rem`, `color: var(--primary)` |
| 引用块 | `font-serif`, `1.25rem`, `italic`, `border-left: 2px solid var(--primary)`, `background: var(--muted)` |
| 列表 | `border-top/bottom: 1px solid var(--border)`, 红色圆点 `•` |
| 小标签(kicker) | `0.6875rem`, `letter-spacing: 0.3em`, `uppercase`, `color: var(--primary)` |
| 后台指标大数字 | `font-serif`, `2.75rem`, `line-height: 1` |

---

## 布局规格

| 场景 | 规格 |
|------|------|
| 首页内容区 | `max-width: 80rem`, `padding: 4rem 1.5rem 5rem` |
| 博客列表 | `max-width: 72rem`, 主栏+240px侧栏, `gap: 5rem` |
| 文章详情 | `max-width: 56rem (4xl)`，正文区 `max-width: 48rem (3xl)` |
| 文章卡片网格 | `grid-template-columns: repeat(3, 1fr)`, `gap: 1rem` |
| 项目卡片网格 | `grid-template-columns: repeat(2, 1fr)`, `gap: 1rem` |
| 后台侧边栏 | `width: 16rem (256px)`, `fixed`, `border-right: 1px solid var(--border)`, `bg: var(--muted)` |
| 后台主内容区 | `margin-left: 16rem`, `padding: 3rem`, `min-height: 100vh` |
| 后台指标卡片网格 | `grid-template-columns: repeat(3, 1fr)`, `gap: 1rem` |
| 后台编辑表单网格 | `grid: minmax(0, 1.1fr) 320px`（1024px+） |
| 登录卡片 | `max-width: 24rem (384px)`, `border-radius: 0`, `padding: 20px→28px` |
| 响应式断点 | 640px / 768px / 1024px |

---

## 交互规格

| 元素 | 正常 | 悬停 | 按压 |
|------|------|------|------|
| 主按钮(实色) | `bg: var(--primary)`, `color: #fff` | `filter: brightness(1.1)` | `scale(0.98)` |
| 描边按钮 | `border: 1px solid var(--primary)`, `bg: rgba(251,249,249,0.72)`, `color: var(--primary)` | `bg: var(--primary)`, `color: #fff` | `scale(0.98)` |
| 次级按钮 | `border: 1px solid var(--border)`, `bg: var(--secondary)`, `color: var(--foreground)` | `bg: var(--accent)` | — |
| 卡片 | `border: 1px solid var(--primary)` | `border-color: rgba(159,0,15,0.4)`, `translateY(-2px)` | — |
| 导航链接 | `color: var(--muted-foreground)` | `color: var(--foreground)`, `bg: color-mix(60% var(--secondary))` | — |
| 侧边栏导航项 | `color: var(--muted-foreground)` | `bg: rgba(243,236,228,0.6)` | — |
| 侧边栏导航项(活跃) | `border-right: 4px solid var(--primary)`, `bg: rgba(159,0,15,0.08)`, `color: var(--primary)` | — | — |
| 标签 | `border: 1px solid var(--border)`, `bg: var(--muted)` | `border-color: var(--primary)` | — |
| 输入框 | `border: 1px solid var(--input)` | `border-color: var(--primary)` | — |

---

## 组件模式

### Badge 标签

| 类型 | 样式 |
|------|------|
| 已发布 | `border-radius: 0`, `border: 1px solid var(--primary)`, `bg: rgba(159,0,15,0.06)`, `color: var(--primary)` |
| 草稿 | `border-radius: 0`, `border: 1px solid var(--border)`, `bg: var(--muted)`, `color: var(--muted-foreground)` |

### 表格

| 元素 | 样式 |
|------|------|
| 整体 | `border: 1px solid var(--primary)`, `border-radius: 0` |
| 表头 | `bg: var(--muted)`（米黄宣纸色） |
| 斑马纹 | `rgba(246,239,231,0.6)` |
| 行悬停 | `bg: var(--accent)`（青苔绿） |

### 面板

| 类型 | 样式 |
|------|------|
| 主面板 | `border: 1px solid var(--primary)`（朱砂红线） |
| 次级面板 | `border: 1px solid var(--border)`（驼色线） |

### 页面标题区

```
.kicker — 小标签（0.6875rem, letter-spacing: 0.3em, var(--primary)）
.title  — 衬线大标题（font-serif, 1.5rem, var(--foreground)）
.copy   — 副文说明（0.9375rem, var(--muted-foreground)）
```

---

## 工具类

| 类名 | 用途 |
|------|------|
| `.panel` | 红线面板（原 `.admin-panel`） |
| `.panel-muted` | 驼色线面板（原 `.admin-panel-muted`） |
| `.kicker` | 小标签（原 `.admin-kicker`） |
| `.title` | 衬线大标题（原 `.admin-title`） |
| `.copy` | 副文说明（原 `.admin-copy`） |
| `.input` | 输入框样式（原 `.admin-input`） |
| `.stitch-card` | 指标卡片（原 `.admin-stitch-card`） |
| `.stitch-number` | 衬线大数字（原 `.admin-stitch-number`） |
| `.data-table` | 数据表格（原 `.admin-table`） |

---

## 设计规则速查

| 规则 | 说明 |
|------|------|
| ❌ 不用圆角 | 全项目 `border-radius: 0`，矩形是品牌语言 |
| ✅ 红线作分割 | `1px solid var(--primary)` 是签名性元素 |
| ✅ 衬线作标题 | 所有标题/大数字用 `Noto Serif SC` |
| ✅ 微动反馈 | 悬停上浮 2px，按压回缩 `scale(0.98)` |
| ✅ 渐显边框 | 悬停时边框色渐变（不是突变） |
| ✅ 0.2s 过渡 | 所有交互统一 `0.2s ease` |
| ✅ 1.85~2 行高 | 正文留白充裕，适合中文阅读 |
| ❌ 不用默认蓝 | 选中色用赭色 `rgba(182,72,43,0.18)` |
| ✅ 温白背景 | `#fbf9f9` 而非纯白 `#fff` |
| ✅ 极细滚动条 | 4px 宽，悬停变红 |
| ✅ 按钮输入等高 | `height: 2.25rem`，并排视觉对齐 |
| ✅ 全站统一 | 博客/后台/新页面共用一套变量和组件，不搞双轨 |

---

*最后更新: 2026-06-04*
