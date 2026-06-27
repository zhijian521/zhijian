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
| `--primary-hover` | `#c41e3a` | 主按钮按压态、侧边栏活跃项 hover | 略亮朱砂 |
| `--primary-subtle` | `color-mix(var(--primary) 8%, transparent)` | hover 背景、错误提示底色 | 朱砂淡底 |
| `--primary-subtle-soft` | `color-mix(var(--primary) 4%, transparent)` | 标签底色、formMessage 底色 | 朱砂微底 |
| `--primary-subtle-medium` | `color-mix(var(--primary) 6%, transparent)` | 页眉标签背景、标签 accent 底色 | 朱砂中底 |
| `--ring-subtle` | `color-mix(var(--primary) 10%, transparent)` | 输入框 focus box-shadow | 焦点环底色 |
| `--foreground` | `#1d1b20` | 正文墨色 | 浓墨 |
| `--muted-foreground` | `#6f655c` | 副文、描述 | 淡墨 |
| `--background` | `#fbf9f9` | 页面底色 | 温白纸 |
| `--highlight` | `#faf7f4` | 卡片 hover 底色 | 米白 |
| `--muted` | `#f6efe7` | 次级背景、侧边栏、表格头 | 米黄宣纸 |
| `--secondary` | `#f3ece4` | 次级按钮背景 | 旧纸色 |
| `--accent` | `#e6efe5` | 标签、hover 背景 | 青苔绿 |
| `--accent-foreground` | `#31483f` | 青苔深色 | — |
| `--border` | `#e7ddd1` | 分割线、边框 | 驼色 |
| `--input` | `#d9cbbc` | 输入框边框 | 深驼色 |
| `--destructive` | `#ba1a1a` | 错误/危险色 | — |
| `--destructive-subtle` | `color-mix(var(--destructive) 8%, transparent)` | danger 按钮 hover 背景 | 危险淡底 |
| `--card` | `rgba(255, 255, 255, 0.8)` | 卡片半透明背景 | — |
| `--popover` | `#ffffff` | 弹窗背景 | — |
| `--radius` | `0` | 全站零圆角 | — |
| `--font-serif` | `'Noto Serif SC', 'Songti SC', 'STSong', Georgia, serif` | 标题/大数字 | 衬线体 |
| `--font-sans` | `system-ui, -apple-system, 'PingFang SC', ...` | 正文/UI | 无衬线体 |
| `--selection` | `rgba(182, 72, 43, 0.18)` | 文字选中背景 | 赭色 |

**调性关键词**：朱砂 · 浓墨 · 宣纸 · 青苔 · 驼色 → 温润、文人、书斋

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
| 文章面包屑 | `font-serif`, `0.875rem`, `color: var(--muted-foreground)`, 当前项 `var(--foreground)` |
| 相关文章网格 | `grid-template-columns: repeat(3, 1fr)`, `gap: 1rem`, 卡片 `max-width: 56rem` |
| 文章卡片网格 | `grid-template-columns: repeat(3, 1fr)`, `gap: 1rem` |
| 项目卡片网格 | `grid-template-columns: repeat(2, 1fr)`, `gap: 1rem` |
| 后台侧边栏 | `width: 16rem (256px)`, `fixed`, `border-right: 1px solid var(--border)`, `bg: var(--muted)` |
| 后台主内容区 | `margin-left: 16rem`, `padding: 3rem`, `min-height: 100vh` |
| 后台指标卡片网格 | `grid-template-columns: repeat(3, 1fr)`, `gap: 1rem` |
| 后台编辑表单网格 | `grid: minmax(0, 1.1fr) 320px`（1024px+） |
| 文章编辑器页面 | 全屏独立页面（脱离 AdminShell），`height: 100vh` |
| 编辑器 — 分栏视图 | 左编辑 + 右预览 + 侧边元数据面板（320px） |
| 编辑器 — 编辑视图 | 全宽编辑区 |
| 编辑器 — 预览视图 | 全宽预览 |
| 编辑器顶部工具栏 | `height: 3rem`, `border-bottom: 1px solid var(--border)` |
| 编辑器 Mini 工具栏 | `bg: var(--muted)`, 按钮高度 `1.75rem` |
| 编辑器侧边元数据面板 | `width: 260px`, `border-right: 1px solid var(--border)` |
| 图片卡片网格 | `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))` |
| 图片卡片缩略图 | `height: 120px`, `object-fit: cover` |
| 封面图拖拽区 | `height: 8rem`, `border: 2px dashed var(--border)`, `bg: var(--muted)` |
| 封面图预览 | `height: 8rem`, `object-fit: cover` |
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
| 输入框 | `border: 1px solid var(--input)` | `border-color: var(--primary)`, `box-shadow: 0 0 0 3px var(--ring-subtle)` | — |

---

## 组件模式

### Tag 标签

| 类型 | 样式 |
|------|------|
| 强调(accent) | `border-radius: 0`, `border: 1px solid var(--primary)`, `bg: var(--primary-subtle-soft)`, `color: var(--primary)` |
| 默认(default) | `border-radius: 0`, `border: 1px solid var(--border)`, `bg: var(--muted)`, `color: var(--muted-foreground)` |

尺寸：mini / small / medium / default

### Select 下拉选择器

| 元素 | 样式 |
|------|------|
| 触发器 | `border: 1px solid var(--input)`, `bg: var(--background)`, `padding: 0.625rem 0.875rem`, 右侧箭头 `2rem` |
| 触发器 hover | `border-color: var(--primary)` |
| 触发器 focus/打开 | `border-color: var(--primary)`, `box-shadow: 0 0 0 3px var(--ring-subtle)` |
| 下拉面板 | `border: 1px solid var(--border)`, `bg: var(--popover)`, `box-shadow: 0 4px 12px rgba(0,0,0,0.08)`, `max-height: 240px` |
| 选项 | `padding: 0.5rem 0.875rem`, `border-left: 2px solid transparent` |
| 选项 hover | `bg: var(--highlight)` |
| 选项活跃 | `bg: var(--primary-subtle)`, `color: var(--primary)`, `border-left-color: var(--primary)` |
| 禁用态 | `opacity: 0.5`, `cursor: not-allowed` |

尺寸：small / medium / default

### IconButton 图标按钮

| 元素 | 样式 |
|------|------|
| 默认 | `width/height: 2.375rem`, `bg: var(--muted)`, `color: var(--muted-foreground)`, `border: 0` |
| hover | `color: var(--primary)`, `bg: var(--primary-subtle)` |
| danger hover | `color: var(--destructive)`, `bg: var(--destructive-subtle)` |
| 禁用 | `opacity: 0.3`, `cursor: not-allowed` |

尺寸：small (1.75rem) / medium (2rem) / default (2.375rem)
图标尺寸：small (0.875rem) / medium (1rem) / default (1.125rem)

### PillSelect 药丸单选

| 元素 | 样式 |
|------|------|
| 容器 | `display: inline-flex`, `border: 1px solid var(--border)`, `bg: var(--muted)` |
| 选项 | `padding: 0.625rem 0.875rem`, `color: var(--muted-foreground)`, `bg: transparent` |
| 选项 hover | `color: var(--foreground)` |
| 选项活跃 | `bg: var(--background)`, `color: var(--primary)`, `box-shadow: inset 0 -2px 0 var(--primary)` |

尺寸：small / medium / default

### DataTable 数据表格

| 元素 | 样式 |
|------|------|
| 整体 | `border: 1px solid var(--primary)`, `border-radius: 0` |
| 表头 | `bg: color-mix(var(--muted) 60%, var(--background))`（浅米黄） |
| 单元格边框 | `border-right: 1px solid var(--border)`（最后一列无） |
| 斑马纹 | 无（纯色背景） |
| 行悬停 | 无背景（保持干净） |
| 列对齐 | 支持 `left` / `center` / `right` |
| 固定宽列 | `width` + `min-width` + `max-width` 三重约束 |

### 面板

| 类型 | 样式 |
|------|------|
| 主面板 | `border: 1px solid var(--primary)`（朱砂红线） |
| 次级面板 | `border: 1px solid var(--border)`（驼色线） |

### 图片卡片

| 元素 | 样式 |
|------|------|
| 网格容器 | `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`, `gap: 1rem` |
| 卡片 | `border: 1px solid var(--border)`, `border-radius: 0` |
| 卡片 hover | `border-color: rgba(159,0,15,0.4)`, 朱砂渐显边框 |
| 缩略图 | `height: 120px`, `object-fit: cover`, `width: 100%` |
| 文件名 | `font-size: 0.8125rem`, `color: var(--muted-foreground)`, 单行截断 |
| 文件信息 | `font-size: 0.75rem`, `color: var(--muted-foreground)` |
| 删除按钮 | 卡片右上角，hover 时 `color: var(--destructive)` |

### 封面图上传区

| 元素 | 样式 |
|------|------|
| 拖拽区 | `height: 8rem`, `border: 2px dashed var(--border)`, `bg: var(--muted)`, `border-radius: 0` |
| 拖拽区 hover | `border-color: var(--primary)`, `bg: var(--primary-subtle-soft)` |
| 拖拽区图标 | `color: var(--muted-foreground)`, hover 时 `color: var(--primary)` |
| 预览图 | `height: 8rem`, `object-fit: cover`, `width: 100%` |
| 删除封面按钮 | 图片右上角覆盖，`bg: rgba(0,0,0,0.5)`, `color: #fff` |

### 标签多选交互

| 状态 | 样式 |
|------|------|
| 已选标签 | `border: 1px solid var(--primary)`, `bg: var(--primary-subtle-soft)`, `color: var(--primary)` |
| 可选标签 | `border: 1px solid var(--border)`, `bg: var(--muted)`, `color: var(--muted-foreground)` |
| 可选标签 hover | `border-color: var(--primary)`, `color: var(--primary)` |

### 编辑器布局

| 元素 | 样式 |
|------|------|
| 页面容器 | 全屏独立页面，`height: 100vh`, 脱离 AdminShell |
| 顶部工具栏 | `height: 3rem`, `border-bottom: 1px solid var(--border)`, `bg: var(--background)` |
| 工具栏按钮 | `height: 1.75rem`, `padding: 0 0.5rem`, `bg: var(--muted)` |
| 编辑区 | 等宽字体，`font-family: 'SF Mono', 'Menlo', monospace` |
| 预览区 | 同文章详情排版规格（H2 红线、衬线标题等） |
| 侧边元数据面板 | `width: 260px`, `border-left: 1px solid var(--border)`, `bg: var(--background)`, `overflow-y: auto` |
| 分栏视图 | 左编辑 + 右预览，中间可拖拽分割线 |

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
| `.panel` | 红线面板 |
| `.panel-muted` | 驼色线面板 |
| `.kicker` | 小标签 |
| `.title` | 衬线大标题 |
| `.copy` | 副文说明 |
| `.input` | 输入框样式 |
| `.stitch-card` | 指标卡片 |
| `.stitch-number` | 衬线大数字 |
| `.data-table` | 数据表格 |
| `.fixedWidth` | DataTable 固定宽列 |

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
| ❌ 不用默认蓝 | 选中色用 `var(--selection)` (`rgba(182,72,43,0.18)`) |
| ✅ 温白背景 | `#fbf9f9` 而非纯白 `#fff` |
| ✅ 极细滚动条 | 4px 宽，悬停变红 |
| ✅ 按钮输入等高 | `height: 2.25rem`，并排视觉对齐 |
| ✅ focus ring | `box-shadow: 0 0 0 3px var(--ring-subtle)`，主色 10% 透明度 |
| ✅ 全站统一 | 博客/后台/新页面共用一套变量和组件，不搞双轨 |

---

*最后更新: 2026-06-27（补充面包屑、相关文章网格布局；统一 itemCategory/relatedCardMeta 字号为 0.75rem）*
