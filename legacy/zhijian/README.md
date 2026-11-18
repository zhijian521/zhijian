<div align="center">

<img src="public/images/og-default.webp" alt="知简" width="100%" />

简静造物，以代码与文字记录所思所学。

[在线访问](https://zhijian.yuwb.cn) · [问题反馈](https://github.com/zhijian521/zhijian/issues)

</div>

---

知简是我个人的博客站点，同时也是一套完整的全栈内容管理系统——博客前台、后台管理、站点分析，都在这一个项目里。

没有用任何 UI 框架，所有组件和样式都是手写的。视觉上走的是「文人书斋」路线：朱砂红、宣纸米白、衬线标题、零圆角，整站风格统一。

## 功能

**博客前台**

- 首页 / 文章列表 / 文章详情，服务端渲染，SEO 友好
- Markdown 写作，支持代码高亮、GFM 扩展语法
- RSS 订阅、Open Graph / JSON-LD 结构化数据

**后台管理**

- 文章 CRUD，独立全屏编辑器（Markdown 实时预览 + 元数据面板）
- 分类 / 标签 / 图片 / 用户管理
- 系统设置，登录鉴权（bcrypt + 签名 Cookie）
- SEO 主动推送：IndexNow、百度站长平台 URL 提交，发文即推送

**导航页**

- 搜索引擎切换、书签与文件夹管理
- 备忘录、Markdown 笔记和 DeepSeek 流式 AI 对话
- 游客使用本地存储，登录用户同步到 MySQL

**观澜 · 站点分析**

- PV / UV / 会话 / 跳出率 / 平均停留 / 新访客占比等核心指标
- 访问记录明细（浏览器、OS、IP 地理位置等）
- 趋势图、维度分布图（来源、设备、语言、地域、浏览器、OS）
- 多站点管理：注册站点、生成接入代码、一键清空站点数据
- 嵌入式采集脚本，一行代码接入；事件经日聚合后归档

## 技术栈

|          |                                                |
| -------- | ---------------------------------------------- |
| 框架     | Next.js 15 (App Router)                        |
| 前端     | React 19 · TypeScript 5.8                      |
| 样式     | CSS Modules + CSS 变量                         |
| 数据库   | MySQL（mysql2 连接池）                         |
| 图表     | Recharts                                       |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| GeoIP    | ip2region                                      |
| 鉴权     | bcryptjs + 签名 Cookie                         |
| 部署     | Node.js + Nginx                                |

## 项目文档

| 文档                                                      | 内容                                          |
| --------------------------------------------------------- | --------------------------------------------- |
| [项目文档导航](./docs/00-文档导航.md)                     | 全部产品、技术和开发规范入口                  |
| [需求文档](./docs/01-产品文档/01-需求文档.md)             | 当前产品目标、角色、功能边界和验收要求        |
| [功能文档](./docs/01-产品文档/02-功能文档.md)             | 当前页面入口、权限和用户可见能力              |
| [架构设计文档](./docs/02-技术文档/01-架构设计文档.md)     | 当前分层、数据模型和主要数据流                |
| [接口文档](./docs/02-技术文档/03-接口文档/00-接口导航.md) | 当前 33 个 API Route 的方法、鉴权、参数和响应 |
| [开发规范导航](./docs/03-开发规范/00-规范导航.md)         | 目录、代码、样式、接口、数据、组件和文档规则  |

功能新增、行为优化或架构调整必须在同一次提交中更新受影响的 Markdown。当前基线文档只记录已落地内容，未实施规划单独放入方案文档。

## 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # 后台管理
│   │   ├── posts/[id]/     # 文章编辑器（全屏独立页面）
│   │   ├── analytics/      # 站点分析（数据概览 + 站点管理）
│   │   ├── showcase/       # UI 组件与图标预览
│   │   ├── settings/       # 系统设置（SEO 推送等）
│   │   └── ...             # 分类标签、图片、用户管理
│   ├── api/                # API 路由
│   │   ├── admin/          # 后台接口（analytics/posts/seo/tags/...）
│   │   ├── collect/        # 采集脚本上报入口
│   │   ├── auth/           # 登录鉴权
│   │   ├── posts/          # 博客内容接口
│   │   └── nav/            # 导航配置
│   ├── blog/               # 博客前台
│   ├── nav/                # 导航页
│   └── page.tsx            # 首页
├── components/
│   ├── ui/                 # 通用原子组件
│   ├── site/               # 前台共享展示组件
│   └── modules/            # 首页、博客和后台业务组件
├── lib/
│   ├── core/               # 数据库、鉴权、响应和基础工具
│   └── domain/             # 文章、导航、统计等业务数据层
├── hooks/                  # 认证和通用 CRUD 列表 Hook
├── showcase/               # 组件展示 Registry
└── middleware.ts           # 注入当前路径请求头
docs/                       # 产品、技术和开发规范 Markdown
sql/
└── init.sql                # 数据库建表脚本
public/
└── script.js               # 站点分析采集脚本（被监控站点嵌入）
```

## 本地运行

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

前台 http://localhost:3000 · 后台 http://localhost:3000/admin

## 环境变量

```env
# 站点地址（OG 标签、sitemap、绝对 URL 生成）
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 采集脚本分发地址（被监控站点从哪个域名加载 script.js）
# 不配置时回退到 NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SCRIPT_URL=http://localhost:3000

# MySQL 连接串
DATABASE_URL=mysql://user:password@host:3306/dbname

# 后台管理员账号与登录态签名密钥
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=a-long-random-string

# SEO 主动推送（可选，留空则跳过）
INDEXNOW_API_KEY=              # IndexNow Key，验证文件需放 public/{key}.txt
BAIDU_SUBMISSION_TOKEN=        # 百度站长平台 URL 提交 Token
BAIDU_SITE=                    # 百度验证的站点域名，如 https://www.yuwb.dev
```

完整字段见 `.env.example`。

## 数据库

在 MySQL 中执行 `sql/init.sql` 即可建表，然后运行种子脚本创建管理员账号：

```bash
npm run db:seed
```

## 站点分析接入

在后台「数据概览 → 站点管理」注册站点后，复制接入代码嵌入到被监控页面的 `<head>`：

```html
<script async src="https://your-domain/script.js" data-site-id="xxxxx"></script>
```

## 可用脚本

| 命令                   | 说明                                        |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | 开发服务器                                  |
| `npm run build`        | 生产构建                                    |
| `npm run start`        | 启动生产服务                                |
| `npm run lint`         | ESLint 检查                                 |
| `npm run typecheck`    | TypeScript 类型检查                         |
| `npm run docs:check`   | 文档链接与 API 登记检查                     |
| `npm run check`        | 统一完成标准：lint + typecheck + docs:check |
| `npm run format`       | Prettier 格式化                             |
| `npm run format:check` | Prettier 格式检查                           |
| `npm run db:seed`      | 创建管理员账号                              |

## License

MIT
