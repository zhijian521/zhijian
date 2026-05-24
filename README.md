# 知简个人网站

一个基于 `Next.js 15 + React 19 + MySQL` 的个人内容网站项目，当前先实现博客前台与后台管理，后续可以继续扩展备忘录、导航、作品等模块。

## 当前功能

- 博客首页
- 博客列表页
- 文章详情页
- 后台登录
- 后台文章列表
- 新建文章
- 编辑文章
- MySQL 数据读取与回退示例数据

## 当前目录结构

```text
src/
  app/
    admin/
      _components/
      posts/
      settings/
      layout.tsx
      page.tsx
    api/
      admin/
        login/route.ts
        logout/route.ts
        posts/
          [id]/route.ts
          route.ts
      posts/route.ts
    blog/
      [slug]/page.tsx
      page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    site/
      public-chrome.tsx
    ui/
  lib/
    auth.ts
    db.ts
    posts.ts
    site.ts
    utils.ts
  middleware.ts
sql/
  init.sql
```

## 本地开发

```bash
npm install
npm run dev
```

- 前台地址：[http://localhost:3000](http://localhost:3000)
- 后台地址：[http://localhost:3000/admin](http://localhost:3000/admin)

## 可用脚本

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## 环境变量

复制 `.env.example` 为 `.env.local`，至少配置下面这些变量：

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=mysql://username:password@your-host:3306/your_database
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-string
```

## 数据库初始化

项目内维护了一份可直接执行的初始化脚本：

- [sql/init.sql](C:/code/zhijian/sql/init.sql)

在你的 MySQL 数据库中执行这份脚本即可快速建表并插入默认文章数据。后续如果表结构有调整，优先同步更新这份脚本，方便其他人 clone 后直接使用。

## 项目说明

- 前台与后台视觉风格故意分离：前台偏内容表达，后台偏管理效率。
- `src/lib/site.ts` 用来集中管理站点名称、路由与导航配置。
- `src/lib/posts.ts` 负责文章查询、格式化与写入逻辑，是当前博客模块的核心数据层。
