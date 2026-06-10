# 文章管理重构 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 重构后台文章管理系统，实现分栏预览 Markdown 编辑器、图片上传（封面图 + 文章内插图）、分类/标签关联、图片管理页面。

**架构：** 编辑器页面独立全屏布局（脱离 AdminShell），三种视图模式（分栏/编辑/预览）。图片存储到本地 `public/uploads/` 目录，数据库记录元信息。分类/标签作为字段存储在文章表中（category_id + tags JSON）。

**技术栈：** Next.js 15 App Router, React 19, CSS Modules, mysql2/promise, react-markdown + remark-gfm

---

## 文件结构

### 新建文件

| 文件 | 职责 |
|------|------|
| `src/lib/uploads.ts` | 图片上传 lib 层：数据库 CRUD + 文件系统操作 |
| `src/app/api/admin/upload/route.ts` | 图片上传 API（POST） |
| `src/app/api/admin/uploads/route.ts` | 图片列表 API（GET） |
| `src/app/api/admin/uploads/[id]/route.ts` | 图片删除 API（DELETE） |
| `src/app/admin/posts/[id]/layout.tsx` | 编辑器独立全屏布局（不套 AdminShell） |
| `src/app/admin/posts/[id]/page.tsx` | 编辑文章服务端页面（重写） |
| `src/app/admin/posts/[id]/_components/post-editor.tsx` | 编辑器主组件（视图模式 + 状态管理） |
| `src/app/admin/posts/[id]/_components/post-editor.module.css` | 编辑器主组件样式 |
| `src/app/admin/posts/[id]/_components/editor-toolbar.tsx` | 顶部工具栏 |
| `src/app/admin/posts/[id]/_components/editor-toolbar.module.css` | 工具栏样式 |
| `src/app/admin/posts/[id]/_components/markdown-editor.tsx` | Markdown 编辑区 |
| `src/app/admin/posts/[id]/_components/markdown-editor.module.css` | 编辑区样式 |
| `src/app/admin/posts/[id]/_components/markdown-preview.tsx` | 实时预览区 |
| `src/app/admin/posts/[id]/_components/markdown-preview.module.css` | 预览区样式 |
| `src/app/admin/posts/[id]/_components/metadata-panel.tsx` | 右侧元数据面板 |
| `src/app/admin/posts/[id]/_components/metadata-panel.module.css` | 元数据面板样式 |
| `src/app/admin/posts/[id]/_components/cover-upload.tsx` | 封面图上传区 |
| `src/app/admin/posts/[id]/_components/cover-upload.module.css` | 封面图上传样式 |
| `src/app/admin/posts/[id]/_components/image-upload-dialog.tsx` | 图片上传弹窗 |
| `src/app/admin/posts/[id]/_components/image-upload-dialog.module.css` | 图片上传弹窗样式 |
| `src/app/admin/uploads/page.tsx` | 图片管理页面 |
| `src/app/admin/uploads/_components/upload-management.tsx` | 图片管理组件 |
| `src/app/admin/uploads/_components/upload-management.module.css` | 图片管理样式 |

### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `sql/init.sql` | 添加 ALTER TABLE（新增 4 字段）+ CREATE TABLE zhijian_blog_uploads |
| `src/lib/post-shared.ts` | Post 接口新增 coverImage/altText/categoryId/tags/categoryName/tagNames |
| `src/lib/posts.ts` | 扩展 CreatePostInput/UpdatePostInput，修改 SQL 查询适配新字段，新增 deletePostById |
| `src/lib/api-response.ts` | 新增 UPLOAD_NOT_FOUND 等 BizCode |
| `src/lib/site.ts` | APP_ROUTES 新增 adminUploads，ADMIN_NAV_GROUPS 新增图片管理导航项 |
| `src/app/api/admin/posts/route.ts` | POST 扩展接受新字段 |
| `src/app/api/admin/posts/[id]/route.ts` | PATCH 扩展新字段校验，新增 DELETE handler |
| `src/app/admin/posts/page.tsx` | 重写：接入真实 API，替换 MOCK_POSTS |
| `src/app/admin/_components/post-management-client.tsx` | 重写：接入真实 API，增加删除功能 |
| `src/app/admin/_components/post-management-client.module.css` | 可能微调 |
| `src/app/admin/posts/new/page.tsx` | 重写：创建草稿后跳转到编辑页 |
| `next.config.ts` | 添加 images.remotePatterns 或 localPatterns 配置（如需要） |

### 删除文件

| 文件 | 原因 |
|------|------|
| `src/app/admin/_components/post-editor-form.tsx` | 被 post-editor.tsx 替代 |
| `src/app/admin/_components/post-editor-form.module.css` | 被 post-editor.module.css 替代 |

---

## 任务 1：数据库 Schema 变更

**文件：**
- 修改：`sql/init.sql`

- [ ] **步骤 1：在 `sql/init.sql` 末尾（种子数据之前）添加 ALTER TABLE 和 CREATE TABLE**

在 `zhijian_blog_tags` 表 CREATE 之后、`zhijian_track_sites` 表之前，添加：

```sql
-- --------------------------------------------------------------------------
--  博客模块 - 文章表扩展字段
-- --------------------------------------------------------------------------
ALTER TABLE zhijian_blog_posts
  ADD COLUMN cover_image  VARCHAR(500) DEFAULT NULL COMMENT '封面图路径' AFTER content,
  ADD COLUMN alt_text     VARCHAR(200) DEFAULT NULL COMMENT '封面图 alt 描述' AFTER cover_image,
  ADD COLUMN category_id  INT UNSIGNED DEFAULT NULL COMMENT '分类ID' AFTER alt_text,
  ADD COLUMN tags         JSON DEFAULT NULL COMMENT '标签ID数组，如 [1,3,5]' AFTER category_id;

-- --------------------------------------------------------------------------
--  博客模块 - 图片上传记录表
-- --------------------------------------------------------------------------
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

- [ ] **步骤 2：手动执行 SQL 变更**

运行：`mysql -u root -p zhijian < sql/init.sql`（或手动执行 ALTER TABLE + CREATE TABLE 部分）

- [ ] **步骤 3：Commit**

```bash
git add sql/init.sql
git commit -m "feat(数据库): 添加文章封面图/分类/标签字段和图片上传记录表"
```

---

## 任务 2：更新 Post 数据模型和类型

**文件：**
- 修改：`src/lib/post-shared.ts`
- 修改：`src/lib/api-response.ts`

- [ ] **步骤 1：扩展 `src/lib/post-shared.ts` 的 Post 接口**

将现有 Post 接口替换为：

```typescript
export type PostStatus = 'draft' | 'published';

export interface Post {
    id: number;
    slug: string;
    title: string;
    summary: string;
    content: string;
    coverImage: string | null;
    altText: string | null;
    categoryId: number | null;
    tags: number[];
    status: PostStatus;
    publishedAt: string | null;
    updatedAt: string | null;
    /* 查询时拼装的展示字段，不存数据库 */
    categoryName?: string;
    tagNames?: { id: number; name: string; slug: string }[];
}
```

保留 `formatPostDate`、`formatPostDateTime`、`toDateTimeLocalValue`、`splitPostContent` 函数不变。

- [ ] **步骤 2：在 `src/lib/api-response.ts` 的 BizCode 中新增上传相关错误码**

在 `TAG_EXISTS: 40903` 之后添加：

```typescript
    /*-- 上传 --*/
    UPLOAD_NOT_FOUND: 40404,
    UPLOAD_INVALID_FILE: 40002,
    UPLOAD_TOO_LARGE: 40003,
```

- [ ] **步骤 3：运行类型检查确认无误**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/lib/post-shared.ts src/lib/api-response.ts
git commit -m "feat(类型): 扩展 Post 接口支持封面图/分类/标签，新增上传错误码"
```

---

## 任务 3：更新 posts.ts 数据层

**文件：**
- 修改：`src/lib/posts.ts`

- [ ] **步骤 1：扩展 CreatePostInput 和 UpdatePostInput**

替换现有接口为：

```typescript
export interface CreatePostInput {
    slug: string;
    title: string;
    summary: string;
    content: string;
    coverImage?: string | null;
    altText?: string | null;
    categoryId?: number | null;
    tags?: number[];
}

export interface UpdatePostInput {
    slug?: string;
    title?: string;
    summary?: string;
    content?: string;
    status?: PostStatus;
    publishedAt?: string | null;
    coverImage?: string | null;
    altText?: string | null;
    categoryId?: number | null;
    tags?: number[];
}
```

- [ ] **步骤 2：修改 `readPostsFromDatabase` 中的 SQL 查询**

将 SELECT 字段列表从：

```sql
id, slug, title, summary, content, status, ${DATE_FORMAT} published_at, ${DATE_FORMAT} updated_at
```

改为：

```sql
id, slug, title, summary, content, cover_image, alt_text, category_id, tags, status, ${DATE_FORMAT} published_at, ${DATE_FORMAT} updated_at
```

- [ ] **步骤 3：修改 `PostRow` 接口**

在 PostRow 接口中新增字段：

```typescript
cover_image: string | null;
alt_text: string | null;
category_id: number | null;
tags: string | null; // JSON 字符串
```

- [ ] **步骤 4：修改行映射函数**

在将 PostRow 映射为 Post 的地方，新增字段映射：

```typescript
coverImage: row.cover_image ?? null,
altText: row.alt_text ?? null,
categoryId: row.category_id ?? null,
tags: row.tags ? JSON.parse(row.tags) : [],
```

- [ ] **步骤 5：修改 `createPost` 函数**

INSERT 语句扩展新字段：

```typescript
export async function createPost(input: CreatePostInput): Promise<Post | null> {
    const db = getDb();
    if (!db) return null;

    const slug = input.slug || `post-${Date.now()}`;
    const title = input.title || '无标题草稿';
    const summary = input.summary || '';
    const content = input.content || '';
    const coverImage = input.coverImage ?? null;
    const altText = input.altText ?? null;
    const categoryId = input.categoryId ?? null;
    const tags = input.tags ? JSON.stringify(input.tags) : null;

    const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO zhijian_blog_posts (slug, title, summary, content, cover_image, alt_text, category_id, tags, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [slug, title, summary, content, coverImage, altText, categoryId, tags],
    );

    if (result.insertId) {
        return getPostById(result.insertId);
    }
    return null;
}
```

- [ ] **步骤 6：修改 `updatePostById` 函数**

采用动态 SET 子句模式（同 categories.ts 的模式），替换现有硬编码 SET：

```typescript
export async function updatePostById(id: number, input: UpdatePostInput): Promise<Post | null> {
    const db = getDb();
    if (!db) return null;

    const sets: string[] = [];
    const values: unknown[] = [];

    if (input.slug !== undefined) { sets.push('slug = ?'); values.push(input.slug); }
    if (input.title !== undefined) { sets.push('title = ?'); values.push(input.title); }
    if (input.summary !== undefined) { sets.push('summary = ?'); values.push(input.summary); }
    if (input.content !== undefined) { sets.push('content = ?'); values.push(input.content); }
    if (input.status !== undefined) { sets.push('status = ?'); values.push(input.status); }
    if (input.publishedAt !== undefined) { sets.push('published_at = ?'); values.push(normalizePublishedAt(input.publishedAt, input.status)); }
    if (input.coverImage !== undefined) { sets.push('cover_image = ?'); values.push(input.coverImage); }
    if (input.altText !== undefined) { sets.push('alt_text = ?'); values.push(input.altText); }
    if (input.categoryId !== undefined) { sets.push('category_id = ?'); values.push(input.categoryId); }
    if (input.tags !== undefined) { sets.push('tags = ?'); values.push(JSON.stringify(input.tags)); }

    if (sets.length === 0) return getPostById(id);

    values.push(id);
    await db.execute(
        `UPDATE zhijian_blog_posts SET ${sets.join(', ')} WHERE id = ?`,
        values,
    );

    return getPostById(id);
}
```

- [ ] **步骤 7：新增 `deletePostById` 函数**

在文件末尾添加：

```typescript
export async function deletePostById(id: number): Promise<boolean> {
    const db = getDb();
    if (!db) return false;

    const [result] = await db.execute<ResultSetHeader>(
        'DELETE FROM zhijian_blog_posts WHERE id = ?',
        [id],
    );
    return result.affectedRows > 0;
}
```

- [ ] **步骤 8：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 9：Commit**

```bash
git add src/lib/posts.ts
git commit -m "feat(数据层): 扩展文章 CRUD 支持封面图/分类/标签字段，新增删除功能"
```

---

## 任务 4：新增 uploads.ts 数据层

**文件：**
- 创建：`src/lib/uploads.ts`

- [ ] **步骤 1：创建 `src/lib/uploads.ts`**

```typescript
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { getDb } from '@/lib/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Upload {
    id: number;
    filename: string;
    original: string;
    path: string;
    size: number;
    mime: string;
    alt: string;
    createdAt: string;
}

interface UploadRow extends RowDataPacket {
    id: number;
    filename: string;
    original: string;
    path: string;
    size: number;
    mime: string;
    alt: string;
    created_at: Date;
}

const DATE_FORMAT = "DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at";

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: { type: string; size: number }): string | null {
    if (!ALLOWED_MIMES.includes(file.type)) {
        return '仅支持 JPG、PNG、GIF、WebP 格式。';
    }
    if (file.size > MAX_SIZE) {
        return '图片大小不能超过 5MB。';
    }
    return null;
}

export async function saveUpload(
    file: File,
): Promise<Upload | null> {
    const db = getDb();
    if (!db) return null;

    const validationError = validateImageFile({ type: file.type, size: file.size });
    if (validationError) {
        throw new Error(validationError);
    }

    /* 生成存储路径 /uploads/YYYY/MM/<hash8>.<ext> */
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const ext = file.name.split('.').pop() || 'jpg';
    const hash = crypto.randomBytes(4).toString('hex'); // 8 位随机哈希
    const filename = `${hash}.${ext}`;
    const relativePath = `/uploads/${year}/${month}/${filename}`;

    /* 写入文件系统 */
    const publicDir = path.join(process.cwd(), 'public');
    const dirPath = path.join(publicDir, 'uploads', year, month);
    if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    /* 写入数据库 */
    const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO zhijian_blog_uploads (filename, original, path, size, mime, alt)
         VALUES (?, ?, ?, ?, ?, '')`,
        [filename, file.name, relativePath, file.size, file.type],
    );

    if (result.insertId) {
        return getUploadById(result.insertId);
    }
    return null;
}

export async function getUploadById(id: number): Promise<Upload | null> {
    const db = getDb();
    if (!db) return null;

    const [rows] = await db.execute<UploadRow[]>(
        `SELECT id, filename, original, path, size, mime, alt, ${DATE_FORMAT} FROM zhijian_blog_uploads WHERE id = ?`,
        [id],
    );

    if (rows.length === 0) return null;

    return {
        id: rows[0].id,
        filename: rows[0].filename,
        original: rows[0].original,
        path: rows[0].path,
        size: rows[0].size,
        mime: rows[0].mime,
        alt: rows[0].alt,
        createdAt: rows[0].created_at as unknown as string,
    };
}

export async function listUploads(page: number = 1, pageSize: number = 20): Promise<{ data: Upload[]; total: number }> {
    const db = getDb();
    if (!db) return { data: [], total: 0 };

    const offset = (page - 1) * pageSize;

    const [countRows] = await db.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM zhijian_blog_uploads',
    );
    const total = countRows[0].total as number;

    const [rows] = await db.execute<UploadRow[]>(
        `SELECT id, filename, original, path, size, mime, alt, ${DATE_FORMAT}
         FROM zhijian_blog_uploads ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [pageSize, offset],
    );

    return {
        data: rows.map((row) => ({
            id: row.id,
            filename: row.filename,
            original: row.original,
            path: row.path,
            size: row.size,
            mime: row.mime,
            alt: row.alt,
            createdAt: row.created_at as unknown as string,
        })),
        total,
    };
}

export async function deleteUploadById(id: number): Promise<boolean> {
    const db = getDb();
    if (!db) return false;

    /* 先获取文件路径 */
    const upload = await getUploadById(id);
    if (!upload) return false;

    /* 删除数据库记录 */
    const [result] = await db.execute<ResultSetHeader>(
        'DELETE FROM zhijian_blog_uploads WHERE id = ?',
        [id],
    );

    if (result.affectedRows > 0) {
        /* 删除物理文件 */
        const filePath = path.join(process.cwd(), 'public', upload.path);
        try {
            if (existsSync(filePath)) {
                await unlink(filePath);
            }
        } catch (err) {
            console.error('删除物理文件失败：', err);
        }
        return true;
    }
    return false;
}
```

- [ ] **步骤 2：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 3：Commit**

```bash
git add src/lib/uploads.ts
git commit -m "feat(数据层): 新增图片上传 CRUD，支持文件校验、存储和删除"
```

---

## 任务 5：更新文章 API（扩展字段 + 删除）

**文件：**
- 修改：`src/app/api/admin/posts/route.ts`
- 修改：`src/app/api/admin/posts/[id]/route.ts`

- [ ] **步骤 1：修改 `src/app/api/admin/posts/route.ts` 的 POST handler**

将现有 POST handler 替换为：

```typescript
export async function POST(request: NextRequest) {
    const admin = requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

    let body: { title?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const title = body.title?.trim() || '无标题草稿';
    const slug = `draft-${Date.now()}`;

    try {
        const post = await createPost({ slug, title, summary: '', content: '' });
        if (!post) {
            return NextResponse.json(fail(BizCode.INTERNAL, '创建文章失败。'), { status: 500 });
        }
        return NextResponse.json(success({ post }, '新建文章成功。'), { status: 201 });
    } catch (err) {
        console.error('创建文章失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '创建文章失败。'), { status: 500 });
    }
}
```

- [ ] **步骤 2：重写 `src/app/api/admin/posts/[id]/route.ts`，扩展 PATCH + 新增 DELETE**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { getPostById, updatePostById, deletePostById } from '@/lib/posts';
import { isPostStatus } from '@/lib/posts';
import { BizCode, fail, success } from '@/lib/api-response';

type RouteContext = { params: Promise<{ id: string }> };

/*-- PATCH: 更新文章 --*/
export async function PATCH(
    request: NextRequest,
    { params }: RouteContext,
) {
    const admin = requireAdminFromRequest(request);
    if (!admin) return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });

    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的文章 ID。'), { status: 400 });
    }

    const existing = await getPostById(postId);
    if (!existing) return NextResponse.json(fail(BizCode.NOT_FOUND, '文章不存在。'), { status: 404 });

    let body: Record<string, unknown>;
    try { body = await request.json(); } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    /* 校验 */
    if (body.title !== undefined && typeof body.title !== 'string') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '标题格式不正确。'), { status: 400 });
    }
    if (body.slug !== undefined) {
        const slug = String(body.slug);
        if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 120) {
            return NextResponse.json(fail(BizCode.BAD_REQUEST, 'Slug 格式不正确，仅允许小写字母、数字和连字符，最长 120 字符。'), { status: 400 });
        }
    }
    if (body.status !== undefined && !isPostStatus(body.status)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '状态值不合法。'), { status: 400 });
    }
    if (body.categoryId !== undefined && body.categoryId !== null && typeof body.categoryId !== 'number') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '分类 ID 格式不正确。'), { status: 400 });
    }
    if (body.tags !== undefined && !Array.isArray(body.tags)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '标签格式不正确。'), { status: 400 });
    }

    const input: Record<string, unknown> = {};
    if (body.title !== undefined) input.title = String(body.title).trim();
    if (body.slug !== undefined) input.slug = String(body.slug);
    if (body.summary !== undefined) input.summary = String(body.summary);
    if (body.content !== undefined) input.content = String(body.content);
    if (body.status !== undefined) input.status = body.status;
    if (body.publishedAt !== undefined) input.publishedAt = body.publishedAt as string | null;
    if (body.coverImage !== undefined) input.coverImage = body.coverImage as string | null;
    if (body.altText !== undefined) input.altText = body.altText as string | null;
    if (body.categoryId !== undefined) input.categoryId = body.categoryId as number | null;
    if (body.tags !== undefined) input.tags = body.tags as number[];

    try {
        const post = await updatePostById(postId, input as any);
        return NextResponse.json(success({ post }, '文章更新成功。'));
    } catch (err) {
        console.error('更新文章失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '更新文章失败。'), { status: 500 });
    }
}

/*-- DELETE: 删除文章 --*/
export async function DELETE(
    request: NextRequest,
    { params }: RouteContext,
) {
    const admin = requireAdminFromRequest(request);
    if (!admin) return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });

    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的文章 ID。'), { status: 400 });
    }

    try {
        const deleted = await deletePostById(postId);
        if (!deleted) return NextResponse.json(fail(BizCode.NOT_FOUND, '文章不存在。'), { status: 404 });
        return NextResponse.json(success(null, '文章已删除。'));
    } catch (err) {
        console.error('删除文章失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '删除文章失败。'), { status: 500 });
    }
}
```

注意：需确保 `isPostStatus` 从 `src/lib/posts.ts` 中导出。当前 posts.ts 中该函数可能是模块内部的，需添加 `export` 关键字。

- [ ] **步骤 3：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/app/api/admin/posts/route.ts src/app/api/admin/posts/[id]/route.ts src/lib/posts.ts
git commit -m "feat(API): 文章 API 扩展封面图/分类/标签字段，新增删除接口"
```

---

## 任务 6：新增图片上传 API

**文件：**
- 创建：`src/app/api/admin/upload/route.ts`
- 创建：`src/app/api/admin/uploads/route.ts`
- 创建：`src/app/api/admin/uploads/[id]/route.ts`

- [ ] **步骤 1：创建 `src/app/api/admin/upload/route.ts`（单图上传）**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { saveUpload, validateImageFile } from '@/lib/uploads';
import { BizCode, fail, success } from '@/lib/api-response';

/*-- POST: 上传图片 --*/
export async function POST(request: NextRequest) {
    const admin = requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '请选择要上传的图片。'), { status: 400 });
        }

        const validationError = validateImageFile({ type: file.type, size: file.size });
        if (validationError) {
            return NextResponse.json(fail(BizCode.UPLOAD_INVALID_FILE, validationError), { status: 400 });
        }

        const upload = await saveUpload(file);
        if (!upload) {
            return NextResponse.json(fail(BizCode.INTERNAL, '上传失败，请稍后重试。'), { status: 500 });
        }

        return NextResponse.json(success({ upload }, '上传成功。'), { status: 201 });
    } catch (err: any) {
        if (err.message?.includes('仅支持') || err.message?.includes('不能超过')) {
            return NextResponse.json(fail(BizCode.UPLOAD_INVALID_FILE, err.message), { status: 400 });
        }
        console.error('上传图片失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '上传失败。'), { status: 500 });
    }
}
```

- [ ] **步骤 2：创建 `src/app/api/admin/uploads/route.ts`（图片列表）**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { listUploads } from '@/lib/uploads';
import { BizCode, fail, success } from '@/lib/api-response';

/*-- GET: 图片列表 --*/
export async function GET(request: NextRequest) {
    const admin = requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number(searchParams.get('page') || 1));
        const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)));

        const result = await listUploads(page, pageSize);
        return NextResponse.json(success(result));
    } catch (err) {
        console.error('获取图片列表失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取图片列表失败。'), { status: 500 });
    }
}
```

- [ ] **步骤 3：创建 `src/app/api/admin/uploads/[id]/route.ts`（删除图片）**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { deleteUploadById, getUploadById } from '@/lib/uploads';
import { BizCode, fail, success } from '@/lib/api-response';

type RouteContext = { params: Promise<{ id: string }> };

/*-- DELETE: 删除图片 --*/
export async function DELETE(
    request: NextRequest,
    { params }: RouteContext,
) {
    const admin = requireAdminFromRequest(request);
    if (!admin) return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });

    const { id } = await params;
    const uploadId = Number(id);
    if (!Number.isFinite(uploadId) || uploadId <= 0) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的图片 ID。'), { status: 400 });
    }

    try {
        /* 检查图片是否存在 */
        const existing = await getUploadById(uploadId);
        if (!existing) {
            return NextResponse.json(fail(BizCode.UPLOAD_NOT_FOUND, '图片不存在。'), { status: 404 });
        }

        const deleted = await deleteUploadById(uploadId);
        if (!deleted) {
            return NextResponse.json(fail(BizCode.INTERNAL, '删除图片失败。'), { status: 500 });
        }
        return NextResponse.json(success(null, '图片已删除。'));
    } catch (err) {
        console.error('删除图片失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '删除图片失败。'), { status: 500 });
    }
}
```

- [ ] **步骤 4：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 5：Commit**

```bash
git add src/app/api/admin/upload/ src/app/api/admin/uploads/
git commit -m "feat(API): 新增图片上传、列表和删除接口"
```

---

## 任务 7：更新导航配置

**文件：**
- 修改：`src/lib/site.ts`

- [ ] **步骤 1：在 APP_ROUTES 中新增 adminUploads**

在 `adminTags` 行之后添加：

```typescript
    adminUploads: '/admin/uploads',
```

- [ ] **步骤 2：在 ADMIN_NAV_GROUPS 的 content 分组中添加图片管理导航项**

在 `{ href: APP_ROUTES.adminTags, ... }` 之后添加：

```typescript
            { href: APP_ROUTES.adminUploads, label: '图片管理', icon: ImageIcon, match: 'prefix' },
```

注意：需要在文件顶部 import 中添加 `ImageIcon`。当前 icons 库中没有 ImageIcon，需要新增一个，或者使用已有的 `FileTextIcon` 临时替代。推荐新增一个简单的 ImageIcon。

- [ ] **步骤 3：新增 `src/components/ui/icons/image-icon.tsx`**

```tsx
import type { IconProps } from './index';

export function ImageIcon({ className, ...props }: IconProps) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}
```

- [ ] **步骤 4：在 `src/components/ui/icons/index.ts` 中导出 ImageIcon**

添加：`export { ImageIcon } from './image-icon';`

- [ ] **步骤 5：更新 site.ts 的 import，添加 ImageIcon**

在顶部 import 中添加 `ImageIcon`。

- [ ] **步骤 6：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 7：Commit**

```bash
git add src/components/ui/icons/image-icon.tsx src/components/ui/icons/index.ts src/lib/site.ts
git commit -m "feat(导航): 新增图片管理导航项和 ImageIcon"
```

---

## 任务 8：重写文章列表页（接入真实 API）

**文件：**
- 修改：`src/app/admin/_components/post-management-client.tsx`
- 修改：`src/app/admin/_components/post-management-client.module.css`

- [ ] **步骤 1：重写 `post-management-client.tsx`，接入真实 API**

重写要点：
- 移除 `MOCK_POSTS` 依赖，使用 `useCrudList` 或直接 `api.get` 获取文章列表
- 使用真实的 DELETE API 删除文章
- 表格列：标题(title+slug)、状态(Tag)、分类、标签、发布时间、更新时间、操作
- 分类和标签显示名称（需要后端在列表接口中返回 categoryName 和 tagNames）
- 操作：编辑（跳转 `/admin/posts/[id]`）、删除（ConfirmDialog → DELETE API）

```tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { Pagination } from '@/components/ui/pagination';
import { PillSelect } from '@/components/ui/pill-select';
import { Tag } from '@/components/ui/tag';
import { TextInput } from '@/components/ui/text-input';
import { toast } from '@/components/ui/toast';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { api } from '@/lib/http-client';
import type { Post, PostStatus } from '@/lib/post-shared';
import { formatPostDateTime } from '@/lib/post-shared';
import { APP_ROUTES } from '@/lib/site';

import styles from './post-management-client.module.css';
import shared from '@/app/admin/_components/admin-shared.module.css';

interface PostListItem {
    id: number;
    title: string;
    slug: string;
    status: PostStatus;
    categoryName: string | null;
    tagNames: { id: number; name: string; slug: string }[] | null;
    publishedAt: string | null;
    updatedAt: string | null;
}

export default function PostManagementClient() {
    const [posts, setPosts] = useState<PostListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ data: PostListItem[]; total: number }>('/admin/posts');
            if (res.code === 0 && res.data) {
                setPosts(res.data.data);
                setTotal(res.data.total);
            }
        } catch {
            toast.error('获取文章列表失败');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setDeleting(deleteTarget.id);
        try {
            const res = await api.delete(`/admin/posts/${deleteTarget.id}`);
            if (res.code === 0) {
                setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
                setTotal((prev) => prev - 1);
                setDeleteTarget(null);
                toast.success('删除成功');
            } else {
                toast.error(res.message || '删除失败。');
            }
        } catch {
            toast.error('删除请求失败。');
        } finally {
            setDeleting(null);
        }
    }

    const filtered = useMemo(() => {
        let result = posts;
        if (statusFilter !== 'all') {
            result = result.filter((p) => p.status === statusFilter);
        }
        if (keyword.trim()) {
            const kw = keyword.trim().toLowerCase();
            result = result.filter((p) =>
                p.title.toLowerCase().includes(kw) || p.slug.toLowerCase().includes(kw)
            );
        }
        return result;
    }, [posts, statusFilter, keyword]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize);

    const statusOptions = [
        { value: 'all' as const, label: '全部' },
        { value: 'draft' as const, label: '草稿' },
        { value: 'published' as const, label: '已发布' },
    ];

    const columns: DataColumn<PostListItem>[] = [
        {
            header: '文章',
            render: (post) => (
                <div>
                    <p className={styles.postTitle}>{post.title}</p>
                    <p className={styles.postSlug}>{post.slug}</p>
                </div>
            ),
        },
        {
            header: '状态',
            width: '6rem',
            render: (post) => (
                <Tag variant={post.status === 'published' ? 'primary' : 'default'} size="small">
                    {post.status === 'published' ? '已发布' : '草稿'}
                </Tag>
            ),
        },
        {
            header: '分类',
            width: '6rem',
            hideBelow: 'lg',
            render: (post) => post.categoryName ? (
                <Tag variant="default" size="small">{post.categoryName}</Tag>
            ) : (
                <span className={shared.mutedCell}>—</span>
            ),
        },
        {
            header: '标签',
            hideBelow: 'lg',
            render: (post) => post.tagNames && post.tagNames.length > 0 ? (
                <div className={styles.tagList}>
                    {post.tagNames.map((t) => (
                        <Tag key={t.id} variant="default" size="mini">{t.name}</Tag>
                    ))}
                </div>
            ) : (
                <span className={shared.mutedCell}>—</span>
            ),
        },
        {
            header: '发布时间',
            width: '10rem',
            hideBelow: 'sm',
            render: (post) => <span className={shared.mutedCell}>{formatPostDateTime(post.publishedAt)}</span>,
        },
        {
            header: '操作',
            width: '6rem',
            render: (post) => (
                <div className={shared.actionGroup}>
                    <Link href={`/admin/posts/${post.id}`}>
                        <IconButton icon={<PencilIcon />} size="medium" title="编辑" />
                    </Link>
                    <IconButton
                        disabled={deleting === post.id}
                        icon={<Trash2Icon />}
                        onClick={() => setDeleteTarget({ id: post.id, title: post.title })}
                        size="medium"
                        title="删除"
                        variant="danger"
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <AdminPageHeader
                description="管理博客文章，支持新建、编辑和删除。"
                eyebrow="Posts"
                tag={`${total} 篇文章`}
                title="文章管理"
            />

            <div className={styles.toolbar}>
                <div className={styles.searchRow}>
                    <TextInput
                        icon={<SearchIcon />}
                        onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                        placeholder="搜索文章标题或 Slug..."
                        value={keyword}
                    />
                    <PillSelect
                        name="status"
                        onChange={setStatusFilter}
                        options={statusOptions}
                        value={statusFilter}
                    />
                </div>
                <GhostButton
                    asButton={false}
                    href={APP_ROUTES.adminPostCreate}
                    icon={<PlusIcon className={shared.btnIcon} />}
                    size="medium"
                    variant="primary"
                >
                    新建文章
                </GhostButton>
            </div>

            <DataTable
                columns={columns}
                emptyText={loading ? '加载中...' : '暂无文章'}
                rowKey={(post) => post.id}
                rows={pagedData}
            />

            <Pagination current={page} onPageChange={setPage} total={totalPages} />

            <ConfirmDialog
                confirmLabel="删除"
                message={`确定要删除文章「${deleteTarget?.title ?? ''}」吗？此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                loading={deleting !== null}
                title="确认删除"
            />
        </>
    );
}
```

- [ ] **步骤 2：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 3：Commit**

```bash
git add src/app/admin/_components/post-management-client.tsx
git commit -m "feat(文章列表): 接入真实 API，替换 MOCK_POSTS，增加删除功能"
```

---

## 任务 9：修改文章列表 API 返回分类/标签名称

**文件：**
- 修改：`src/lib/posts.ts`

- [ ] **步骤 1：修改 `getAllPosts` 函数，JOIN 分类表和标签表获取名称**

将 `readPostsFromDatabase` 中的 SQL 改为使用 LEFT JOIN：

```sql
SELECT p.id, p.slug, p.title, p.summary, p.content, p.cover_image, p.alt_text,
       p.category_id, p.tags, p.status,
       ${DATE_FORMAT} p.published_at, ${DATE_FORMAT} p.updated_at,
       c.name as category_name
FROM zhijian_blog_posts p
LEFT JOIN zhijian_blog_categories c ON p.category_id = c.id
WHERE ...
ORDER BY p.id DESC
```

在 PostRow 中新增 `category_name: string | null`。

在行映射中新增：

```typescript
categoryName: row.category_name ?? undefined,
```

对于 tagNames，在获取文章列表后，收集所有 tag IDs，批量查询标签名称，再拼装到对应文章上。实现方式：

```typescript
export async function getAllPosts(): Promise<Post[]> {
    const posts = await readPostsFromDatabase({ includeDrafts: true });
    return enrichPostsWithTagNames(posts);
}

async function enrichPostsWithTagNames(posts: Post[]): Promise<Post[]> {
    const allTagIds = posts.flatMap((p) => p.tags).filter(Boolean);
    if (allTagIds.length === 0) return posts;

    const uniqueIds = [...new Set(allTagIds)];
    const db = getDb();
    if (!db) return posts;

    const [tagRows] = await db.execute<RowDataPacket[]>(
        `SELECT id, name, slug FROM zhijian_blog_tags WHERE id IN (${uniqueIds.map(() => '?').join(', ')})`,
        uniqueIds,
    );

    const tagMap = new Map<number, { id: number; name: string; slug: string }>();
    for (const row of tagRows) {
        tagMap.set(row.id, { id: row.id, name: row.name, slug: row.slug });
    }

    return posts.map((p) => ({
        ...p,
        tagNames: p.tags.map((id) => tagMap.get(id)).filter(Boolean) as { id: number; name: string; slug: string }[],
    }));
}
```

- [ ] **步骤 2：修改 `readPostsFromDatabase` 的 WHERE 子句**

当 `includeDrafts` 为 true 时不加 status 过滤（当前已有此逻辑），需确保 SQL 拼装正确适配新表别名 `p.`。

- [ ] **步骤 3：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/lib/posts.ts
git commit -m "feat(数据层): 文章列表 JOIN 分类表，批量获取标签名称"
```

---

## 任务 10：编辑器独立全屏布局

**文件：**
- 创建：`src/app/admin/posts/[id]/layout.tsx`

- [ ] **步骤 1：创建编辑器独立布局，不套 AdminShell**

```tsx
import { ToastContainer } from '@/components/ui/toast';
import { requireAdmin } from '@/lib/auth';

/*== 编辑器全屏布局：脱离 AdminShell，最大化编辑空间 ==*/
export default async function PostEditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();
    return (
        <>
            {children}
            <ToastContainer />
        </>
    );
}
```

- [ ] **步骤 2：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 3：Commit**

```bash
git add src/app/admin/posts/[id]/layout.tsx
git commit -m "feat(编辑器): 新增独立全屏布局，脱离 AdminShell"
```

---

## 任务 11：编辑器主组件 PostEditor

**文件：**
- 创建：`src/app/admin/posts/[id]/_components/post-editor.tsx`
- 创建：`src/app/admin/posts/[id]/_components/post-editor.module.css`
- 修改：`src/app/admin/posts/[id]/page.tsx`（重写）
- 修改：`src/app/admin/posts/new/page.tsx`（重写）

- [ ] **步骤 1：创建 `post-editor.module.css`**

```css
.editor {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--background);
}

.body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.bodySplit {
    composes: body;
}

.bodyEdit {
    composes: body;
}

.bodyPreview {
    composes: body;
}

/* 分栏模式：左编辑 + 右预览 */
.contentSplit {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.editPane {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    overflow: hidden;
}

.previewPane {
    flex: 1;
    overflow: auto;
}

/* 编辑模式：全宽编辑 */
.contentEdit {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 预览模式：全宽预览 */
.contentPreview {
    flex: 1;
    overflow: auto;
}

/* 侧边面板 */
.sidePanel {
    width: 320px;
    border-left: 1px solid var(--border);
    background: var(--background);
    overflow-y: auto;
    flex-shrink: 0;
}

.saveStatus {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    display: flex;
    align-items: center;
    gap: 0.375rem;
}

.saveStatusSaving {
    composes: saveStatus;
    color: var(--primary);
}
```

- [ ] **步骤 2：创建 `post-editor.tsx`**

```tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import type { Post, PostStatus } from '@/lib/post-shared';
import type { Category } from '@/lib/categories';
import type { Tag } from '@/lib/tags';
import { api } from '@/lib/http-client';
import { toast } from '@/components/ui/toast';
import { APP_ROUTES } from '@/lib/site';

import EditorToolbar from './editor-toolbar';
import MarkdownEditor from './markdown-editor';
import MarkdownPreview from './markdown-preview';
import MetadataPanel from './metadata-panel';

import styles from './post-editor.module.css';

type ViewMode = 'edit' | 'split' | 'preview';

interface PostEditorProps {
    post: Post;
    categories: Category[];
    tags: Tag[];
}

export default function PostEditor({ post, categories, tags }: PostEditorProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<ViewMode>('split');
    const [formData, setFormData] = useState({
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        status: post.status as PostStatus,
        publishedAt: post.publishedAt,
        coverImage: post.coverImage,
        altText: post.altText,
        categoryId: post.categoryId,
        tags: post.tags,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedRef = useRef<string>(JSON.stringify(formData));

    /* 自动保存（3 秒防抖） */
    const saveDraft = useCallback(async (data: typeof formData) => {
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            const res = await api.patch<{ post: Post }>(`/admin/posts/${post.id}`, {
                ...data,
                publishedAt: data.publishedAt || null,
            });
            if (res.code === 0) {
                lastSavedRef.current = JSON.stringify(data);
                setSaveStatus('saved');
            } else {
                setSaveStatus('unsaved');
                toast.error(res.message || '自动保存失败');
            }
        } catch {
            setSaveStatus('unsaved');
        } finally {
            setIsSaving(false);
        }
    }, [post.id]);

    const scheduleSave = useCallback((newData: typeof formData) => {
        setSaveStatus('unsaved');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveDraft(newData);
        }, 3000);
    }, [saveDraft]);

    function updateField<K extends keyof typeof formData>(key: K, value: typeof formData[K]) {
        const newData = { ...formData, [key]: value };
        setFormData(newData);
        if (newData.status === 'draft' || key === 'content' || key === 'title') {
            scheduleSave(newData);
        }
    }

    /* beforeunload 弹窗 */
    useEffect(() => {
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            if (saveStatus === 'unsaved' || saveStatus === 'saving') {
                e.preventDefault();
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [saveStatus]);

    /* 清理定时器 */
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    /* 手动保存 */
    async function handleManualSave() {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        await saveDraft(formData);
        toast.success('已保存');
    }

    /* 发布/取消发布 */
    async function handleTogglePublish() {
        const newStatus: PostStatus = formData.status === 'published' ? 'draft' : 'published';
        const newData = { ...formData, status: newStatus };
        if (newStatus === 'published' && !formData.publishedAt) {
            newData.publishedAt = new Date().toISOString();
        }
        setFormData(newData);
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            const res = await api.patch<{ post: Post }>(`/admin/posts/${post.id}`, {
                status: newStatus,
                publishedAt: newData.publishedAt || null,
            });
            if (res.code === 0) {
                lastSavedRef.current = JSON.stringify(newData);
                setSaveStatus('saved');
                toast.success(newStatus === 'published' ? '已发布' : '已取消发布');
            } else {
                toast.error(res.message || '操作失败');
            }
        } catch {
            toast.error('操作失败');
            setSaveStatus('unsaved');
        } finally {
            setIsSaving(false);
        }
    }

    /* 文章内插入图片 */
    function handleInsertImage(markdown: string) {
        const newContent = formData.content + '\n' + markdown;
        updateField('content', newContent);
    }

    /* 渲染编辑区 */
    function renderEditArea(fullWidth: boolean) {
        return (
            <MarkdownEditor
                content={formData.content}
                onContentChange={(value) => updateField('content', value)}
                onInsertImage={handleInsertImage}
                fullWidth={fullWidth}
            />
        );
    }

    return (
        <div className={styles.editor}>
            <EditorToolbar
                isSaving={isSaving}
                onBack={() => router.push(APP_ROUTES.adminPosts)}
                onManualSave={handleManualSave}
                onTogglePublish={handleTogglePublish}
                onViewModeChange={setViewMode}
                saveStatus={saveStatus}
                status={formData.status}
                viewMode={viewMode}
            />
            <div className={styles.body}>
                {/* 标题 + 摘要输入区（编辑和分栏模式显示） */}
                {(viewMode === 'edit' || viewMode === 'split') && (
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {/* 标题和摘要始终显示在编辑区顶部 */}
                            <div style={{ padding: '1rem 1.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                <input
                                    className="admin-input"
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="文章标题"
                                    style={{ fontSize: '1.5rem', fontWeight: 600, border: 'none', background: 'transparent', width: '100%', padding: '0.5rem 0', outline: 'none', fontFamily: 'var(--font-serif)' }}
                                    value={formData.title}
                                />
                                <textarea
                                    className="admin-input"
                                    onChange={(e) => updateField('summary', e.target.value)}
                                    placeholder="文章摘要（可选）"
                                    rows={2}
                                    style={{ fontSize: '0.875rem', border: 'none', background: 'transparent', width: '100%', padding: '0.5rem 0', resize: 'none', outline: 'none', color: 'var(--muted-foreground)' }}
                                    value={formData.summary}
                                />
                            </div>

                            {viewMode === 'split' ? (
                                <div className={styles.contentSplit}>
                                    <div className={styles.editPane}>
                                        {renderEditArea(false)}
                                    </div>
                                    <div className={styles.previewPane}>
                                        <MarkdownPreview content={formData.content} />
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.contentEdit}>
                                    {renderEditArea(true)}
                                </div>
                            )}
                        </div>

                        {/* 侧边面板（仅分栏模式） */}
                        {viewMode === 'split' && (
                            <div className={styles.sidePanel}>
                                <MetadataPanel
                                    altText={formData.altText}
                                    categories={categories}
                                    categoryId={formData.categoryId}
                                    coverImage={formData.coverImage}
                                    publishedAt={formData.publishedAt}
                                    slug={formData.slug}
                                    status={formData.status}
                                    tags={tags}
                                    selectedTags={formData.tags}
                                    onAltTextChange={(v) => updateField('altText', v)}
                                    onCategoryIdChange={(v) => updateField('categoryId', v)}
                                    onCoverImageChange={(v) => updateField('coverImage', v)}
                                    onPublishedAtChange={(v) => updateField('publishedAt', v)}
                                    onSlugChange={(v) => updateField('slug', v)}
                                    onStatusChange={(v) => updateField('status', v)}
                                    onTagsChange={(v) => updateField('tags', v)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* 预览模式 */}
                {viewMode === 'preview' && (
                    <div className={styles.contentPreview}>
                        <MarkdownPreview
                            altText={formData.altText}
                            categoryName={categories.find((c) => c.id === formData.categoryId)?.name}
                            content={formData.content}
                            coverImage={formData.coverImage}
                            publishedAt={formData.publishedAt}
                            tagNames={tags.filter((t) => formData.tags.includes(t.id)).map((t) => t.name)}
                            title={formData.title}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
```

- [ ] **步骤 3：重写 `src/app/admin/posts/[id]/page.tsx`**

```tsx
import type { Metadata } from 'next';

import { getPostById } from '@/lib/posts';
import { listCategories } from '@/lib/categories';
import { listTags } from '@/lib/tags';
import PostEditor from './_components/post-editor';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) return { title: '编辑文章 - Zhijian' };

    const post = await getPostById(postId);
    return { title: post ? `编辑：${post.title} - Zhijian` : '文章不存在 - Zhijian' };
}

export default async function EditPostPage({ params }: PageProps) {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId <= 0) return null;

    const post = await getPostById(postId);
    if (!post) return null;

    const [categories, tags] = await Promise.all([listCategories(), listTags()]);

    return <PostEditor categories={categories} post={post} tags={tags} />;
}
```

- [ ] **步骤 4：重写 `src/app/admin/posts/new/page.tsx`**

新建文章的策略：先 POST 创建草稿，再跳转到编辑页。

```tsx
import type { Metadata } from 'next';

import { createPost } from '@/lib/posts';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: '新建文章 - Zhijian',
};

export default async function NewPostPage() {
    const post = await createPost({
        slug: `draft-${Date.now()}`,
        title: '无标题草稿',
        summary: '',
        content: '',
    });

    if (post) {
        redirect(`/admin/posts/${post.id}`);
    }

    return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            创建文章失败，请返回重试。
        </div>
    );
}
```

- [ ] **步骤 5：删除旧文件 `post-editor-form.tsx` 和 `post-editor-form.module.css`**

```bash
rm src/app/admin/_components/post-editor-form.tsx
rm src/app/admin/_components/post-editor-form.module.css
```

- [ ] **步骤 6：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 7：Commit**

```bash
git add src/app/admin/posts/[id]/ src/app/admin/posts/new/ src/app/admin/posts/[id]/_components/post-editor.tsx src/app/admin/posts/[id]/_components/post-editor.module.css
git rm src/app/admin/_components/post-editor-form.tsx src/app/admin/_components/post-editor-form.module.css
git commit -m "feat(编辑器): 实现分栏编辑器主组件，三种视图模式，自动保存"
```

---

## 任务 12：EditorToolbar 组件

**文件：**
- 创建：`src/app/admin/posts/[id]/_components/editor-toolbar.tsx`
- 创建：`src/app/admin/posts/[id]/_components/editor-toolbar.module.css`

- [ ] **步骤 1：创建 `editor-toolbar.module.css`**

```css
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3rem;
    padding: 0 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--background);
    flex-shrink: 0;
}

.left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.center {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--muted);
    border: 1px solid var(--border);
    padding: 0.125rem;
}

.viewBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.75rem;
    padding: 0 0.75rem;
    border: none;
    background: transparent;
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: all 0.15s ease;
}

.viewBtn:hover {
    color: var(--foreground);
}

.viewBtnActive {
    composes: viewBtn;
    background: var(--background);
    color: var(--primary);
    box-shadow: inset 0 -2px 0 var(--primary);
}

.right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.saveStatus {
    font-size: 0.8125rem;
    color: var(--muted-foreground);
}

.saveStatusSaving {
    composes: saveStatus;
    color: var(--primary);
}

.publishBtn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 2rem;
    padding: 0 0.875rem;
    border: 1px solid var(--primary);
    background: transparent;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--primary);
    cursor: pointer;
    transition: all 0.15s ease;
}

.publishBtn:hover {
    background: var(--primary);
    color: var(--primary-foreground);
}

.publishBtnPublished {
    composes: publishBtn;
    border-color: var(--border);
    color: var(--muted-foreground);
    background: var(--muted);
}

.publishBtnPublished:hover {
    border-color: var(--destructive);
    color: var(--destructive);
    background: var(--destructive-subtle);
}

.backBtn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 2rem;
    padding: 0 0.75rem;
    border: none;
    background: transparent;
    font-size: 0.875rem;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: color 0.15s ease;
}

.backBtn:hover {
    color: var(--foreground);
}

.saveBtn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    height: 2rem;
    padding: 0 0.75rem;
    border: 1px solid var(--border);
    background: var(--background);
    font-size: 0.8125rem;
    color: var(--foreground);
    cursor: pointer;
    transition: all 0.15s ease;
}

.saveBtn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.saveBtn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

- [ ] **步骤 2：创建 `editor-toolbar.tsx`**

```tsx
'use client';

import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import type { PostStatus } from '@/lib/post-shared';

import styles from './editor-toolbar.module.css';

type ViewMode = 'edit' | 'split' | 'preview';

interface EditorToolbarProps {
    isSaving: boolean;
    onBack: () => void;
    onManualSave: () => void;
    onTogglePublish: () => void;
    onViewModeChange: (mode: ViewMode) => void;
    saveStatus: 'saved' | 'saving' | 'unsaved';
    status: PostStatus;
    viewMode: ViewMode;
}

const VIEW_MODES: { key: ViewMode; label: string }[] = [
    { key: 'edit', label: '编辑' },
    { key: 'split', label: '分栏' },
    { key: 'preview', label: '预览' },
];

export default function EditorToolbar({
    isSaving,
    onBack,
    onManualSave,
    onTogglePublish,
    onViewModeChange,
    saveStatus,
    status,
    viewMode,
}: EditorToolbarProps) {
    const statusText = saveStatus === 'saved' ? '已保存' : saveStatus === 'saving' ? '保存中...' : '未保存';
    const statusClass = saveStatus === 'saving' ? styles.saveStatusSaving : styles.saveStatus;

    return (
        <div className={styles.toolbar}>
            <div className={styles.left}>
                <button className={styles.backBtn} onClick={onBack} type="button">
                    <ArrowLeftIcon style={{ width: '1rem', height: '1rem' }} />
                    返回
                </button>
                <span className={statusClass}>{statusText}</span>
            </div>

            <div className={styles.center}>
                {VIEW_MODES.map(({ key, label }) => (
                    <button
                        className={viewMode === key ? styles.viewBtnActive : styles.viewBtn}
                        key={key}
                        onClick={() => onViewModeChange(key)}
                        type="button"
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className={styles.right}>
                <button className={styles.saveBtn} disabled={isSaving} onClick={onManualSave} type="button">
                    <SaveIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                    保存
                </button>
                <button
                    className={status === 'published' ? styles.publishBtnPublished : styles.publishBtn}
                    onClick={onTogglePublish}
                    type="button"
                >
                    {status === 'published' ? '取消发布' : '发布'}
                </button>
            </div>
        </div>
    );
}
```

- [ ] **步骤 3：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/app/admin/posts/[id]/_components/editor-toolbar.tsx src/app/admin/posts/[id]/_components/editor-toolbar.module.css
git commit -m "feat(编辑器): 实现顶部工具栏，含视图切换、保存和发布按钮"
```

---

## 任务 13：MarkdownEditor 组件

**文件：**
- 创建：`src/app/admin/posts/[id]/_components/markdown-editor.tsx`
- 创建：`src/app/admin/posts/[id]/_components/markdown-editor.module.css`

- [ ] **步骤 1：创建 `markdown-editor.module.css`**

```css
.editor {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.miniToolbar {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0.375rem 0.75rem;
    border-bottom: 1px solid var(--border);
    background: var(--muted);
    flex-shrink: 0;
}

.miniBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: none;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.miniBtn:hover {
    color: var(--primary);
    background: var(--primary-subtle);
}

.textarea {
    flex: 1;
    width: 100%;
    padding: 1rem 1.5rem;
    border: none;
    background: var(--background);
    font-size: 0.9375rem;
    line-height: 1.85;
    color: var(--foreground);
    resize: none;
    outline: none;
    font-family: 'Menlo', 'Consolas', 'Monaco', 'PingFang SC', monospace;
}

.textarea::placeholder {
    color: var(--muted-foreground);
    opacity: 0.6;
}

/* 拖拽上传叠加层 */
.dropOverlay {
    position: absolute;
    inset: 0;
    background: var(--primary-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9375rem;
    color: var(--primary);
    font-weight: 500;
    pointer-events: none;
    z-index: 10;
}

.editorWrapper {
    position: relative;
    flex: 1;
    overflow: hidden;
}
```

- [ ] **步骤 2：创建 `markdown-editor.tsx`**

```tsx
'use client';

import { useRef, useState, useCallback } from 'react';
import { api } from '@/lib/http-client';
import { toast } from '@/components/ui/toast';

import styles from './markdown-editor.module.css';

interface MarkdownEditorProps {
    content: string;
    onContentChange: (value: string) => void;
    onInsertImage: (markdown: string) => void;
    fullWidth?: boolean;
}

const UPLOADING_MARKER = '![⏳上传中...]()';
const FAILED_MARKER = '![❌上传失败]()';

export default function MarkdownEditor({ content, onContentChange, onInsertImage, fullWidth }: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    /* 在光标位置插入文本 */
    function insertAtCursor(text: string) {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = content.substring(0, start);
        const after = content.substring(end);
        const newContent = before + text + after;

        onContentChange(newContent);

        /* 恢复光标位置 */
        requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
            textarea.focus();
        });
    }

    /* Mini 工具栏按钮操作 */
    function handleToolbarAction(action: string) {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.substring(start, end);

        switch (action) {
            case 'bold':
                insertAtCursor(`**${selected || '粗体'}**`);
                break;
            case 'italic':
                insertAtCursor(`*${selected || '斜体'}*`);
                break;
            case 'h2':
                insertAtCursor(`\n## ${selected || '标题'}\n`);
                break;
            case 'h3':
                insertAtCursor(`\n### ${selected || '标题'}\n`);
                break;
            case 'link':
                insertAtCursor(`[${selected || '链接文字'}](url)`);
                break;
            case 'image':
                /* 触发文件选择 */
                fileInputRef.current?.click();
                break;
            case 'code':
                insertAtCursor(`\`${selected || '代码'}\``);
                break;
        }
    }

    /* 图片上传通用逻辑 */
    async function uploadImage(file: File) {
        const startMarker = UPLOADING_MARKER;
        insertAtCursor(startMarker);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const result = await res.json();

            if (result.code === 0 && result.data?.upload) {
                const markdown = `![${file.name}](${result.data.upload.path})`;
                onContentChange(content.replace(startMarker, markdown));
            } else {
                onContentChange(content.replace(startMarker, FAILED_MARKER));
                toast.error(result.message || '上传失败');
                setTimeout(() => {
                    onContentChange((prev: string) => prev.replace(FAILED_MARKER, ''));
                }, 3000);
            }
        } catch {
            onContentChange(content.replace(startMarker, FAILED_MARKER));
            toast.error('上传失败');
            setTimeout(() => {
                onContentChange((prev: string) => prev.replace(FAILED_MARKER, ''));
            }, 3000);
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) uploadImage(file);
        e.target.value = '';
    }

    /* 粘贴上传 */
    function handlePaste(e: React.ClipboardEvent) {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) uploadImage(file);
                return;
            }
        }
    }

    /* 拖拽上传 */
    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            uploadImage(file);
        }
    }

    /* Tab 缩进 */
    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Tab') {
            e.preventDefault();
            insertAtCursor('  ');
        }
    }

    return (
        <div className={styles.editor}>
            <div className={styles.miniToolbar}>
                <button className={styles.miniBtn} onClick={() => handleToolbarAction('bold')} title="粗体" type="button"><b>B</b></button>
                <button className={styles.miniBtn} onClick={() => handleToolbarAction('italic')} title="斜体" type="button"><i>I</i></button>
                <button className={styles.miniBtn} onClick={() => handleToolbarAction('h2')} title="二级标题" type="button">H2</button>
                <button className={styles.miniBtn} onClick={() => handleToolbarAction('h3')} title="三级标题" type="button">H3</button>
                <button className={styles.miniBtn} onClick={() => handleToolbarAction('link')} title="链接" type="button">🔗</button>
                <button className={styles.miniBtn} onClick={() => handleToolbarAction('image')} title="图片" type="button">📷</button>
                <button className={styles.miniBtn} onClick={() => handleToolbarAction('code')} title="行内代码" type="button">{'<>'}</button>
            </div>
            <div className={styles.editorWrapper}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <textarea
                    className={styles.textarea}
                    onChange={(e) => onContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder="开始书写..."
                    ref={textareaRef}
                    value={content}
                />
                {isDragging && (
                    <div className={styles.dropOverlay}>释放以上传图片</div>
                )}
            </div>
            <input accept="image/*" onChange={handleFileSelect} ref={fileInputRef} style={{ display: 'none' }} type="file" />
        </div>
    );
}
```

- [ ] **步骤 3：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/app/admin/posts/[id]/_components/markdown-editor.tsx src/app/admin/posts/[id]/_components/markdown-editor.module.css
git commit -m "feat(编辑器): 实现 Markdown 编辑区，含 mini 工具栏和图片粘贴/拖拽上传"
```

---

## 任务 14：MarkdownPreview 组件

**文件：**
- 创建：`src/app/admin/posts/[id]/_components/markdown-preview.tsx`
- 创建：`src/app/admin/posts/[id]/_components/markdown-preview.module.css`

- [ ] **步骤 1：创建 `markdown-preview.module.css`**

```css
.preview {
    padding: 2rem 2rem 4rem;
}

/* 预览模式头部（封面图 + 标题 + 元信息） */
.previewHeader {
    margin-bottom: 2rem;
}

.coverImage {
    width: 100%;
    max-height: 20rem;
    object-fit: cover;
    border: 1px solid var(--border);
    margin-bottom: 1.5rem;
}

.previewTitle {
    font-family: var(--font-serif);
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--foreground);
    margin: 0 0 0.75rem;
    line-height: 1.3;
}

.previewMeta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
}

.previewCategory {
    border: 1px solid var(--primary);
    color: var(--primary);
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.previewTags {
    display: flex;
    gap: 0.375rem;
}

.previewDate {
    font-size: 0.8125rem;
}
```

- [ ] **步骤 2：创建 `markdown-preview.tsx`**

```tsx
'use client';

import { MarkdownArticle } from '@/components/site/markdown-article';
import { Tag } from '@/components/ui/tag';
import { formatPostDate } from '@/lib/post-shared';

import styles from './markdown-preview.module.css';

interface MarkdownPreviewProps {
    content: string;
    /* 预览模式额外字段 */
    title?: string;
    coverImage?: string | null;
    altText?: string | null;
    categoryName?: string | null;
    tagNames?: string[];
    publishedAt?: string | null;
}

export default function MarkdownPreview({
    content,
    title,
    coverImage,
    altText,
    categoryName,
    tagNames,
    publishedAt,
}: MarkdownPreviewProps) {
    const showHeader = title || coverImage || categoryName || tagNames?.length;

    return (
        <div className={styles.preview}>
            {showHeader && (
                <div className={styles.previewHeader}>
                    {coverImage && (
                        <img
                            alt={altText || title || '封面图'}
                            className={styles.coverImage}
                            src={coverImage}
                        />
                    )}
                    {title && <h1 className={styles.previewTitle}>{title}</h1>}
                    <div className={styles.previewMeta}>
                        {categoryName && (
                            <span className={styles.previewCategory}>{categoryName}</span>
                        )}
                        {tagNames && tagNames.length > 0 && (
                            <div className={styles.previewTags}>
                                {tagNames.map((name) => (
                                    <Tag key={name} size="mini" variant="default">{name}</Tag>
                                ))}
                            </div>
                        )}
                        {publishedAt && (
                            <span className={styles.previewDate}>{formatPostDate(publishedAt)}</span>
                        )}
                    </div>
                </div>
            )}
            <MarkdownArticle content={content} />
        </div>
    );
}
```

- [ ] **步骤 3：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/app/admin/posts/[id]/_components/markdown-preview.tsx src/app/admin/posts/[id]/_components/markdown-preview.module.css
git commit -m "feat(编辑器): 实现预览组件，复用 MarkdownArticle，预览模式显示封面和元信息"
```

---

## 任务 15：MetadataPanel 组件

**文件：**
- 创建：`src/app/admin/posts/[id]/_components/metadata-panel.tsx`
- 创建：`src/app/admin/posts/[id]/_components/metadata-panel.module.css`

- [ ] **步骤 1：创建 `metadata-panel.module.css`**

```css
.panel {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.sectionTitle {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--foreground);
    margin: 0;
}

.label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--muted-foreground);
}

.input {
    height: 2.25rem;
    width: 100%;
    border: 1px solid var(--input);
    border-radius: var(--radius);
    background: var(--background);
    padding: 0 0.625rem;
    font-size: 0.8125rem;
    color: var(--foreground);
    transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--ring-subtle);
}

.datetimeInput {
    composes: input;
}

.divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0;
}

/* 标签多选 */
.tagSelector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.selectedTags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
}

.tagItem {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--primary);
    background: var(--primary-subtle-soft);
    color: var(--primary);
    font-size: 0.75rem;
    cursor: default;
}

.tagRemove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.875rem;
    height: 0.875rem;
    border: none;
    background: transparent;
    color: var(--primary);
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0;
}

.tagRemove:hover {
    color: var(--destructive);
}

.availableTags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}

.availableTag {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border: 1px solid var(--border);
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.availableTag:hover {
    border-color: var(--primary);
    color: var(--primary);
}
```

- [ ] **步骤 2：创建 `metadata-panel.tsx`**

```tsx
'use client';

import type { PostStatus } from '@/lib/post-shared';
import type { Category } from '@/lib/categories';
import type { Tag } from '@/lib/tags';
import { Select } from '@/components/ui/select';
import { toDateTimeLocalValue } from '@/lib/post-shared';
import CoverUpload from './cover-upload';
import { XIcon } from '@/components/ui/icons';

import styles from './metadata-panel.module.css';

interface MetadataPanelProps {
    categories: Category[];
    tags: Tag[];
    slug: string;
    status: PostStatus;
    publishedAt: string | null;
    coverImage: string | null;
    altText: string | null;
    categoryId: number | null;
    selectedTags: number[];
    onSlugChange: (value: string) => void;
    onStatusChange: (value: PostStatus) => void;
    onPublishedAtChange: (value: string | null) => void;
    onCoverImageChange: (value: string | null) => void;
    onAltTextChange: (value: string | null) => void;
    onCategoryIdChange: (value: number | null) => void;
    onTagsChange: (value: number[]) => void;
}

export default function MetadataPanel({
    categories,
    tags,
    slug,
    status,
    publishedAt,
    coverImage,
    altText,
    categoryId,
    selectedTags,
    onSlugChange,
    onStatusChange,
    onPublishedAtChange,
    onCoverImageChange,
    onAltTextChange,
    onCategoryIdChange,
    onTagsChange,
}: MetadataPanelProps) {
    /* 分类选项 */
    const categoryOptions = [
        { value: '__none__', label: '无分类' },
        ...categories.map((c) => ({ value: String(c.id), label: c.name })),
    ];
    const categoryValue = categoryId ? String(categoryId) : '__none__';

    /* 状态选项 */
    const statusOptions = [
        { value: 'draft' as PostStatus, label: '草稿' },
        { value: 'published' as PostStatus, label: '已发布' },
    ];

    /* 标签操作 */
    function handleAddTag(tagId: number) {
        if (!selectedTags.includes(tagId)) {
            onTagsChange([...selectedTags, tagId]);
        }
    }

    function handleRemoveTag(tagId: number) {
        onTagsChange(selectedTags.filter((id) => id !== tagId));
    }

    const availableTags = tags.filter((t) => !selectedTags.includes(t.id));

    return (
        <div className={styles.panel}>
            {/* 封面图 */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>封面图</h4>
                <CoverUpload
                    altText={altText}
                    coverImage={coverImage}
                    onAltTextChange={onAltTextChange}
                    onCoverImageChange={onCoverImageChange}
                />
            </div>

            <hr className={styles.divider} />

            {/* 分类 */}
            <div className={styles.section}>
                <label className={styles.label}>分类</label>
                <Select
                    onChange={(val) => onCategoryIdChange(val === '__none__' ? null : Number(val))}
                    options={categoryOptions}
                    value={categoryValue}
                />
            </div>

            {/* 标签 */}
            <div className={styles.section}>
                <label className={styles.label}>标签</label>
                <div className={styles.tagSelector}>
                    {selectedTags.length > 0 && (
                        <div className={styles.selectedTags}>
                            {selectedTags.map((tagId) => {
                                const tag = tags.find((t) => t.id === tagId);
                                return tag ? (
                                    <span className={styles.tagItem} key={tagId}>
                                        {tag.name}
                                        <button className={styles.tagRemove} onClick={() => handleRemoveTag(tagId)} type="button">
                                            <XIcon style={{ width: '0.625rem', height: '0.625rem' }} />
                                        </button>
                                    </span>
                                ) : null;
                            })}
                        </div>
                    )}
                    {availableTags.length > 0 && (
                        <div className={styles.availableTags}>
                            {availableTags.map((tag) => (
                                <button className={styles.availableTag} key={tag.id} onClick={() => handleAddTag(tag.id)} type="button">
                                    + {tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <hr className={styles.divider} />

            {/* Slug */}
            <div className={styles.section}>
                <label className={styles.label}>Slug</label>
                <input
                    className={styles.input}
                    onChange={(e) => onSlugChange(e.target.value)}
                    placeholder="url-friendly-slug"
                    type="text"
                    value={slug}
                />
            </div>

            {/* 状态 */}
            <div className={styles.section}>
                <label className={styles.label}>状态</label>
                <Select
                    onChange={onStatusChange}
                    options={statusOptions}
                    value={status}
                />
            </div>

            {/* 发布时间 */}
            <div className={styles.section}>
                <label className={styles.label}>发布时间</label>
                <input
                    className={styles.datetimeInput}
                    onChange={(e) => onPublishedAtChange(e.target.value || null)}
                    type="datetime-local"
                    value={toDateTimeLocalValue(publishedAt)}
                />
            </div>
        </div>
    );
}
```

- [ ] **步骤 3：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/app/admin/posts/[id]/_components/metadata-panel.tsx src/app/admin/posts/[id]/_components/metadata-panel.module.css
git commit -m "feat(编辑器): 实现元数据面板，含封面图、分类、标签、Slug、状态、时间"
```

---

## 任务 16：CoverUpload 组件

**文件：**
- 创建：`src/app/admin/posts/[id]/_components/cover-upload.tsx`
- 创建：`src/app/admin/posts/[id]/_components/cover-upload.module.css`

- [ ] **步骤 1：创建 `cover-upload.module.css`**

```css
.upload {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.dropzone {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 8rem;
    border: 1px dashed var(--input);
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: 0.8125rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.dropzone:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-subtle-soft);
}

.dropzoneDragging {
    composes: dropzone;
    border-color: var(--primary);
    background: var(--primary-subtle);
    color: var(--primary);
}

.preview {
    position: relative;
    border: 1px solid var(--border);
}

.previewImage {
    width: 100%;
    height: 8rem;
    object-fit: cover;
}

.removeBtn {
    position: absolute;
    top: 0.375rem;
    right: 0.375rem;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0;
    transition: background 0.15s ease;
}

.removeBtn:hover {
    background: var(--destructive);
}

.altInput {
    height: 2rem;
    width: 100%;
    border: 1px solid var(--input);
    border-radius: var(--radius);
    background: var(--background);
    padding: 0 0.5rem;
    font-size: 0.75rem;
    color: var(--foreground);
    transition: border-color 0.15s, box-shadow 0.15s;
}

.altInput:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--ring-subtle);
}
```

- [ ] **步骤 2：创建 `cover-upload.tsx`**

```tsx
'use client';

import { useRef, useState } from 'react';
import { api } from '@/lib/http-client';
import { toast } from '@/components/ui/toast';
import { XIcon } from '@/components/ui/icons';

import styles from './cover-upload.module.css';

interface CoverUploadProps {
    coverImage: string | null;
    altText: string | null;
    onCoverImageChange: (value: string | null) => void;
    onAltTextChange: (value: string | null) => void;
}

export default function CoverUpload({
    coverImage,
    altText,
    onCoverImageChange,
    onAltTextChange,
}: CoverUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    async function uploadFile(file: File) {
        if (!file.type.startsWith('image/')) {
            toast.error('请上传图片文件');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const result = await res.json();

            if (result.code === 0 && result.data?.upload) {
                onCoverImageChange(result.data.upload.path);
                toast.success('封面图上传成功');
            } else {
                toast.error(result.message || '上传失败');
            }
        } catch {
            toast.error('上传失败');
        } finally {
            setIsUploading(false);
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        e.target.value = '';
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
    }

    function handleRemove() {
        onCoverImageChange(null);
        onAltTextChange(null);
    }

    return (
        <div className={styles.upload}>
            {coverImage ? (
                <div className={styles.preview}>
                    <img alt={altText || '封面图'} className={styles.previewImage} src={coverImage} />
                    <button className={styles.removeBtn} onClick={handleRemove} title="移除封面图" type="button">
                        <XIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                </div>
            ) : (
                <div
                    className={isDragging ? styles.dropzoneDragging : styles.dropzone}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {isUploading ? '上传中...' : '点击或拖拽上传封面图'}
                </div>
            )}
            {coverImage && (
                <input
                    className={styles.altInput}
                    onChange={(e) => onAltTextChange(e.target.value || null)}
                    placeholder="封面图描述（alt text）"
                    type="text"
                    value={altText || ''}
                />
            )}
            <input accept="image/*" onChange={handleFileSelect} ref={fileInputRef} style={{ display: 'none' }} type="file" />
        </div>
    );
}
```

- [ ] **步骤 3：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/app/admin/posts/[id]/_components/cover-upload.tsx src/app/admin/posts/[id]/_components/cover-upload.module.css
git commit -m "feat(编辑器): 实现封面图上传组件，支持拖拽和点击上传"
```

---

## 任务 17：ImageUploadDialog 组件

**文件：**
- 创建：`src/app/admin/posts/[id]/_components/image-upload-dialog.tsx`
- 创建：`src/app/admin/posts/[id]/_components/image-upload-dialog.module.css`

- [ ] **步骤 1：创建 `image-upload-dialog.module.css`**

```css
.dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 10rem;
    border: 1px dashed var(--input);
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.dropzone:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.dropzoneActive {
    composes: dropzone;
    border-color: var(--primary);
    background: var(--primary-subtle);
    color: var(--primary);
}

.previewWrap {
    margin-top: 0.75rem;
}

.previewImage {
    max-width: 100%;
    max-height: 12rem;
    object-fit: contain;
    border: 1px solid var(--border);
}

.altField {
    margin-top: 0.75rem;
}

.altLabel {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--muted-foreground);
    display: block;
    margin-bottom: 0.375rem;
}

.altInput {
    height: 2.25rem;
    width: 100%;
    border: 1px solid var(--input);
    border-radius: var(--radius);
    background: var(--background);
    padding: 0 0.625rem;
    font-size: 0.8125rem;
    color: var(--foreground);
}

.altInput:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--ring-subtle);
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
}

.insertBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.25rem;
    padding: 0 1rem;
    border: none;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;
}

.insertBtn:hover {
    background: var(--primary-hover);
}

.insertBtn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.cancelBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.25rem;
    padding: 0 1rem;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    font-size: 0.8125rem;
    cursor: pointer;
}

.cancelBtn:hover {
    border-color: var(--primary);
    color: var(--primary);
}
```

- [ ] **步骤 2：创建 `image-upload-dialog.tsx`**

```tsx
'use client';

import { useState, useRef } from 'react';
import Dialog from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';

import styles from './image-upload-dialog.module.css';

interface ImageUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onInsert: (markdown: string) => void;
}

export default function ImageUploadDialog({ open, onClose, onInsert }: ImageUploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [altText, setAltText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileSelect(selectedFile: File) {
        if (!selectedFile.type.startsWith('image/')) {
            toast.error('请上传图片文件');
            return;
        }
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        if (!altText) setAltText(selectedFile.name.replace(/\.[^.]+$/, ''));
    }

    function handleReset() {
        setFile(null);
        setPreviewUrl(null);
        setAltText('');
        setIsUploading(false);
    }

    function handleClose() {
        handleReset();
        onClose();
    }

    async function handleInsert() {
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const result = await res.json();

            if (result.code === 0 && result.data?.upload) {
                const markdown = altText
                    ? `![${altText}](${result.data.upload.path})`
                    : `![](${result.data.upload.path})`;
                onInsert(markdown);
                handleClose();
                toast.success('图片已插入');
            } else {
                toast.error(result.message || '上传失败');
            }
        } catch {
            toast.error('上传失败');
        } finally {
            setIsUploading(false);
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) handleFileSelect(droppedFile);
    }

    return (
        <Dialog onClose={handleClose} open={open} title="插入图片">
            {!previewUrl ? (
                <div
                    className={isDragging ? styles.dropzoneActive : styles.dropzone}
                    onClick={() => fileInputRef.current?.click()}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    点击或拖拽图片到此处
                </div>
            ) : (
                <div className={styles.previewWrap}>
                    <img alt="预览" className={styles.previewImage} src={previewUrl} />
                </div>
            )}

            {previewUrl && (
                <div className={styles.altField}>
                    <label className={styles.altLabel}>替代文字（alt）</label>
                    <input
                        className={styles.altInput}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="描述图片内容"
                        type="text"
                        value={altText}
                    />
                </div>
            )}

            <div className={styles.actions}>
                <button className={styles.cancelBtn} onClick={handleClose} type="button">取消</button>
                <button className={styles.insertBtn} disabled={!file || isUploading} onClick={handleInsert} type="button">
                    {isUploading ? '上传中...' : '上传并插入'}
                </button>
            </div>

            <input
                accept="image/*"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                    e.target.value = '';
                }}
                ref={fileInputRef}
                style={{ display: 'none' }}
                type="file"
            />
        </Dialog>
    );
}
```

- [ ] **步骤 3：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 4：Commit**

```bash
git add src/app/admin/posts/[id]/_components/image-upload-dialog.tsx src/app/admin/posts/[id]/_components/image-upload-dialog.module.css
git commit -m "feat(编辑器): 实现图片上传弹窗，含拖拽、预览和 alt 输入"
```

---

## 任务 18：图片管理页面

**文件：**
- 创建：`src/app/admin/uploads/page.tsx`
- 创建：`src/app/admin/uploads/_components/upload-management.tsx`
- 创建：`src/app/admin/uploads/_components/upload-management.module.css`

- [ ] **步骤 1：创建 `upload-management.module.css`**

```css
.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
}

.card {
    border: 1px solid var(--border);
    background: var(--card);
    overflow: hidden;
    transition: border-color 0.15s ease;
}

.card:hover {
    border-color: rgba(159, 0, 15, 0.4);
}

.cardImage {
    width: 100%;
    height: 120px;
    object-fit: cover;
    display: block;
}

.cardBody {
    padding: 0.5rem;
}

.cardName {
    font-size: 0.75rem;
    color: var(--foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
}

.cardMeta {
    font-size: 0.6875rem;
    color: var(--muted-foreground);
    margin: 0.25rem 0 0;
}

.cardActions {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.375rem;
}

.cardBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.5rem;
    padding: 0 0.5rem;
    border: 1px solid var(--border);
    background: var(--background);
    font-size: 0.6875rem;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: all 0.15s ease;
}

.cardBtn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.cardBtnDanger:hover {
    border-color: var(--destructive);
    color: var(--destructive);
    background: var(--destructive-subtle);
}
```

- [ ] **步骤 2：创建 `upload-management.tsx`**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';

import { Trash2Icon, CopyIcon } from '@/components/ui/icons';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import Pagination from '@/components/ui/pagination';
import { toast } from '@/components/ui/toast';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { api } from '@/lib/http-client';

import styles from './upload-management.module.css';

interface UploadItem {
    id: number;
    filename: string;
    original: string;
    path: string;
    size: number;
    mime: string;
    alt: string;
    createdAt: string;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function UploadManagement() {
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const pageSize = 20;

    const fetchUploads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get<{ data: UploadItem[]; total: number }>(`/admin/uploads?page=${page}&pageSize=${pageSize}`);
            if (res.code === 0 && res.data) {
                setUploads(res.data.data);
                setTotal(res.data.total);
            }
        } catch {
            toast.error('获取图片列表失败');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchUploads();
    }, [fetchUploads]);

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setDeleting(deleteTarget.id);
        try {
            const res = await api.delete(`/admin/uploads/${deleteTarget.id}`);
            if (res.code === 0) {
                toast.success('删除成功');
                fetchUploads();
            } else {
                toast.error(res.message || '删除失败');
            }
        } catch {
            toast.error('删除请求失败');
        } finally {
            setDeleting(null);
            setDeleteTarget(null);
        }
    }

    function handleCopyMarkdown(path: string) {
        const markdown = `![](${path})`;
        navigator.clipboard.writeText(markdown);
        toast.success('Markdown 已复制');
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <>
            <AdminPageHeader
                description="管理已上传的图片资源。"
                eyebrow="Uploads"
                tag={`${total} 张图片`}
                title="图片管理"
            />

            {loading ? (
                <p style={{ color: 'var(--muted-foreground)' }}>加载中...</p>
            ) : uploads.length === 0 ? (
                <p style={{ color: 'var(--muted-foreground)' }}>暂无图片</p>
            ) : (
                <div className={styles.grid}>
                    {uploads.map((upload) => (
                        <div className={styles.card} key={upload.id}>
                            <img alt={upload.alt || upload.original} className={styles.cardImage} src={upload.path} />
                            <div className={styles.cardBody}>
                                <p className={styles.cardName}>{upload.original}</p>
                                <p className={styles.cardMeta}>{formatSize(upload.size)} · {upload.createdAt}</p>
                                <div className={styles.cardActions}>
                                    <button className={styles.cardBtn} onClick={() => handleCopyMarkdown(upload.path)} type="button">
                                        <CopyIcon style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                                        复制
                                    </button>
                                    <button
                                        className={`${styles.cardBtn} ${styles.cardBtnDanger}`}
                                        disabled={deleting === upload.id}
                                        onClick={() => setDeleteTarget({ id: upload.id, name: upload.original })}
                                        type="button"
                                    >
                                        <Trash2Icon style={{ width: '0.75rem', height: '0.75rem', marginRight: '0.25rem' }} />
                                        删除
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination current={page} onPageChange={setPage} total={totalPages} />

            <ConfirmDialog
                confirmLabel="删除"
                message={`确定要删除图片「${deleteTarget?.name ?? ''}」吗？如果被文章引用，文章中将无法显示该图片。此操作不可撤销。`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                open={!!deleteTarget}
                loading={deleting !== null}
                title="确认删除"
            />
        </>
    );
}
```

- [ ] **步骤 3：创建 `src/app/admin/uploads/page.tsx`**

```tsx
import type { Metadata } from 'next';

import UploadManagement from '@/app/admin/uploads/_components/upload-management';

export const metadata: Metadata = {
    title: '图片管理 - Zhijian',
};

export default function AdminUploadsPage() {
    return <UploadManagement />;
}
```

- [ ] **步骤 4：运行类型检查**

运行：`npm run typecheck`

- [ ] **步骤 5：Commit**

```bash
git add src/app/admin/uploads/
git commit -m "feat(图片管理): 实现图片管理页面，网格视图、复制 Markdown、删除"
```

---

## 任务 19：集成测试与修复

**文件：**
- 可能需要微调上述所有文件

- [ ] **步骤 1：运行完整类型检查**

运行：`npm run typecheck`

- [ ] **步骤 2：运行开发服务器，手动测试关键流程**

运行：`npm run dev`

测试要点：
1. 文章列表页能正确显示文章（含分类和标签名称）
2. 点击"新建文章"创建草稿并跳转到编辑页
3. 编辑器分栏模式正常渲染，左侧编辑右侧预览
4. 标题、摘要、内容编辑正常，3 秒防抖自动保存
5. 切换到编辑模式/预览模式正常
6. 元数据面板：封面图上传、分类选择、标签多选、Slug 编辑、状态切换、发布时间
7. 粘贴图片到编辑区，自动上传并插入 Markdown
8. 图片管理页面能显示已上传图片，复制 Markdown，删除
9. 侧边栏出现"图片管理"导航项，高亮匹配正常

- [ ] **步骤 3：修复发现的问题**

根据测试结果修复代码问题，每个修复单独 commit。

- [ ] **步骤 4：最终 Commit**

```bash
git add -A
git commit -m "fix(编辑器): 修复集成测试中发现的问题"
```

---

## 任务 20：更新文档

**文件：**
- 修改：`docs/AGENTS.md`
- 修改：`docs/style-guide.md`

- [ ] **步骤 1：更新 AGENTS.md**

新增内容：
- 技术栈新增图片上传相关说明
- API 路由新增 upload/uploads 相关路由
- 数据库表新增 zhijian_blog_uploads
- zhijian_blog_posts 表新增 cover_image/alt_text/category_id/tags 字段
- 前端组件列表新增编辑器组件和图片管理组件
- lib 目录新增 uploads.ts
- APP_ROUTES 新增 adminUploads

- [ ] **步骤 2：更新 style-guide.md**

新增内容：
- 编辑器布局规格（全屏独立页面、三种视图模式）
- 图片卡片样式模式
- 封面图上传区样式模式

- [ ] **步骤 3：Commit**

```bash
git add docs/AGENTS.md docs/style-guide.md
git commit -m "docs: 更新项目文档，补充文章编辑器和图片管理相关说明"
```

---

## 自检清单

- [x] **规格覆盖度**：设计文档六节全部有对应任务
  - 一、页面路由与布局 → 任务 10、11
  - 二、数据库 Schema → 任务 1
  - 三、API 设计 → 任务 5、6
  - 四、前端组件设计 → 任务 11-17
  - 五、数据流与交互 → 任务 11（自动保存/插入图片/删除）
  - 六、导航变更 → 任务 7
- [x] **占位符扫描**：无"待定"/"TODO"/"后续实现"等占位符
- [x] **类型一致性**：所有接口定义与使用一致（Post、Category、Tag、Upload 等）
