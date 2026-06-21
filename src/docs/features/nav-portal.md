# 导航页设计规格

## 概述

为 zhijian 项目新增浏览器导航页功能，路径 `/nav`，全屏分页布局，上下滑动切换三屏内容。前期数据使用配置文件 + localStorage，后期接入数据库 + API 支持多用户。

## 页面结构

三屏各占 100vh，CSS `scroll-snap` 实现整屏切换：

1. **第一屏：搜索 + 书签**（默认首屏）
2. **第二屏：备忘录（待办）**
3. **第三屏：笔记（知识库）**

左侧贴边 Dock 指示器，3 个圆点对应三屏，当前屏高亮，点击跳转。

```
┌─────────────────────────────────┐
│  第一屏：搜索 + 书签             │
│                                 │
│         搜索栏（居中）           │
│   [Google ▼] [___________] 🔍   │
│                                 │
│   书签栏（横向排列）             │
│   🌐GitHub 📧Gmail 📁工具 💬Slack│
│                                 │
│           ▽                     │
├─────────────────────────────────┤
│  第二屏：备忘录（待办）          │
│                                 │
│   ☐ 买牛奶                      │
│   ☑ 发周报                      │
│   ☐ 看文档                      │
│   + 添加待办                    │
│                                 │
│           ▽                     │
├─────────────────────────────────┤
│  第三屏：笔记（知识库）          │
│                                 │
│   📝 今天学了...                │
│   📝 React 18 笔记             │
│   + 新建笔记                    │
│                                 │
└─────────────────────────────────┘
```

## 模块设计

### 搜索栏

- 居中显示，输入关键词后跳转到搜索引擎结果页
- 可切换搜索引擎：Google / 百度 / Bing / DuckDuckGo
- 下方显示最近搜索记录（最多 10 条），点击可快速搜索
- 前期：搜索引擎列表写死，搜索记录存 localStorage

### 书签栏

- 横向排列，每个书签显示 favicon + 名称，点击跳转
- 支持文件夹：hover 文件夹弹出浮层，展示文件夹内书签
- 前期：书签数据写死在 `src/lib/nav-config.ts`

### 备忘录（待办）

- 待办列表，支持添加/勾选/删除
- 前期数据存 localStorage

### 笔记（知识库）

- 笔记列表，点击进入 Markdown 编辑
- 复用项目已有的 react-markdown + rehype-highlight
- 前期数据存 localStorage

### Dock 指示器

- 左侧贴边，3 个圆点对应三屏
- 当前屏高亮，点击跳转对应屏
- 始终可见，不遮挡内容

## 数据策略

| 数据 | 前期 | 后期 |
|------|------|------|
| 书签 | 配置文件写死 | 数据库 + API |
| 搜索记录 | localStorage | 数据库 + API |
| 备忘录 | localStorage | 数据库 + API |
| 笔记 | localStorage | 数据库 + API |

数据层抽离为独立模块，后期只需替换数据源，上层代码不变。

## 技术方案

- 全屏分页：CSS `scroll-snap-type: y mandatory`，每屏 `height: 100vh; scroll-snap-align: start`
- Dock 指示器：`position: fixed; left`，监听 `IntersectionObserver` 追踪当前屏
- 搜索引擎跳转：`window.open(url + encodeURIComponent(query))`
- favicon 获取：Google Favicon API `https://www.google.com/s2/favicons?domain=xxx&sz=32`，或本地默认图标
- 笔记编辑：复用 react-markdown + rehype-highlight（项目已安装）
- 无额外 npm 依赖

## 主题

复用 `theme.css` 文人书斋变量，导航页风格与主站一致。

## 路由

- `/nav` — 导航页入口，独立 layout（无后台侧边栏）
- 后期可拆分独立部署

## 文件结构

```
src/app/nav/
  page.tsx                    # 导航页入口
  layout.tsx                  # 导航页独立布局
  _components/
    nav-shell.tsx             # 全屏分页容器（scroll-snap + Dock）
    search-section.tsx        # 第一屏：搜索栏 + 书签
    search-bar.tsx            # 搜索栏 + 搜索引擎切换
    bookmark-bar.tsx          # 书签栏
    bookmark-item.tsx         # 单个书签
    bookmark-folder.tsx       # 书签文件夹
    todo-section.tsx          # 第二屏：备忘录
    note-section.tsx          # 第三屏：笔记
    dock-indicator.tsx        # Dock 指示器
    *.module.css              # 各组件样式
src/lib/
  nav-config.ts               # 书签配置（前期写死数据）
  nav-storage.ts              # localStorage 读写封装
```

## 实施顺序

1. 导航页骨架：layout + nav-shell（scroll-snap） + Dock 指示器
2. 第一屏：搜索栏 + 书签栏
3. 第二屏：备忘录（待办）
4. 第三屏：笔记（知识库）
5. 后期：数据库 + API + 多用户
