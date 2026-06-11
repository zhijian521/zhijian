# 文章管理重构设计文档

> 日期: 2026-06-10
> 状态: 已批准

---

## 概述

重构后台文章管理系统，包含：分栏预览 Markdown 编辑器、图片上传（封面图 + 文章内插图）、分类/标签关联、图片管理页面。本次范围仅限后台，公开博客页后续重构。

---

## 决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 编辑器交互 | 分栏预览（左编辑 + 右预览） | 写作体验接近 Typora，实时对照 |
| 图片存储 | 本地文件系统 `public/uploads/` | 零依赖，个人博客单机部署够用 |
| 分类/标签关联 | 字段存储（category_id + tags JSON） | 个人博客百级文章量，关联表过度设计 |
| 分类/标签关系 | 分类单选 + 标签多选 | 博客最常见模式 |
| 编辑器布局 | 独立全屏页面（脱离 AdminShell） | 最大化编辑空间 |
| 视图模式 | 三种：分栏 / 编辑 / 预览 | 灵活切换，适应不同写作阶段 |
| 文章内插图 | 粘贴/拖拽 + 工具栏按钮 | 操作最快，写作流畅度高 |
| 重构范围 | 仅后台，公开页后续 | 降低单次变更风险 |

---

## 一、页面路由与布局

### 路由

| 路由 | 说明 | 布局 |
|------|------|------|
| `/admin/posts` | 文章列表 | AdminShell |
| `/admin/posts/new` | 新建文章 | 独立全屏 |
| `/admin/posts/[id]` | 编辑文章 | 独立全屏 |
| `/admin/uploads` | 图片管理 | AdminShell |

### 视图模式

编辑器支持三种视图状态，一键切换：

**分栏模式（默认）**：
- 左侧：元数据面板（封面图/分类/标签/slug/状态/时间）
- 右上：标题 + 摘要输入
- 右下：Markdown 编辑区（左）+ 实时预览（右），中间虚线分隔

**编辑模式**：
- 左侧：元数据面板
- 右侧：标题 + 摘要 + 全宽编辑区

**预览模式**：
- 全屏预览，模拟公开页排版
- 显示封面图 + 分类 + 标签 + 日期 + 标题 + 正文渲染

顶部工具栏包含：返回列表、视图模式切换（编辑/分栏/预览）、保存草稿、发布。

---

## 二、数据库 Schema 变更

### 修改 `zhijian_blog_posts` 表

```sql
ALTER TABLE zhijian_blog_posts
  ADD COLUMN cover_image  VARCHAR(500) DEFAULT NULL COMMENT '封面图路径' AFTER content,
  ADD COLUMN alt_text     VARCHAR(200) DEFAULT NULL COMMENT '封面图 alt 描述' AFTER cover_image,
  ADD COLUMN category_id  INT UNSIGNED DEFAULT NULL COMMENT '分类ID' AFTER alt_text,
  ADD COLUMN tags         JSON DEFAULT NULL COMMENT '标签ID数组，如 [1,3,5]' AFTER category_id;
```

### 新增 `zhijian_blog_uploads` 表

```sql
CREATE TABLE IF NOT EXISTS zhijian_blog_uploads (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  filename    VARCHAR(255) NOT NULL COMMENT '哈希文件名',
  original    VARCHAR(255) NOT NULL COMMENT '原始文件名',
  path        VARCHAR(500) NOT NULL COMMENT '存储路径 /uploads/2026/06/xxx.jpg',
  size        INT UNSIGNED NOT NULL COMMENT '文件大小（字节）',
  mime        VARCHAR(50) NOT NULL COMMENT 'MIME 类型',
  alt         VARCHAR(200) DEFAULT '' COMMENT 'alt 描述',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_zhijian_blog_uploads_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Post 数据模型

```typescript
export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;     // 新增
  altText: string | null;        // 新增
  categoryId: number | null;     // 新增
  tags: number[];                // 新增
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string | null;
  // 查询时拼装的展示字段，不存数据库
  categoryName?: string;
  tagNames?: { id: number; name: string; slug: string }[];
}
```

---

## 三、API 设计

### 文章 API（修改现有）

**POST `/api/admin/posts`** — 创建草稿，扩展接受可选字段：
```typescript
{
  title?: string;
  // 其余字段使用默认值
}
```

**PATCH `/api/admin/posts/[id]`** — 更新文章，扩展字段：
```typescript
{
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  status?: 'draft' | 'published';
  publishedAt?: string | null;
  coverImage?: string | null;      // 新增
  altText?: string | null;         // 新增
  categoryId?: number | null;      // 新增
  tags?: number[];                 // 新增
}
```

**DELETE `/api/admin/posts/[id]`** — 删除文章（新增）

### 图片 API（新增）

**POST `/api/admin/upload`**
- Content-Type: multipart/form-data
- 请求：file（图片文件）
- 校验：jpg/png/gif/webp，≤ 5MB
- 响应：`{ id, filename, original, path, size, mime }`
- 存储：`public/uploads/YYYY/MM/<hash8>.<ext>`

**GET `/api/admin/uploads?page=1&pageSize=20`**
- 响应：`{ data: UploadItem[], total: number }`

**DELETE `/api/admin/uploads/[id]`**
- 删除数据库记录 + 物理文件
- 如被文章引用，确认弹窗提示但不阻止

---

## 四、前端组件设计

### 编辑器页面组件

```
src/app/admin/posts/[id]/
├── layout.tsx                      # 独立全屏布局（不套 AdminShell）
├── page.tsx                        # 服务端组件，加载文章数据
└── _components/
    ├── post-editor.tsx             # 编辑器主组件（视图模式切换 + 组装子组件）
    ├── post-editor.module.css
    ├── editor-toolbar.tsx          # 顶部工具栏
    ├── markdown-editor.tsx         # Markdown 编辑区
    ├── markdown-editor.module.css
    ├── markdown-preview.tsx        # 实时预览区（复用 MarkdownArticle）
    ├── markdown-preview.module.css
    ├── metadata-panel.tsx          # 右侧元数据面板
    ├── metadata-panel.module.css
    ├── cover-upload.tsx            # 封面图上传区
    ├── cover-upload.module.css
    ├── image-upload-dialog.tsx     # 图片上传弹窗
    └── image-upload-dialog.module.css
```

各组件职责：

**`post-editor.tsx`** — 管理视图模式状态 + 表单数据状态 + 自动保存 + 组装子组件布局

**`editor-toolbar.tsx`** — 返回按钮、视图模式切换（编辑/分栏/预览）、保存草稿、发布/取消发布

**`markdown-editor.tsx`** — textarea 增强版，mini 工具栏（B/I/H2/H3/链接/图片/代码），粘贴/拖拽图片上传，Tab 缩进

**`markdown-preview.tsx`** — 复用 MarkdownArticle，预览模式显示封面图+分类+标签+日期+标题+正文

**`metadata-panel.tsx`** — 封面图上传、分类 Select、标签多选、Slug 输入、状态 Select、发布时间

**`cover-upload.tsx`** — 拖拽/点击上传，缩略图预览，删除按钮

**`image-upload-dialog.tsx`** — Dialog 包裹，拖拽/点击上传，alt 文本输入，上传并插入按钮

### 图片管理页面组件

```
src/app/admin/uploads/
├── page.tsx
└── _components/
    ├── upload-management.tsx
    └── upload-management.module.css
```

功能：网格/列表视图、分页、复制 Markdown 语法、删除

### 复用现有组件

Select、Tag、Dialog、ConfirmDialog、Toast、Pagination、MarkdownArticle、TextInput、IconButton、GhostButton

---

## 五、数据流与交互细节

### 编辑器数据流

```
page.tsx (Server Component)
  → getPostById(id), listCategories(), listTags()
  → 传入 PostEditor

PostEditor (Client Component)
  useState: formData, viewMode, isSaving, isPublishing
  ├→ EditorToolbar
  ├→ MarkdownEditor (content, onContentChange, onInsertImage)
  ├→ MarkdownPreview (content + 元数据)
  └→ MetadataPanel
     └→ CoverUpload (coverImage, altText)
```

### 自动保存

- 内容变更后 3 秒防抖保存（草稿状态）
- 工具栏右侧显示保存状态（已保存 / 保存中... / 未保存）
- 未保存变更时 beforeunload 弹窗确认

### Slug 生成

- 新建文章时从标题自动生成（中文标题 → 时间戳兜底）
- 用户可手动编辑
- 校验：`^[a-z0-9-]+$`，≤ 120 字符

### 标签多选交互

- 搜索框过滤可选标签
- 点击标签添加到已选，点击 × 移除
- 「新建标签」按钮：内联输入框，创建后自动选中

### 文章内图片插入

三种触发方式：
1. 截图粘贴 → 自动上传 → 插入 `![](/uploads/xxx.jpg)`
2. 拖拽文件 → 同上
3. 工具栏 📷 按钮 → 弹窗上传 → 填 alt → 插入

上传状态：`![⏳上传中...]()` → 成功替换 → 失败 `![❌上传失败]()` 3 秒后清除

### 删除文章

列表页删除 → ConfirmDialog → DELETE API → toast 提示

### 删除图片

图片管理页删除 → ConfirmDialog（被引用时额外提示） → DELETE API（数据库 + 物理文件）

---

## 六、导航变更

在 `src/lib/site.ts` 的 `ADMIN_NAV_GROUPS` 中添加图片管理导航项：

```
观澜
  ├ 仪表盘
  └ 站点管理
博客
  ├ 文章管理    /admin/posts
  ├ 分类管理    /admin/categories
  ├ 标签管理    /admin/tags
  └ 图片管理    /admin/uploads     ← 新增
```

---

## 七、不在本次范围内

- 公开博客页接入数据库（后续重构）
- 图片压缩/缩略图生成
- 代码块语法高亮
- Markdown 编辑器语法自动补全
- 文章版本历史
