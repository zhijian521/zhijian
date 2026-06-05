# 后台文章 Markdown 编辑 + 图片上传 + 预览 实现方案

## 📌 进度总览

> **最后更新: 2026-06-05**

| 步骤 | 内容 | 状态 |
|------|------|------|
| 第 1 步 | 共享 Markdown 渲染组件 | ✅ 已完成 — `src/components/site/markdown-article.tsx`（CSS Modules 版，非 Tailwind） |
| 第 2 步 | 改造博客文章页 | ✅ 已完成 — `blog/[slug]/page.tsx` 使用 `<MarkdownArticle content={content} />` |
| 第 3 步 | Markdown 编辑器组件 | ❌ 未开始 — MDXEditor 未安装 |
| 第 4 步 | 图片上传 API | ❌ 未开始 |
| 第 5 步 | 改造文章编辑表单 | ❌ 未开始 — 仍用旧 `<Textarea>` |
| 第 6 步 | HTTP Client 适配 multipart | ❌ 未开始 |

**关键差异**：实际实现与原方案有以下不同：
- 组件命名为 `MarkdownArticle` 而非 `MarkdownBody`
- 使用 CSS Modules 而非 Tailwind 内联类名
- 博客详情页使用静态 MD 文件数据源 (`static-posts.ts`) 而非数据库
- `rehype-highlight` 未安装

---

## 📌 现状分析

| 项目 | 当前状态 |
|---|---|
| 文章内容字段 | `MEDIUMTEXT`，注释为"文章正文（Markdown）"，存储层无需改动 |
| 编辑器 | 普通 `<Textarea>`，无 Markdown 编辑能力 |
| 图片上传 | 不存在，无上传 API、无 multipart 处理 |
| 预览 | 不存在，博客详情页内容为硬编码 HTML |
| Markdown 渲染 | 不存在，`splitPostContent()` 仅按双换行拆分段落 |
| `@tailwindcss/typography` | 未安装，`prose prose-stone prose-lg` 类名无效 |

---

## 🏗️ 整体架构

```
┌─────────────────────────────────────────────┐
│          共享 Markdown 渲染组件               │
│         src/components/markdown-body.tsx     │
│                                              │
│  ┌─ react-markdown + remark-gfm ──────────┐ │
│  │  自定义 components 覆盖默认渲染：        │ │
│  │  h2 → 左红线+衬线标题                   │ │
│  │  h3 → 衬线标题                          │ │
│  │  blockquote → 红线+米白背景+斜体        │ │
│  │  ul/ol → 上下边框+红色圆点              │ │
│  │  p → 正文排版                           │ │
│  │  img → 响应式图片+圆角                  │ │
│  │  code → 代码高亮                        │ │
│  └────────────────────────────────────────┘ │
└──────────┬──────────────────┬───────────────┘
           │                  │
    ┌──────▼──────┐   ┌──────▼──────┐
    │  后台预览    │   │  博客文章页  │
    │  (弹窗/面板) │   │  (公开页面)  │
    └─────────────┘   └─────────────┘
```

**核心原则：编辑预览样式 = 博客文章展示样式，两者共用同一套 Markdown 渲染组件。**

---

## 📦 需要安装的依赖

```bash
# Markdown 编辑器（推荐 MDXEditor）
npm install @mdxeditor/editor

# Markdown 渲染（预览 + 博客文章页共用）
npm install react-markdown remark-gfm rehype-highlight

# Tailwind Typography（可选，提供基础 prose 排版）
npm install @tailwindcss/typography
```

### 编辑器选型对比

| 编辑器 | 优点 | 缺点 | 适合场景 |
|---|---|---|---|
| **MDXEditor** (推荐) | React 原生、所见即所得+源码模式切换、插件丰富（图片/表格/代码块）、活跃维护 | 包体较大 | 需要所见即所得体验 |
| ByteMD | 字节出品、轻量、插件化、有图片上传插件 | 社区较小 | 偏好分屏预览 |
| Milkdown | 基于 ProseMirror、插件化、Markdown 优先 | 学习曲线稍高 | 需要高度定制 |

---

## 🔧 实现步骤

### 第 1 步：共享 Markdown 渲染组件 ✅ 已完成

> 实际实现：`src/components/site/markdown-article.tsx` + `markdown-article.module.css`
> 使用 CSS Modules 样式（非 Tailwind 内联），配合 `react-markdown` + `remark-gfm` 渲染。

**原方案**（以下代码仅供参考，以实际文件为准）：

这是整个方案的核心——后台预览和博客文章页共用这一个组件。

```tsx
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// 自定义各元素的渲染，复用博客现有视觉风格
const components = {
  h1: ({ children }: any) => (
    <h1 className="mt-12 border-l-4 border-[var(--primary)] pl-6 font-serif text-4xl text-[var(--foreground)]">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="mt-12 border-l-4 border-[var(--primary)] pl-6 font-serif text-3xl text-[var(--foreground)]">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="mt-10 font-serif text-2xl text-[var(--foreground)]">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="mt-8 font-serif text-xl text-[var(--foreground)]">
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="text-base leading-8 text-[var(--foreground)]">{children}</p>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="my-10 border-l-2 border-[var(--primary)] bg-[var(--muted)] px-8 py-6 font-serif text-xl italic leading-9 text-[var(--muted-foreground)]">
      {children}
    </blockquote>
  ),
  ul: ({ children }: any) => (
    <ul className="my-8 space-y-4 border-y border-[var(--border)] py-6 list-none">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="my-8 space-y-4 border-y border-[var(--border)] py-6 list-decimal pl-6">
      {children}
    </ol>
  ),
  li: ({ children, ordered, index }: any) => (
    <li className="flex items-start gap-3">
      {!ordered && <span className="mt-1 text-[var(--primary)]">•</span>}
      <span className="text-base leading-8 text-[var(--foreground)]">{children}</span>
    </li>
  ),
  img: ({ src, alt }: any) => (
    <figure className="my-8">
      <img
        src={src}
        alt={alt || ''}
        className="mx-auto rounded-lg max-w-full h-auto"
        loading="lazy"
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--primary)] underline underline-offset-4 hover:opacity-80 transition-opacity"
    >
      {children}
    </a>
  ),
  code: ({ inline, className, children }: any) => {
    if (inline) {
      return (
        <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--primary)]">
          {children}
        </code>
      )
    }
    return (
      <code className={className}>{children}</code>
    )
  },
  pre: ({ children }: any) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-[#1d1b20] p-4 text-sm leading-6 text-[#e6efe5]">
      {children}
    </pre>
  ),
  table: ({ children }: any) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse border border-[var(--border)]">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border border-[var(--border)] bg-[var(--muted)] px-4 py-2 text-left font-semibold text-[var(--foreground)]">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-[var(--border)] px-4 py-2 text-[var(--foreground)]">
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-10 border-t border-[var(--border)]" />
  ),
}

interface MarkdownBodyProps {
  content: string
  className?: string
}

export function MarkdownBody({ content, className }: MarkdownBodyProps) {
  if (!content) {
    return (
      <p className="text-[var(--muted-foreground)] italic">暂无内容</p>
    )
  }

  return (
    <div className={className || 'mx-auto max-w-3xl'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

**博客视觉风格对照表（来自现有 blog/[slug]/page.tsx）：**

| 元素 | 现有样式 | MarkdownBody 对应 |
|---|---|---|
| H2 | `border-l-4 border-[var(--primary)] pl-6 font-serif text-3xl` | ✅ 已复用 |
| H3 | `font-serif text-3xl` | ✅ 已复用 |
| 正文 | `text-base leading-8 text-[var(--foreground)]` | ✅ 已复用 |
| 引用块 | `border-l-2 border-[var(--primary)] bg-[var(--muted)] px-8 py-6 font-serif text-xl italic` | ✅ 已复用 |
| 列表 | `border-y border-[var(--border)] py-6` + 红色圆点 | ✅ 已复用 |
| 主色 | `--primary: #9f000f`（深红） | ✅ 通过 CSS 变量引用 |
| 衬线字体 | `--font-serif: Noto Serif SC` | ✅ 通过 CSS 变量引用 |

---

### 第 2 步：改造博客文章页，使用 MarkdownBody ✅ 已完成

> 实际实现：`blog/[slug]/page.tsx` 使用 `<MarkdownArticle content={content} />`，配合 `static-posts.ts` 从 MD 文件加载内容。

**修改 `src/app/blog/[slug]/page.tsx`**

将硬编码的文章内容替换为动态 Markdown 渲染：

```tsx
// 之前（硬编码 + splitPostContent 拆分段落）：
// <div className='prose prose-stone prose-lg max-w-none'>
//   {splitPostContent(post.content).map((p, i) => (
//     <p key={i} className='text-base leading-8 text-[var(--foreground)]'>{p}</p>
//   ))}
// </div>

// 之后（使用共享 MarkdownBody 组件）：
import { MarkdownBody } from '@/components/markdown-body'

// 在文章正文区域：
<MarkdownBody content={post.content} />
```

**同时可以移除：**
- `splitPostContent` 的调用（该函数可保留，其他地方可能用到）
- 硬编码的 H2、blockquote、列表等静态 HTML
- 无效的 `prose prose-stone prose-lg max-w-none` 类名

---

### 第 3 步：Markdown 编辑器组件 ❌ 未开始

**新建 `src/app/admin/_components/markdown-editor.tsx`**

```tsx
'use client'

import { useCallback } from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  DiffSourceToggleWrapper,
  UndoRedo,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  imageUploadHandler?: (image: File) => Promise<string>
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  imageUploadHandler,
  className,
}: MarkdownEditorProps) {
  const handleImageUpload = useCallback(async () => {
    if (!imageUploadHandler) return ''

    // 创建隐藏的文件选择器
    return new Promise<string>((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const url = await imageUploadHandler(file)
          resolve(url)
        } else {
          resolve('')
        }
      }
      input.click()
    })
  }, [imageUploadHandler])

  return (
    <div className={className}>
      <MDXEditor
        markdown={value}
        onChange={onChange}
        className="admin-markdown-editor"
        plugins={[
          // 基础语法插件
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          linkPlugin(),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: 'JavaScript',
              ts: 'TypeScript',
              python: 'Python',
              css: 'CSS',
              html: 'HTML',
              json: 'JSON',
              bash: 'Bash',
              sql: 'SQL',
              txt: 'Text',
            },
          }),
          // 图片插件（集成上传）
          imagePlugin({
            imageUploadHandler: handleImageUpload,
          }),
          // 源码模式切换
          diffSourcePlugin({
            viewMode: 'rich-text',
            readOnlyDiff: false,
          }),
          // 工具栏
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <StrikeThroughSupSubToggles />
                <ListsToggle />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertThematicBreak />
                <InsertCodeBlock />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  )
}
```

**在 `src/app/globals.css` 中添加编辑器样式覆盖：**

```css
/* Markdown 编辑器样式覆盖 */
.admin-markdown-editor {
  --accentColor: var(--primary);
  --accentColor20: rgba(159, 0, 15, 0.2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  min-height: 480px;
}

.admin-markdown-editor [data-lexical-editor] {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  line-height: 1.75;
  padding: 1rem;
}

.admin-markdown-editor h1,
.admin-markdown-editor h2,
.admin-markdown-editor h3 {
  font-family: var(--font-serif);
}

.admin-markdown-editor h2 {
  border-left: 4px solid var(--primary);
  padding-left: 1.5rem;
}

.admin-markdown-editor blockquote {
  border-left: 2px solid var(--primary);
  background: var(--muted);
  padding: 1rem 2rem;
  font-style: italic;
}

.admin-markdown-editor [role="toolbar"] {
  border-bottom: 1px solid var(--border);
  background: var(--muted);
  border-radius: 0.5rem 0.5rem 0 0;
}
```

---

### 第 4 步：图片上传 API ❌ 未开始

**新建 `src/lib/upload.ts`（上传工具函数）**

```ts
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// 允许的图片类型
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

// 最大文件大小：5MB
const MAX_SIZE = 5 * 1024 * 1024

// 上传目录基础路径（相对于项目根目录）
const UPLOAD_DIR = 'public/uploads/images'

export interface UploadResult {
  url: string    // 访问 URL，如 /uploads/images/2026/06/xxx.jpg
  filename: string
  size: number
}

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `不支持的文件类型：${file.type}，仅支持 JPG/PNG/GIF/WebP/SVG`
  }
  if (file.size > MAX_SIZE) {
    return `文件大小超过限制：${(file.size / 1024 / 1024).toFixed(1)}MB，最大 5MB`
  }
  return null
}

export function generateFilePath(originalName: string): { filePath: string; url: string } {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')

  // 生成唯一文件名：时间戳 + UUID + 保留原始扩展名
  const ext = path.extname(originalName) || '.jpg'
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`

  const relativeDir = path.join(year, month)
  const filePath = path.join(process.cwd(), UPLOAD_DIR, relativeDir, filename)
  const url = `/uploads/images/${year}/${month}/${filename}`

  return { filePath, url }
}

export async function saveUploadedFile(file: File): Promise<UploadResult> {
  const error = validateImage(file)
  if (error) throw new Error(error)

  const { filePath, url } = generateFilePath(file.name)

  // 确保目录存在
  await mkdir(path.dirname(filePath), { recursive: true })

  // 写入文件
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  return {
    url,
    filename: file.name,
    size: file.size,
  }
}
```

**新建 `src/app/api/admin/upload/route.ts`（上传 API）**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'
import { saveUploadedFile } from '@/lib/upload'
import { apiSuccess, apiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    // 鉴权
    await requireAdminFromRequest(request)

    // 解析 multipart/form-data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(apiError('请选择要上传的文件'), { status: 400 })
    }

    const result = await saveUploadedFile(file)

    return NextResponse.json(apiSuccess(result))
  } catch (error: any) {
    return NextResponse.json(
      apiError(error.message || '上传失败'),
      { status: error.message?.includes('不支持') || error.message?.includes('超过') ? 400 : 500 }
    )
  }
}
```

---

### 第 5 步：改造文章编辑表单 ❌ 未开始

**修改 `src/app/admin/_components/post-editor-form.tsx`**

核心改动：
1. 将 `<Textarea>` 替换为 `<MarkdownEditor>`
2. 添加预览按钮 + 预览弹窗
3. 集成图片上传

```tsx
// 新增 import
import { MarkdownEditor } from './markdown-editor'
import { MarkdownBody } from '@/components/markdown-body'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

// 在组件内新增状态
const [previewOpen, setPreviewOpen] = useState(false)

// 图片上传处理函数
const handleImageUpload = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<{ url: string }>('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.url
}

// 替换原来的 Textarea
// 之前：
// <Textarea
//   className='admin-input min-h-[480px]'
//   id='content'
//   onChange={...}
//   value={form.content}
// />

// 之后：
<MarkdownEditor
  value={form.content}
  onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
  imageUploadHandler={handleImageUpload}
  className='min-h-[480px]'
/>

// 在表单操作区添加预览按钮
<Button
  type='button'
  variant='outline'
  onClick={() => setPreviewOpen(true)}
>
  <Eye className='mr-2 h-4 w-4' />
  预览
</Button>

// 预览弹窗
<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
  <DialogContent className='max-w-4xl max-h-[85vh] overflow-y-auto'>
    <DialogHeader>
      <DialogTitle>文章预览</DialogTitle>
    </DialogHeader>
    <MarkdownBody content={form.content} />
  </DialogContent>
</Dialog>
```

---

### 第 6 步：HTTP Client 适配 multipart ❌ 未开始

**修改 `src/lib/http-client.ts`**

当前 axios 实例默认 `Content-Type: application/json`，上传文件时需要让浏览器自动设置 `multipart/form-data`：

```ts
// 在 api.post 调用时，如果传入 FormData，需要删除默认的 Content-Type
// 方案 1：在 http-client 的请求拦截器中自动处理
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']  // 让浏览器自动设置 multipart boundary
  }
  return config
})

// 方案 2：上传时手动指定（更简单，推荐）
// 在 post-editor-form.tsx 中调用时：
const res = await api.post('/admin/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})
```

---

## 📁 完整文件改动清单

> **状态标注**：✅ 已完成 | ❌ 未开始

| 操作 | 文件路径 | 说明 | 状态 |
|---|---|---|---|
| **新建** | `src/components/site/markdown-article.tsx` | Markdown 渲染组件（CSS Modules 版） | ✅ |
| **新建** | `src/components/site/markdown-article.module.css` | Markdown 渲染样式 | ✅ |
| **新建** | `src/lib/static-posts.ts` | 静态文章数据层 | ✅ |
| **修改** | `src/app/blog/[slug]/page.tsx` | 使用 MarkdownArticle 动态渲染 | ✅ |
| **新建** | `src/app/admin/_components/markdown-editor.tsx` | MDXEditor 封装组件 | ❌ |
| **新建** | `src/app/api/admin/upload/route.ts` | 图片上传 API | ❌ |
| **新建** | `src/lib/upload.ts` | 上传工具函数 | ❌ |
| **修改** | `src/app/admin/_components/post-editor-form.tsx` | 替换 Textarea → MarkdownEditor | ❌ |
| **修改** | `src/app/globals.css` | 添加 MDXEditor 样式覆盖 | ❌ |
| **修改** | `src/lib/http-client.ts` | 适配 multipart/form-data | ❌ |

---

## 🎯 实现顺序建议

```
第 1 步：安装依赖
  npm install @mdxeditor/editor react-markdown remark-gfm rehype-highlight @tailwindcss/typography

第 2 步：新建 markdown-body.tsx（共享渲染组件）
  → 这是核心，后续所有功能都依赖它

第 3 步：改造 blog/[slug]/page.tsx，用 MarkdownBody 替换硬编码
  → 此时博客文章页已能正确渲染 Markdown 内容

第 4 步：新建 markdown-editor.tsx（编辑器组件）
  + globals.css 添加编辑器样式

第 5 步：新建 upload.ts + upload API route
  + http-client.ts 适配 multipart

第 6 步：改造 post-editor-form.tsx
  → 替换 Textarea → MarkdownEditor
  → 添加预览按钮 + 预览弹窗
  → 集成图片上传

第 7 步：样式微调 + 全流程测试
```

---

## ⚠️ 注意事项

### 图片上传安全
- 必须校验文件类型（白名单，不要用黑名单）
- 限制文件大小（建议 5MB）
- 生成随机文件名，不要使用用户原始文件名（防止路径遍历）
- API 必须经过 `requireAdminFromRequest()` 鉴权

### 生产环境图片存储
- 当前方案存储在 `public/uploads/images/`，适合小型站点
- 如果后续流量增大，建议迁移到 OSS（阿里云 OSS / 腾讯 COS / AWS S3）
- 迁移时只需修改 `src/lib/upload.ts` 中的 `saveUploadedFile` 函数，其他代码无需改动

### MDXEditor 注意事项
- MDXEditor 是客户端组件，必须加 `'use client'`
- 样式文件 `@mdxeditor/editor/style.css` 必须在组件中 import
- 编辑器值变化时 `onChange` 返回的是 Markdown 源码字符串，直接存入数据库即可
- 如果包体过大影响首屏加载，可以考虑动态导入：`const MarkdownEditor = dynamic(() => import('./markdown-editor'), { ssr: false })`

### 博客文章页兼容
- 改造 `blog/[slug]/page.tsx` 后，已有的硬编码文章内容需要转为 Markdown 格式存入数据库
- 可以写一个一次性迁移脚本，将现有 HTML 内容转为 Markdown（使用 `turndown` 库）

### Dialog 组件
- 预览弹窗使用 shadcn/ui 的 `Dialog` 组件
- 如果项目中尚未安装，需要执行：`npx shadcn@latest add dialog`
