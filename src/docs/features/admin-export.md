# 文章导出

后台文章列表页支持两种导出方式：**全部导出**（工具栏按钮）和**单篇导出**（每行操作列按钮），将文章 + 引用图片打包为 ZIP 下载。

## ZIP 结构

```
zhijian-export-2026-06-17.zip
├── manifest.json              ← 导出清单（文章数、图片数、导出时间、缺失文件）
├── images/                    ← 所有文章引用的图片
│   ├── cover-1.jpg            ← 封面图（cover-{postId}.{ext}）
│   ├── a1b2c3d4.jpg           ← 正文图片（保留原哈希文件名）
│   └── ...
├── 文章标题.md                 ← 每篇文章一个 .md（Front Matter + 正文）
└── 另一篇文章.md
```

## MD 文件格式

每篇文章导出为独立 `.md`，元信息写在 YAML Front Matter，正文中的图片路径已替换为相对路径 `images/xxx.jpg`：

```markdown
---
title: 知简项目设计思路
slug: zhijian-design
status: published
category: 技术笔记
tags: [React, TypeScript]
publishedAt: 2026-06-15
coverImage: images/cover-3.jpg
---

正文内容...（图片路径已替换）
```

- 封面图：`/uploads/2026/06/xxx.jpg` → `images/cover-{postId}.jpg`
- 正文图片：`/uploads/2026/06/xxx.jpg` → `images/xxx.jpg`
- 文件名：标题去非法字符，冲突时追加序号
- 含 `:` `#` 等 YAML 特殊字符的字段自动加双引号转义

## API

```
GET /api/admin/posts/export       → 导出全部文章
GET /api/admin/posts/export?id=3  → 导出指定文章
```

**鉴权**：需要 admin 登录态（cookie `zhijian_session`）

**响应**：`Content-Type: application/zip`，流式下载

## 前端

| 入口 | 位置 |
|------|------|
| 全部导出 | 文章列表页工具栏，「全部导出」按钮 |
| 单篇导出 | 每行操作列，下载图标按钮 |

点击后按钮显示「导出中...」，完成后触发浏览器下载，toast 提示结果。

## 边界处理

- 图片文件不存在 → 跳过，记入 `manifest.json` 的 `missingFiles`
- 权限异常 → 跳过该图片，不中断导出
- 无文章 → 正常导出空 ZIP

## 涉及文件

| 文件 | 说明 |
|------|------|
| `src/app/api/admin/posts/export/route.ts` | 导出 API（鉴权 + archiver 流式打包） |
| `src/lib/domain/posts.ts` | `extractImagePaths()` 从 Markdown 提取图片路径 |
| `src/app/admin/_components/post-management-client.tsx` | 工具栏按钮 + 行内导出按钮 |
| `package.json` | `archiver` 依赖（ZIP 打包） |
