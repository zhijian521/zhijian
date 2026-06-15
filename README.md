<div align="center">

<img src="public/images/main.png" alt="知简" width="100%" />

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
- 系统设置，登录鉴权

**观澜 · 站点分析**
- PV / UV / 会话 / 跳出率 / 平均停留等核心指标
- 访问记录明细（浏览器、OS、IP 地理位置等）
- 趋势图、维度分布图（Recharts）
- 嵌入式采集脚本，一行代码接入

## 技术栈

| | |
|---|---|
| 框架 | Next.js 15 (App Router) |
| 前端 | React 19 · TypeScript 5.8 |
| 样式 | CSS Modules + CSS 变量 |
| 数据库 | MySQL |
| 图表 | Recharts |
| GeoIP | ip2region |
| 部署 | Node.js + Nginx |

## 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # 后台管理
│   │   ├── _components/    # 后台组件（布局壳、侧边栏、各管理页）
│   │   ├── posts/[id]/     # 文章编辑器（全屏独立页面）
│   │   └── analytics/      # 站点分析
│   ├── api/                # API 路由
│   ├── blog/               # 博客前台
│   └── page.tsx            # 首页
├── components/
│   ├── site/               # 前台组件（文章卡片、内容图片等）
│   └── ui/                 # 通用 UI 组件（表格、分页、弹窗等）
├── lib/                    # 数据层、工具函数、站点配置
sql/
└── init.sql                # 数据库建表脚本
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
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=mysql://user:password@host:3306/dbname
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=a-long-random-string
```

## 数据库

在 MySQL 中执行 `sql/init.sql` 即可建表，然后运行种子脚本创建管理员账号：

```bash
npm run db:seed
```

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run db:seed` | 创建管理员账号 |

## License

MIT
