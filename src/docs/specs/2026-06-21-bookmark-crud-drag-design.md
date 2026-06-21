# 书签增删改 + 拖拽排序 设计规格

## 概述

为导航页书签栏添加右键菜单操作（编辑、删除、新增）和同层拖拽排序功能。数据持久化到 localStorage。

## 数据层

### nav-storage.ts 新增

- 存储键：`zhijian_nav_bookmarks`
- `getBookmarks(): Bookmark[]` — 读取 localStorage，为空时用 `nav-config.ts` 的 `BOOKMARKS` 初始化并写入
- `saveBookmarks(bookmarks: Bookmark[]): void` — 写入 localStorage

### 数据结构变更

`BookmarkItem` 和 `BookmarkFolder` 增加 `id` 字段用于拖拽标识：

```ts
export interface BookmarkItem {
    id: string;
    name: string;
    url: string;
}

export interface BookmarkFolder {
    id: string;
    name: string;
    children: BookmarkItem[];
}
```

`nav-config.ts` 的 `BOOKMARKS` 保留作为默认数据源，每项带 `id`。组件不再直接引用 `BOOKMARKS`，改用 `nav-storage.ts` 的 `getBookmarks()`。

## 右键菜单

### 组件：`bookmark-context-menu.tsx` + CSS Module

- `position: fixed`，坐标由 `contextmenu` 事件的 `clientX/clientY` 决定
- 点击菜单外任意位置或 ESC 关闭
- 菜单项根据右击目标动态显示：

| 右击目标 | 菜单项 |
|---------|--------|
| 书签 | 编辑、删除 |
| 文件夹 | 编辑、删除、文件夹内新增书签 |
| 书签栏空白区域 | 新增书签、新增文件夹 |

## 编辑弹窗

复用项目已有 `Dialog` 组件：

| 操作 | 字段 |
|------|------|
| 编辑书签 | 名称 + URL |
| 编辑文件夹 | 仅名称 |
| 新增书签 | 名称 + URL |
| 新增文件夹 | 仅名称 |
| 文件夹内新增 | 名称 + URL（只能新增书签，不能嵌套文件夹） |

删除文件夹时连同子项一起删除，弹确认提示。

## 拖拽排序

- HTML5 原生 Drag & Drop API（`draggable`、`onDragStart`、`onDragOver`、`onDrop`）
- 仅同层排序：书签栏内书签互换位置，文件夹内子书签互换位置
- 拖拽时目标位置显示插入指示线
- 拖拽结束后调用 `saveBookmarks()` 持久化
- 不允许跨层拖拽（书签不能拖进文件夹，文件夹内子项不能拖出）

## 组件结构

```
bookmark-bar.tsx
  ├─ 状态管理：bookmarks 数组、右键菜单状态、Dialog 编辑状态
  ├─ BookmarkLink（draggable + onContextMenu）
  ├─ BookmarkContextMenu（fixed 定位右键菜单）
  └─ Dialog（编辑/新增弹窗，复用现有）
```

所有状态提升到 `BookmarkBar`，子组件通过回调操作。
