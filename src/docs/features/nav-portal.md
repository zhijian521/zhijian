# 导航页

知简导航页是一个浏览器导航功能，路径 `/nav`，全屏四屏分页布局，上下滑动切换内容。已登录用户数据存数据库，未登录用户数据存 localStorage。

---

## 目录

- [页面结构](#页面结构)
- [模块设计](#模块设计)
- [数据策略](#数据策略)
- [API 端点](#api-端点)
- [文件结构](#文件结构)
- [技术方案](#技术方案)

---

## 页面结构

四屏各占 100vh，CSS `scroll-snap` 实现整屏切换：

1. **第一屏：搜索 + 书签**（默认首屏）
2. **第二屏：AI 对话**（DeepSeek，多会话，流式输出）
3. **第三屏：备忘录（待办）**
4. **第四屏：笔记（知识库）**

`Alt+1/2/3/4` 键盘快捷键跳转各屏。

```
┌─────────────────────────────────┐
│  第一屏：搜索 + 书签             │
│                                 │
│         搜索栏（居中）           │
│   [Google ▼] [___________] 🤖   │  ← AI 按钮（回车仍走搜索引擎搜索）
│                                 │
│   书签栏（横向排列）             │
│   🌐GitHub 📧Gmail 📁工具 💬Slack│
│                                 │
│           ▽                     │
├─────────────────────────────────┤
│  第二屏：AI 对话                 │
│                                 │
│   左侧：会话列表    右侧：消息流 │
│   + 新建对话        🤖 AI 回复...│
│   · React 是什么   你好！...    │
│   · 写首诗          ┌──────────┐│
│                     │输入消息...││
│                     └──────────┘│
│           ▽                     │
├─────────────────────────────────┤
│  第三屏：备忘录（四象限）        │
│  第四屏：笔记（知识库）          │
└─────────────────────────────────┘
```

---

## 模块设计

### 搜索栏

- 居中显示，输入关键词后**回车跳转到搜索引擎结果页**（行为不变）
- 可切换搜索引擎：Google / 百度 / Bing / Yahoo / Yandex / DuckDuckGo
- 搜索引擎列表配置在 `src/lib/nav-config.ts`
- 右侧为 **AI 按钮**（非搜索按钮）：点击跳到第二屏 AI 对话；若搜索框有内容，自动作为首条消息发送

### AI 对话

- DeepSeek API（OpenAI 兼容接口），SSE 流式逐字输出
- **多会话**：左侧会话列表，可新建 / 切换 / 删除；标题取首条用户消息
- 多轮对话带上下文；assistant 消息支持 Markdown（复用 `MarkdownArticle`）
- **模型选择**：详情栏顶部下拉，从 `/api/ai/models` 拉取可用列表；偏好仅存本地 localStorage
  - 优先级：用户在 UI 选的模型 > env `DEEPSEEK_MODEL` > 默认 `deepseek-chat`
- 数据策略：已登录存数据库，未登录存 localStorage
- 鉴权：需登录（`withUser`），未登录点 AI 按钮会引导登录
- API Key 配置在 `.env` 的 `DEEPSEEK_API_KEY`，未配置则提示「AI 未配置」

### 书签栏

- 横向排列，每个书签显示 favicon + 名称，点击跳转
- 支持文件夹：hover 文件夹弹出浮层，展示文件夹内书签
- **右键菜单**：添加书签 / 编辑 / 删除
- **拖拽排序**：书签间可拖拽调整顺序（`drag-utils.ts`）
- Favicon 通过 `/api/favicon` 代理获取

### 备忘录（待办）

- 待办列表，支持添加 / 勾选 / 删除
- **拖拽排序**：待办项可拖拽调整顺序
- 数据策略：已登录存数据库，未登录存 localStorage

### 笔记（知识库）

- 笔记列表，点击进入 Markdown 编辑
- 复用项目已有的 react-markdown + rehype-highlight
- **拖拽排序**：笔记项可拖拽调整顺序
- 数据策略：已登录存数据库，未登录存 localStorage

### 设置区

- 导航页使用说明
- 登录 / 注册入口（`auth-modal.tsx`）

### 认证弹窗

- 登录 / 注册表单切换
- 登录后数据自动同步到数据库
- 认证逻辑由 `src/hooks/use-auth.ts` 管理

---

## 数据策略

| 数据 | 已登录 | 未登录 |
|------|--------|--------|
| 书签 | 数据库 + API | localStorage |
| 搜索记录 | — | localStorage |
| 备忘录 | 数据库 + API | localStorage |
| 笔记 | 数据库 + API | localStorage |
| AI 对话 | 数据库 + API | localStorage |

数据层抽离为独立模块（`src/lib/nav-storage.ts`），登录状态切换时自动切换数据源，上层代码不变。

### 双端数据层

- `src/lib/nav-storage.ts` — 统一数据层入口，登录走 API，未登录走 localStorage
- `src/lib/nav-db.ts` — 数据库层，操作 `zhijian_nav_bookmarks/todos/notes/chat` 表
- 每用户一条 JSON 记录，整体读写（非逐条 CRUD）
- AI 对话历史走独立接口 `/api/nav/chat`（不纳入 `/api/nav/data` 聚合，避免首屏加载过重）

---

## API 端点

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| `GET` | `/api/nav/data` | 获取导航数据（书签+备忘录+笔记） | 用户鉴权 |
| `PUT` | `/api/nav/data` | 更新导航数据 | 用户鉴权 |
| `POST` | `/api/nav/sync` | 同步导航数据（合并本地到远端） | 用户鉴权 |
| `GET` | `/api/nav/bookmarks` | 获取书签 | 用户鉴权 |
| `PUT` | `/api/nav/bookmarks` | 更新书签 | 用户鉴权 |
| `GET` | `/api/nav/todos` | 获取备忘录 | 用户鉴权 |
| `PUT` | `/api/nav/todos` | 更新备忘录 | 用户鉴权 |
| `GET` | `/api/nav/notes` | 获取笔记 | 用户鉴权 |
| `PUT` | `/api/nav/notes` | 更新笔记 | 用户鉴权 |
| `GET` | `/api/nav/chat` | 获取 AI 对话历史 | 用户鉴权 |
| `PUT` | `/api/nav/chat` | 更新 AI 对话历史 | 用户鉴权 |
| `POST` | `/api/ai/chat` | AI 对话（DeepSeek，SSE 流式） | 用户鉴权 |
| `GET` | `/api/ai/models` | 获取可用 AI 模型列表 | 用户鉴权 |
| `GET` | `/api/favicon?url=xxx` | 代理获取网站 favicon | 无 |

---

## 文件结构

```
src/app/nav/
  page.tsx                            # 导航页入口
  _components/
    nav-shell.tsx + .module.css       # 全屏分页容器（scroll-snap + Alt 键盘跳转）
    search-section.tsx + .module.css  # 第一屏：搜索栏 + 书签
    search-bar.tsx + .module.css      # 搜索栏 + 搜索引擎切换 + AI 按钮
    ai-section.tsx + .module.css      # 第二屏：AI 对话（多会话 + 流式）
    bookmark-bar.tsx + .module.css    # 书签栏
    bookmark-link.tsx + .module.css   # 单个书签链接
    bookmark-context-menu.tsx + .module.css  # 书签右键菜单
    favicon-img.tsx + .module.css     # Favicon 图片
    todo-section.tsx + .module.css    # 第三屏：备忘录
    note-section.tsx + .module.css    # 第四屏：笔记
    settings-section.tsx + .module.css # 设置区
    auth-modal.tsx + .module.css      # 认证弹窗（登录/注册）
    drag-utils.ts                     # 拖拽排序工具
    common-dialog-form.module.css     # 通用弹窗表单样式
src/app/api/
  favicon/route.ts                    # Favicon 代理 API
  ai/chat/route.ts                    # AI 对话（DeepSeek 流式转发）
  ai/models/route.ts                  # AI 可用模型列表
  nav/
    data/route.ts                     # 导航数据查询/更新
    sync/route.ts                     # 导航数据同步
    bookmarks/route.ts                # 书签 CRUD
    todos/route.ts                    # 备忘录 CRUD
    notes/route.ts                    # 笔记 CRUD
    chat/route.ts                     # AI 对话历史 CRUD
src/lib/
  nav-config.ts                       # 书签配置、搜索引擎列表
  nav-db.ts                           # 导航页数据库层
  nav-storage.ts                      # 导航页存储层（API + localStorage 双端）
src/hooks/
  use-auth.ts                         # 导航页认证 Hook
```

---

## 技术方案

- 全屏分页：CSS `scroll-snap-type: y mandatory`，每屏 `height: 100vh; scroll-snap-align: start`
- 屏幕跳转：`scrollIntoView({ behavior: 'smooth' })` + `Alt+1/2/3/4` 键盘快捷键
- 搜索引擎跳转：`window.open(url + encodeURIComponent(query))`，回车触发
- AI 对话：`fetch('/api/ai/chat')` 读 `ReadableStream`，逐 chunk 解析 SSE `data:` 行实时渲染
- Favicon 获取：`/api/favicon?url=xxx` 代理（避免跨域），或本地默认图标
- 拖拽排序：原生 HTML5 Drag & Drop（`drag-utils.ts`），无额外依赖
- 笔记/AI 回复渲染：复用 react-markdown + rehype-highlight（项目已安装）
- 无额外 npm 依赖

## 主题

复用 `theme.css` 文人书斋变量，导航页风格与主站一致。圆角走 nav 专属 `--nav-radius` 体系（主 8px / 小 4px / 弹窗 12px），博客与后台仍零圆角。

## 路由

- `/nav` — 导航页入口，使用 `PublicChrome` 包裹
- 顶部导航栏已移除「导航」入口，需直接访问 `/nav` URL

---

## 涉及的数据库表

| 表 | 用途 |
|----|------|
| `zhijian_nav_bookmarks` | 书签数据（每用户一条 JSON） |
| `zhijian_nav_todos` | 备忘录数据（每用户一条 JSON） |
| `zhijian_nav_notes` | 笔记数据（每用户一条 JSON） |

三张表结构相同：`id` / `user_id`（FK → zhijian_users）/ `data`（JSON）/ `created_at` / `updated_at`，通过 `UNIQUE KEY` 约束每用户一条记录。
