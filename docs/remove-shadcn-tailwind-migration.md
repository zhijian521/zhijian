# 移除 shadcn/ui + Tailwind CSS 迁移方案

> 目标：移除 shadcn/ui 和 Tailwind CSS，使用 CSS Modules + 自建组件库替代，实现高度定制化的 UI。

---

## 📌 迁移范围评估

### 当前使用统计

| 类别 | 文件数 | 迁移难度 |
|------|--------|----------|
| shadcn/ui 组件（需重写为自建组件） | 8 | 🔴 高 — 每个都有 cva 变体逻辑 |
| 后台管理页面（使用 Tailwind） | 8 | 🟡 中 — 主要是布局+颜色类 |
| 公开页面（login/register/forbidden/blog 详情） | 5 | 🟡 中 — 表单布局+任意值 |
| 混合使用 CSS Modules + Tailwind 的文件 | 2 | 🟢 低 — 仅图标尺寸类 |
| globals.css 清理 | 1 | 🟢 低 — 删除 2 个 Tailwind 专属段 |
| 构建配置清理 | 2 | 🟢 低 — postcss.config + package.json |

**总计约 23 个文件需要改动。**

### shadcn/ui 组件使用分布

| 组件 | 使用方 |
|------|--------|
| Badge | `admin/page.tsx`, `admin-page-header.tsx`, `post-management-client.tsx` |
| Button | `post-editor-form.tsx` |
| Card | `post-editor-form.tsx` |
| Input | `post-editor-form.tsx`, `post-management-client.tsx` |
| Label | `post-editor-form.tsx` |
| Table | **未使用**（可删除） |
| Tabs | `post-management-client.tsx` |
| Textarea | `post-editor-form.tsx` |

**关键发现：shadcn/ui 仅在后台管理中使用，公开页面完全不依赖。**

### 已有 CSS Modules（无需迁移）

| 文件 | 行数 | 配对组件 |
|------|------|----------|
| `page.module.css` | 464 | 首页 |
| `blog/page.module.css` | 276 | 博客列表 |
| `public-chrome.module.css` | 166 | 公开站点壳 |
| `admin-sidebar.module.css` | 140 | 后台侧边栏 |
| `admin-login-card.module.css` | 257 | 登录卡片 |
| `admin-shell.module.css` | 12 | 后台壳 |
| `loading.module.css` | 55 | 加载动画 |

这些 CSS Modules 全部使用纯 CSS + `var(--*)` 变量，**不依赖 Tailwind**，迁移后可原样保留。

---

## 🏗️ 整体架构设计

### 自建组件库结构

```
src/
├── components/
│   ├── ui/                         # 自建组件库（替代 shadcn/ui）
│   │   ├── button.tsx
│   │   ├── button.module.css
│   │   ├── input.tsx
│   │   ├── input.module.css
│   │   ├── label.tsx
│   │   ├── label.module.css
│   │   ├── badge.tsx
│   │   ├── badge.module.css
│   │   ├── card.tsx
│   │   ├── card.module.css
│   │   ├── tabs.tsx
│   │   ├── tabs.module.css
│   │   ├── textarea.tsx
│   │   ├── textarea.module.css
│   │   ├── dialog.tsx              # 新增：弹窗组件
│   │   ├── dialog.module.css
│   │   └── index.ts                # 统一导出
│   └── site/                       # 公开站点组件（保持不变）
├── lib/
│   ├── utils.ts                    # clsx 保留，移除 twMerge
│   └── ...
```

### 样式体系

```
globals.css（全局变量 + 重置 + 工具类）
    ↓ CSS 自定义属性
    ↓
CSS Modules（每个组件/页面独立样式文件）
    ↓ var(--primary), var(--muted) 等
    ↓
body[data-app] 主题切换（保持现有机制）
```

**核心理念**：
- **全局**：仅放 CSS 变量、重置样式、不可拆分的工具类
- **组件**：每个组件一个 `.module.css`，零全局污染
- **主题**：通过 CSS 变量 + `body[data-app]` 切换，与 Tailwind 无关

---

## 📦 依赖变更

### 移除

```bash
npm uninstall tailwindcss @tailwindcss/postcss tailwind-merge class-variance-authority
```

| 包名 | 原用途 | 替代方案 |
|------|--------|----------|
| `tailwindcss` | CSS 框架 | CSS Modules |
| `@tailwindcss/postcss` | PostCSS 插件 | 移除（或替换为 postcss-preset-env） |
| `tailwind-merge` | 合并 Tailwind 类名 | 不再需要 |
| `class-variance-authority` | 组件变体 | CSS Module 类组合 |

### 保留

| 包名 | 用途 |
|------|------|
| `clsx` | 条件类名合并（替代 `cn()` 中的 `twMerge(clsx())`） |
| `lucide-react` | 图标库 |
| `axios` | HTTP 客户端 |

### 可选新增

```bash
npm install postcss-preset-env --save-dev   # CSS 现代特性降级（可选）
```

---

## 🔧 详细实现步骤

### 第 1 步：改造工具函数

**修改 `src/lib/utils.ts`**

```typescript
// 之前（依赖 tailwind-merge）
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 之后（纯 clsx）
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
```

**影响范围**：所有 `cn()` 调用点无需修改，行为等价。

---

### 第 2 步：改造 globals.css

**移除 Tailwind 专属代码，保留纯 CSS 部分：**

```css
/* ❌ 删除：Tailwind v4 入口 */
/* @import 'tailwindcss'; */

/* ❌ 删除：@theme inline 块（整个块，约 30 行） */
/* @theme inline { ... } */

/* ✅ 保留：所有 :root 变量 */
/* ✅ 保留：body[data-app='admin'] 主题切换 */
/* ✅ 保留：重置样式 (*, html, body, a, button/input...) */
/* ✅ 保留：滚动条样式 */
/* ✅ 保留：::selection */
/* ✅ 保留：.admin-* 工具类 */
/* ✅ 保留：@media (prefers-reduced-motion) */
```

**新增：全局重置补丁**（原来由 Tailwind Preflight 提供的重置，需手动补齐）

```css
/* Tailwind Preflight 等效重置 */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
}

body {
  line-height: 1.5;
}

img,
svg {
  display: block;
  max-width: 100%;
}

button,
[role='button'] {
  cursor: pointer;
}

[disabled] {
  cursor: default;
}
```

---

### 第 3 步：改造 PostCSS 配置

**修改 `postcss.config.mjs`**

```javascript
// 之前
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

// 之后（空配置或仅保留需要的插件）
const config = {
  plugins: {
    // 如需 CSS 现代特性降级，可加：
    // 'postcss-preset-env': { stage: 3 },
  },
};

export default config;
```

---

### 第 4 步：自建 UI 组件库

每个组件遵循统一模式：**组件文件 + CSS Module + Props 类型**。

#### 4.1 Button 组件

**`src/components/ui/button.tsx`**

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import styles from './button.module.css'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          styles.button,
          styles[variant],
          styles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
```

**`src/components/ui/button.module.css`**

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s, opacity 0.15s;
  cursor: pointer;
  border: none;
  outline: none;
}

.button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.button:disabled {
  pointer-events: none;
  opacity: 0.5;
}

/* --- Variants --- */

.default {
  background: var(--primary);
  color: var(--primary-foreground);
}
.default:hover {
  opacity: 0.9;
}

.destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
}
.destructive:hover {
  opacity: 0.9;
}

.outline {
  border: 1px solid var(--input);
  background: transparent;
  color: var(--foreground);
}
.outline:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}

.secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
}
.secondary:hover {
  opacity: 0.8;
}

.ghost {
  background: transparent;
  color: var(--foreground);
}
.ghost:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}

.link {
  background: transparent;
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.link:hover {
  opacity: 0.8;
}

/* --- Sizes --- */

.default {
  height: 2.25rem;
  padding: 0.5rem 0.875rem;
}

.sm {
  height: 2rem;
  padding: 0 0.75rem;
  font-size: 0.8125rem;
}

.lg {
  height: 2.75rem;
  padding: 0.5rem 2rem;
}

.icon {
  height: 2.25rem;
  width: 2.25rem;
  padding: 0;
}
```

#### 4.2 Input 组件

**`src/components/ui/input.tsx`**

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import styles from './input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(styles.input, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

**`src/components/ui/input.module.css`**

```css
.input {
  display: flex;
  height: 2.25rem;
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--input);
  background: transparent;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--foreground);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input::placeholder {
  color: var(--muted-foreground);
}

.input:focus-visible {
  outline: none;
  border-color: var(--ring);
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring);
}

.input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

#### 4.3 Label 组件

**`src/components/ui/label.tsx`**

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import styles from './label.module.css'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(styles.label, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Label.displayName = 'Label'

export { Label }
```

**`src/components/ui/label.module.css`**

```css
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: var(--foreground);
  margin-bottom: 0.375rem;
}

.label:has(+ :disabled) {
  opacity: 0.7;
}
```

#### 4.4 Textarea 组件

**`src/components/ui/textarea.tsx`**

```tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import styles from './textarea.module.css'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(styles.textarea, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
```

**`src/components/ui/textarea.module.css`**

```css
.textarea {
  display: flex;
  min-height: 5rem;
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--input);
  background: transparent;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--foreground);
  transition: border-color 0.15s, box-shadow 0.15s;
  resize: vertical;
}

.textarea::placeholder {
  color: var(--muted-foreground);
}

.textarea:focus-visible {
  outline: none;
  border-color: var(--ring);
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring);
}

.textarea:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

#### 4.5 Badge 组件

**`src/components/ui/badge.tsx`**

```tsx
import { cn } from '@/lib/utils'
import styles from './badge.module.css'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, styles[variant], className)}
      {...props}
    />
  )
}

export { Badge }
```

**`src/components/ui/badge.module.css`**

```css
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
  transition: color 0.15s;
}

.default {
  background: var(--primary);
  color: var(--primary-foreground);
}

.secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
}

.outline {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--foreground);
}
```

#### 4.6 Card 组件

**`src/components/ui/card.tsx`**

```tsx
import { cn } from '@/lib/utils'
import styles from './card.module.css'

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.card, className)} {...props} />
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.content, className)} {...props} />
}

export { Card, CardContent }
```

**`src/components/ui/card.module.css`**

```css
.card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--card-foreground);
}

.content {
  padding: 1.5rem;
}
```

#### 4.7 Tabs 组件

**`src/components/ui/tabs.tsx`**

```tsx
'use client'

import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import styles from './tabs.module.css'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

function Tabs({
  value: controlledValue,
  onValueChange,
  defaultValue = '',
  className,
  children,
  ...props
}: {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  className?: string
  children: React.ReactNode
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue ?? internalValue
  const handleChange = onValueChange ?? setInternalValue

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleChange }}>
      <div className={cn(styles.tabs, className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.list, className)} {...props} />
}

function TabsTrigger({
  value,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: selectedValue, onValueChange } = useTabs()
  const isActive = selectedValue === value

  return (
    <button
      className={cn(styles.trigger, isActive && styles.triggerActive, className)}
      onClick={() => onValueChange(value)}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger }
```

**`src/components/ui/tabs.module.css`**

```css
.tabs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: var(--radius);
  background: var(--muted);
  padding: 0.25rem;
}

.trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: calc(var(--radius) - 4px);
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: var(--muted-foreground);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;
}

.trigger:hover {
  color: var(--foreground);
}

.triggerActive {
  background: var(--background);
  color: var(--foreground);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
```

#### 4.8 统一导出

**`src/components/ui/index.ts`**

```typescript
export { Button, type ButtonProps } from './button'
export { Input, type InputProps } from './input'
export { Label, type LabelProps } from './label'
export { Textarea, type TextareaProps } from './textarea'
export { Badge, type BadgeProps } from './badge'
export { Card, CardContent } from './card'
export { Tabs, TabsList, TabsTrigger } from './tabs'
```

---

### 第 5 步：迁移各页面 Tailwind 类名

#### Tailwind → CSS Module 转换对照表

| Tailwind 写法 | CSS Module 写法 |
|---|---|
| `className='text-[var(--primary)]'` | `color: var(--primary)` |
| `className='bg-[var(--muted)]'` | `background: var(--muted)` |
| `className='border-[var(--border)]'` | `border-color: var(--border)` |
| `className='min-h-[480px]'` | `min-height: 480px` |
| `className='text-base leading-8'` | `font-size: 1rem; line-height: 2rem` |
| `className='mt-12 pl-6'` | `margin-top: 3rem; padding-left: 1.5rem` |
| `className='md:text-6xl'` | `@media (min-width: 768px) { font-size: 3.75rem }` |
| `className='hover:text-[var(--primary)]'` | `&:hover { color: var(--primary) }` |
| `className='focus-visible:outline-none'` | `&:focus-visible { outline: none }` |
| `className='disabled:opacity-50'` | `&:disabled { opacity: 0.5 }` |
| `className='group-hover:scale-105'` | `.group:hover & { transform: scale(1.05) }` |
| `className='sm:grid-cols-3'` | `@media (min-width: 640px) { grid-template-columns: repeat(3, 1fr) }` |
| `className='lg:grid-cols-[minmax(0,1.1fr)_320px]'` | `@media (min-width: 1024px) { grid-template-columns: minmax(0, 1.1fr) 320px }` |

#### 5.1 迁移 admin 页面

以 `post-editor-form.tsx` 为例（最复杂的后台页面）：

**迁移前**：
```tsx
<div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_320px]'>
  <div className='space-y-10'>
    <div>
      <Label className='admin-kicker' htmlFor='title'>标题</Label>
      <Input className='admin-input' id='title' ... />
    </div>
    ...
  </div>
  <aside className='space-y-10'>
    ...
  </aside>
</div>
```

**迁移后**：
```tsx
import styles from './post-editor-form.module.css'

<div className={styles.grid}>
  <div className={styles.main}>
    <div>
      <Label className={styles.kicker} htmlFor='title'>标题</Label>
      <Input className='admin-input' id='title' ... />
    </div>
    ...
  </div>
  <aside className={styles.sidebar}>
    ...
  </aside>
</div>
```

**`post-editor-form.module.css`**：
```css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: minmax(0, 1.1fr) 320px;
  }
}

.main {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.kicker {
  composes: kicker from global;  /* 复用 globals.css 的 .admin-kicker */
}
```

#### 5.2 迁移 blog 详情页

**`src/app/blog/[slug]/page.tsx`** 是 Tailwind 使用最密集的公开页面。

**迁移前**：
```tsx
<h1 className='font-serif text-4xl leading-tight text-[var(--foreground)] md:text-6xl'>
  {post.title}
</h1>
```

**迁移后**：
```tsx
import styles from './article.module.css'

<h1 className={styles.title}>{post.title}</h1>
```

**`src/app/blog/[slug]/article.module.css`**：
```css
.title {
  font-family: var(--font-serif);
  font-size: 2.25rem;
  line-height: 1.25;
  color: var(--foreground);
}

@media (min-width: 768px) {
  .title {
    font-size: 3.75rem;
  }
}

.subtitle {
  margin-top: 1.5rem;
  font-size: 1rem;
  line-height: 2rem;
  color: var(--muted-foreground);
}

@media (min-width: 768px) {
  .subtitle {
    width: 80%;
    font-size: 1.125rem;
  }
}

.heading2 {
  margin-top: 3rem;
  border-left: 4px solid var(--primary);
  padding-left: 1.5rem;
  font-family: var(--font-serif);
  font-size: 1.875rem;
  color: var(--foreground);
}

.heading3 {
  margin-top: 3rem;
  font-family: var(--font-serif);
  font-size: 1.875rem;
  color: var(--foreground);
}

.body {
  font-size: 1rem;
  line-height: 2rem;
  color: var(--foreground);
}

.blockquote {
  margin: 2.5rem 0;
  border-left: 2px solid var(--primary);
  background: var(--muted);
  padding: 1.5rem 2rem;
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-style: italic;
  line-height: 2.25rem;
  color: var(--muted-foreground);
}

.list {
  margin: 2rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 1.5rem 0;
  list-style: none;
}

.listItem {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.bullet {
  margin-top: 0.25rem;
  color: var(--primary);
}

.heroImage {
  margin: 2rem 0;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  overflow: hidden;
}

@media (min-width: 768px) {
  .heroImage {
    height: 500px;
  }
}

.imageGrid {
  margin: 3rem 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .imageGrid {
    grid-template-columns: 1fr 1fr;
  }
}

.tag {
  display: inline-block;
  border: 1px solid var(--border);
  background: var(--muted);
  border-radius: 2px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: var(--muted-foreground);
  transition: background-color 0.15s;
}

.tag:hover {
  background: var(--accent);
}
```

#### 5.3 迁移 login/register/forbidden 页面

这些页面结构简单，模式相同：创建 `.module.css`，将 Tailwind 类名搬入。

**示例 — `src/app/login/login-form.module.css`**：

```css
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.link a {
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.error {
  font-size: 0.875rem;
  color: var(--destructive);
}
```

---

### 第 6 步：处理混合使用文件

**2 个文件同时使用 CSS Modules + Tailwind**：

#### `src/app/admin/_components/admin-sidebar.tsx`

```tsx
// 之前：图标用 Tailwind 尺寸
<Icon className='h-4 w-4' />

// 之后：CSS Module 类名
<Icon className={styles.navIcon} />
```

```css
/* admin-sidebar.module.css 新增 */
.navIcon {
  height: 1rem;
  width: 1rem;
}
```

#### `src/app/page.tsx`

```tsx
// 之前：图标用 Tailwind 尺寸
<Icon className='h-4 w-4' />

// 之后：CSS Module 类名
<Icon className={styles.icon} />
```

```css
/* page.module.css 新增 */
.icon {
  height: 1rem;
  width: 1rem;
}
```

---

### 第 7 步：清理收尾

1. **删除 `src/components/ui/` 中所有旧的 shadcn 组件文件**（已被新的自建组件替代）
2. **删除 `components.json`**（shadcn/ui 配置文件，不再需要）
3. **卸载依赖**：
   ```bash
   npm uninstall tailwindcss @tailwindcss/postcss tailwind-merge class-variance-authority
   ```
4. **修改 `postcss.config.mjs`**：移除 `@tailwindcss/postcss` 插件
5. **修改 `globals.css`**：删除 `@import 'tailwindcss'` 和 `@theme inline` 块，补齐 Preflight 重置
6. **修改 `src/lib/utils.ts`**：`cn()` 中移除 `twMerge`，仅保留 `clsx`
7. **验证**：`npm run build` 确保无编译错误

---

## 📁 完整文件改动清单

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/components/ui/button.module.css` | Button 样式 |
| `src/components/ui/input.module.css` | Input 样式 |
| `src/components/ui/label.module.css` | Label 样式 |
| `src/components/ui/textarea.module.css` | Textarea 样式 |
| `src/components/ui/badge.module.css` | Badge 样式 |
| `src/components/ui/card.module.css` | Card 样式 |
| `src/components/ui/tabs.module.css` | Tabs 样式 |
| `src/components/ui/index.ts` | 统一导出 |
| `src/app/admin/_components/post-editor-form.module.css` | 文章编辑表单样式 |
| `src/app/admin/_components/post-management-client.module.css` | 文章管理列表样式 |
| `src/app/admin/_components/user-form.module.css` | 用户表单样式 |
| `src/app/admin/_components/user-list-client.module.css` | 用户列表样式 |
| `src/app/admin/admin-page.module.css` | 后台首页样式 |
| `src/app/admin/settings/settings.module.css` | 设置页样式 |
| `src/app/blog/[slug]/article.module.css` | 博客文章详情样式 |
| `src/app/login/login-form.module.css` | 登录表单样式 |
| `src/app/register/register-form.module.css` | 注册表单样式 |
| `src/app/forbidden/forbidden.module.css` | 403 页面样式 |

### 重写文件

| 文件 | 说明 |
|------|------|
| `src/components/ui/button.tsx` | 重写：移除 cva，使用 CSS Module |
| `src/components/ui/input.tsx` | 重写：移除 Tailwind，使用 CSS Module |
| `src/components/ui/label.tsx` | 重写：移除 Tailwind，使用 CSS Module |
| `src/components/ui/textarea.tsx` | 重写：移除 Tailwind，使用 CSS Module |
| `src/components/ui/badge.tsx` | 重写：移除 cva，使用 CSS Module |
| `src/components/ui/card.tsx` | 重写：移除 Tailwind，使用 CSS Module |
| `src/components/ui/tabs.tsx` | 重写：移除 Tailwind，使用 CSS Module |

### 修改文件

| 文件 | 说明 |
|------|------|
| `src/lib/utils.ts` | `cn()` 移除 twMerge，仅用 clsx |
| `src/app/globals.css` | 删除 Tailwind 入口 + @theme，补齐 Preflight 重置 |
| `postcss.config.mjs` | 移除 @tailwindcss/postcss 插件 |
| `package.json` | 卸载 4 个 Tailwind 相关依赖 |
| `src/app/admin/_components/post-editor-form.tsx` | Tailwind 类名 → CSS Module |
| `src/app/admin/_components/post-management-client.tsx` | Tailwind 类名 → CSS Module |
| `src/app/admin/_components/user-form.tsx` | Tailwind 类名 → CSS Module |
| `src/app/admin/_components/user-list-client.tsx` | Tailwind 类名 → CSS Module |
| `src/app/admin/_components/admin-sidebar.tsx` | 图标 Tailwind 尺寸 → CSS Module |
| `src/app/admin/_components/admin-page-header.tsx` | Tailwind 类名 → CSS Module |
| `src/app/admin/page.tsx` | Tailwind 类名 → CSS Module |
| `src/app/admin/settings/page.tsx` | Tailwind 类名 → CSS Module |
| `src/app/blog/[slug]/page.tsx` | Tailwind 类名 → CSS Module（最复杂） |
| `src/app/login/login-form.tsx` | Tailwind 类名 → CSS Module |
| `src/app/login/page.tsx` | Tailwind 类名 → CSS Module |
| `src/app/register/register-form.tsx` | Tailwind 类名 → CSS Module |
| `src/app/register/page.tsx` | Tailwind 类名 → CSS Module |
| `src/app/forbidden/page.tsx` | Tailwind 类名 → CSS Module |
| `src/app/page.tsx` | 图标 Tailwind 尺寸 → CSS Module |

### 删除文件

| 文件 | 说明 |
|------|------|
| `src/components/ui/table.tsx` | 未使用，直接删除 |
| `components.json` | shadcn/ui 配置，不再需要 |

---

## 🎯 实现顺序建议

```
第 1 步：工具层改造
  ├─ 修改 utils.ts（cn 移除 twMerge）
  ├─ 修改 postcss.config.mjs
  └─ 修改 globals.css（删除 Tailwind 入口 + @theme，补 Preflight）

第 2 步：自建 UI 组件库
  ├─ Button + CSS Module
  ├─ Input + CSS Module
  ├─ Label + CSS Module
  ├─ Textarea + CSS Module
  ├─ Badge + CSS Module
  ├─ Card + CSS Module
  ├─ Tabs + CSS Module
  └─ index.ts 统一导出

第 3 步：迁移后台管理页面（8 个文件）
  ├─ post-editor-form.tsx + .module.css
  ├─ post-management-client.tsx + .module.css
  ├─ user-form.tsx + .module.css
  ├─ user-list-client.tsx + .module.css
  ├─ admin-page-header.tsx（较小改动）
  ├─ admin-sidebar.tsx（仅图标尺寸）
  ├─ admin/page.tsx + .module.css
  └─ settings/page.tsx + .module.css

第 4 步：迁移公开页面（5 个文件）
  ├─ blog/[slug]/page.tsx + article.module.css（最复杂）
  ├─ login/login-form.tsx + .module.css
  ├─ login/page.tsx
  ├─ register/register-form.tsx + .module.css
  ├─ register/page.tsx
  ├─ forbidden/page.tsx + .module.css
  └─ page.tsx（仅图标尺寸）

第 5 步：清理收尾
  ├─ 删除 table.tsx、components.json
  ├─ 卸载 Tailwind 相关依赖
  └─ npm run build 验证
```

---

## ⚠️ 注意事项

### 迁移风险

- **逐文件迁移**：不要一次性全改，每迁移一个文件就验证一次，确保样式不丢失
- **响应式断点**：Tailwind 的 `sm:640px`、`md:768px`、`lg:1024px` 需要在 CSS Module 中用 `@media` 精确还原
- **Preflight 重置**：移除 Tailwind 后，原本由 Preflight 提供的 CSS 重置（box-sizing: border-box、margin: 0 等）会失效，必须在 globals.css 中手动补齐，否则样式会错乱
- **`admin-input` 等全局类**：这些类在 globals.css 中定义，与 CSS Module 不冲突，可继续在组件中通过 `className` 混用

### 组件设计原则

- **Props 保持兼容**：自建组件的 Props 接口尽量与原 shadcn/ui 一致（`variant`、`size`、`className`），减少调用方改动
- **forwardRef**：所有表单类组件（Button、Input、Label、Textarea）必须用 `forwardRef`，否则表单库无法获取 DOM 引用
- **CSS Module 类组合**：使用 `cn(styles.base, styles[variant])` 代替 cva 的变体系统，逻辑等价但零依赖
- **composes**：CSS Module 的 `composes` 可复用 globals.css 中的工具类（如 `composes: kicker from global`），避免重复定义

### 后续扩展

- 新增组件时，遵循 **组件.tsx + 组件.module.css** 的模式
- 复杂组件（如 Dialog、Select、Dropdown）可按需开发，不必一次性全部实现
- CSS 变量体系已经完善，新组件直接使用 `var(--primary)` 等变量即可自动适配主题

---

*最后更新: 2026-06-04*
