# 文章一键导出

后台文章列表页的一键导出功能，将所有文章和文章引用的图片打包为 ZIP 下载。

## 导出结构

```
zhijian-export-2026-06-15.zip
├── manifest.json                    ← 导出清单（文章数、图片数、导出时间、缺失文件记录）
├── images/                          ← 所有文章引用的图片
│   ├── cover-1.jpg                  ← 封面图（以 cover-{postId}.{ext} 命名避免冲突）
│   ├── cover-3.png
│   ├── a1b2c3d4.jpg                 ← 正文图片（保留原哈希文件名）
│   └── e5f6g7h8.png
├── 我的文章标题.md                   ← 每篇文章一个 md 文件
├── 另一篇文章.md
└── 无标题草稿.md
```

## MD 文件格式

每篇文章导出为独立 `.md` 文件，元信息写在 Front Matter，正文保持 Markdown 原文：

```markdown
---
title: 我的文章标题
slug: my-article
status: published
category: 技术笔记
tags: [React, TypeScript]
publishedAt: 2026-06-15
coverImage: images/cover-1.jpg
---

正文内容...（图片路径已替换为相对路径 images/xxx.jpg）
```

### 路径替换规则

- 封面图：`/uploads/2026/06/xxx.jpg` → `images/cover-{postId}.jpg`，Front Matter `coverImage` 字段同步更新
- 正文图片：`/uploads/2026/06/xxx.jpg` → `images/xxx.jpg`，Markdown 原文中的路径同步替换

替换后解压即可在任意 Markdown 编辑器中直接预览图片。

### 文件名规则

- 用文章标题做文件名，非法字符（`/ \ : * ? " < > |`）替换为 `-`
- 标题冲突时追加 id，如 `我的文章-2.md`
- 标题为空时使用 `untitled-{id}.md`

## 技术方案

### 后端

新增 API Route：`GET /api/admin/posts/export`

```
流程：
1. requireAdminFromRequest 鉴权
2. getAllPosts() 获取全部文章（含 content）
3. 从每篇文章提取图片引用：
   - coverImage 字段
   - content 中 Markdown 图片语法 ![alt](/uploads/xxx)
4. 去重，收集所有 /uploads/... 路径
5. 用 archiver（Node.js ZIP 库）流式打包：
   - 每篇文章生成 .md 文件（Front Matter + 替换路径后的正文）
   - 封面图复制到 images/cover-{id}.{ext}
   - 正文图片复制到 images/{filename}
   - manifest.json 写入导出元信息
6. 流式返回 ZIP（Content-Type: application/zip）
```

#### 图片提取逻辑

文章中图片有两种来源：

- **封面图**：`post.coverImage` → 如 `/uploads/2026/06/a1b2c3d4.jpg`
- **正文图片**：Markdown `![alt](path)` 语法 → 正则提取 `/uploads/...` 路径

```typescript
// 从 Markdown content 中提取所有 /uploads/ 图片路径
function extractImagePaths(content: string): string[] {
  const regex = /!\[.*?\]\((\/uploads\/[^\s)]+)\)/g;
  const paths: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1]);
  }
  return paths;
}
```

### 前端

在 `post-management-client.tsx` 工具栏加导出按钮：

```
[搜索框] [状态筛选]          [导出文章] [新建文章]
```

- 点击后按钮显示「导出中...」
- 调用 `/api/admin/posts/export`，收到 Blob 后用 `URL.createObjectURL` + `<a download>` 触发下载
- 下载完成后 toast 提示「导出成功」
- 失败时 toast 提示错误信息
- 前端请求 timeout 设为 60s

### API 规格

```
GET /api/admin/posts/export

Response: application/zip 流式下载
Headers:
  Content-Type: application/zip
  Content-Disposition: attachment; filename="zhijian-export-2026-06-15.zip"
```

## 涉及文件

| 文件 | 变更 |
|------|------|
| `src/app/api/admin/posts/export/route.ts` | 新增 — 导出 API |
| `src/lib/posts.ts` | 新增 `extractImagePaths()` 工具函数 |
| `src/app/admin/_components/post-management-client.tsx` | 修改 — 加导出按钮 |
| `package.json` | 新增 `archiver` 依赖（ZIP 打包） |

## 边界处理

- **图片文件不存在**：跳过，不中断导出，在 manifest.json 中记录缺失文件列表
- **文章数量多**：流式写入 ZIP，不一次性加载到内存
- **无文章 / 无图片**：正常导出空 ZIP，posts 列表为空
- **前端超时**：请求 timeout 60s，后端无硬性超时限制
