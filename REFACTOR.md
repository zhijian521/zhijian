# 知简 · 重构方案

> 在现有 `zhijian` 项目内逐步重构，不另起新项目。借这次重构做整体 Review。
> 原则：每次只动一个模块，改完跑 `typecheck` + `docs:check` + 手动验证，再动下一个。

## 一、现状与问题

| 维度   | 现状                                                                                                  | 问题                                                        |
| ------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 样式   | `theme.css` 有完整颜色/字体变量，`--radius:0` 全站零圆角                                              | 缺间距/字号阶梯 token；无模块级变量分层；组件内偶有硬编码值 |
| 组件   | `components/ui`(30) + `components/site`(15) + `app/nav/_components`(28) + `app/admin/_components`(38) | 四处散落，无统一注册表，复用靠记忆，无法快速预览            |
| 图标   | `components/ui/icons.tsx` 单文件                                                                      | 无预览页，不知道有哪些图标可用                              |
| 文档   | `docs/features/*.md` 功能文档已有                                                                     | 纯离线，后台看不到；改代码不强制同步文档；**无接口文档**    |
| 接口   | 33 个 API route，统一用 `withAdmin`/`withUser` 鉴权 + `success/fail/BizCode` 响应                     | 无文档，参数/响应/鉴权要靠读代码                            |
| 数据层 | `lib/` 21 文件平铺                                                                                    | 基础设施(db/auth/api-response)与业务(posts/nav)混在一起     |

## 二、目标

1. **样式**：统一配置管理，分层（全局 token + 主题 + 模块覆盖）；组件/图标可预览
2. **结构**：按模块组织（博客/后台/导航），组件分模块封装
3. **文档**：接口文档 + 功能文档，每个大功能有对应文档；改代码同步改文档；后台可查看
4. **其他**：数据层分层、组件去重、消除硬编码

## 三、样式分层

三层，从上到下覆盖。组件内一律 `var(--xxx)`，不写死值。

| 层         | 文件                          | 内容                                                     |
| ---------- | ----------------------------- | -------------------------------------------------------- |
| 全局 token | `src/app/tokens.css`（新建）  | 间距 `--space-*`、字号 `--text-*`、行高、圆角 `--radius` |
| 主题       | `src/app/theme.css`（已存在） | 颜色、字体族                                             |
| 模块覆盖   | 各模块根容器引入              | 仅该模块差异变量，如 `--nav-bg`                          |

**落地**：

- 新建 `tokens.css` 定义阶梯（4px 基准间距、rem 字号）。
- `globals.css` 顶部 `@import './tokens.css'`（在 theme 之前）。
- 模块需要差异变量时，在模块根组件的 CSS Module 里 `:root` 或容器选择器内声明，不建全局 `modules/` 目录——避免空壳文件。
- 后续逐个组件清理硬编码 `padding`/`font-size`，替换为 `var(--space-*)` / `var(--text-*)`。

## 四、组件与图标预览（showcase）

新增路由 `/admin/showcase`（仅后台可访问，复用现有 admin 鉴权）。两个页签：

- **组件预览**：读 `src/showcase/registry.ts`（手写登记），渲染每个组件的 variant 卡片，按模块分组。
- **图标预览**：扫描 `components/ui/icons.tsx` 的命名导出，网格渲染每个图标 + 名称，点击复制 import。

**登记方式**：手写 registry。新组件加一行登记 + 示例 props。不做全自动反射（Next 下 fragile、示例不可控）。

```ts
// src/showcase/registry.ts
export interface ShowcaseEntry {
    name: string;
    description: string;
    module: 'ui' | 'site' | 'nav' | 'blog' | 'admin';
    source: string; // 源码路径，仅展示
    examples: { label: string; Component: ComponentType; props?: Record<string, unknown> }[];
}
export const SHOWCASE_REGISTRY: ShowcaseEntry[] = [/* ... */];
```

## 五、接口文档模块

每个 API route 顶部写标准 JSDoc 注释，一个 registry 聚合，后台渲染。

### 5.1 route 注释规范

每个 `route.ts` 顶部写：

```ts
/**
 * @api 文章列表
 * @group posts
 * @auth none
 * @method GET  返回全部已发布文章
 * @method POST 创建草稿（需 admin）
 * @returns success<Post[]> | fail
 */
```

字段：`@api` 名称、`@group` 分组、`@auth` 鉴权(none/user/admin)、`@method` 各方法说明、`@returns` 响应。

### 5.2 接口索引 registry

`src/docs/api/_registry.ts` 手写登记每个接口的路径 + 元信息（从注释提炼）：

```ts
export interface ApiEntry {
    path: string; // /api/admin/posts
    name: string; // 文章列表
    group: string; // posts / nav / auth / admin / ai / collect
    auth: 'none' | 'user' | 'admin';
    methods: { method: string; desc: string }[];
}
export const API_REGISTRY: ApiEntry[] = [/* ... */];
```

33 个接口分 6 组：`posts`(公开)、`admin/*`(后台，含 posts/categories/tags/uploads/users/analytics/seo)、`nav/*`、`auth/*`、`ai/*`、`collect`(统计采集)。

### 5.3 后台接口文档页

`/admin/docs` 改造为文档中心，含两个 tab：

- **功能文档**：现有 `docs/features/*.md`，用 react-markdown 渲染（已在依赖中）。
- **接口文档**：渲染 `API_REGISTRY`，按 group 分组列表，每条显示路径/鉴权/方法/说明。

## 六、功能文档同步

### 6.1 文档放代码旁

每个大功能的文档放对应模块目录内，或集中在 `src/docs/features/`（保持现状）。文档与代码同目录树，改代码时文档在眼前。

### 6.2 docs:check 校验

新增 `scripts/docs-check.mjs` + `npm run docs:check`，校验：

- `API_REGISTRY` 列的每个接口路径对应 `app/api/**/route.ts` 存在
- `DOC_REGISTRY`（功能文档索引）列的 `.md` 文件存在
- 磁盘上的 `docs/features/*.md` 都已在 registry 登记（防漏登）

提交前必跑（后续接 pre-commit hook）。

### 6.3 后台文档查看入口

`/admin/docs` 统一入口，左侧树形目录（功能文档按模块、接口文档按 group），右侧渲染。

## 七、结构重构（按模块）

组件按业务模块归集，`app/*/_components` 保留页面私有组件，通用组件上移：

```
src/
├── components/
│   ├── ui/              # 基础原子组件（已有，保留）
│   ├── site/            # 前台展示组件（已有，保留）
│   └── modules/         # 新建：按业务模块封装的复合组件
│       ├── blog/
│       ├── nav/         # 从 app/nav/_components 提取通用部分
│       └── admin/       # 从 app/admin/_components 提取通用部分
├── lib/
│   ├── core/            # 新建：基础设施 db/auth/api-response/http-client/utils
│   └── domain/          # 新建：业务 posts/taxonomy/nav/uploads
├── showcase/            # 新建：registry
└── docs/
    ├── features/        # 功能文档（已有）
    └── api/             # 新建：接口 registry
```

**注意**：`lib/core` + `lib/domain` 分层是渐进的——迁文件时改 import 路径，旧 `lib/*.ts` 用 re-export 过渡，避免一次性大改。

## 八、迁移执行顺序

每步结束：`npm run typecheck` + `npm run docs:check` + 手动验证。

| 步  | 内容                                                                               | 改动范围                 |
| --- | ---------------------------------------------------------------------------------- | ------------------------ |
| 1   | 样式分层：建 `tokens.css` + `globals.css` 引入                                     | 新建 1 文件，改 1 行     |
| 2   | 搭 showcase 骨架：`/admin/showcase` + `registry.ts` + 登记现有 ui 组件             | 新建路由 + registry      |
| 3   | 搭后台文档中心：`/admin/docs` 双 tab（功能 + 接口）+ `API_REGISTRY` + `docs:check` | 新建路由 + 脚本          |
| 4   | 补接口文档：33 个 route 顶部加 JSDoc + 登记 registry                               | 33 文件注释 + 1 registry |
| 5   | 补齐功能文档：核对 `docs/features/*.md` 与现状，补缺失                             | 文档                     |
| 6   | 数据层分层：`lib/core` + `lib/domain` + re-export 过渡                             | lib 重组                 |
| 7   | 组件去模块化：`nav`/`admin` 通用组件上移到 `components/modules/`                   | 组件迁移                 |
| 8   | 消除硬编码：组件内 `padding`/`font-size`/颜色换 `var(--*)`                         | 逐文件清理               |

## 九、当前进度

- [x] 步骤 1：样式分层
- [x] 步骤 2：showcase 骨架
- [ ] 步骤 3：后台文档中心 + docs:check
- [ ] 步骤 4：接口文档
- [ ] 步骤 5：功能文档核对
- [ ] 步骤 6：数据层分层
- [ ] 步骤 7：组件去模块化
- [ ] 步骤 8：消除硬编码

## 十、附：决策说明

- **不另起新项目**：在 zhijian 内重构，diff 真实，省一个仓库，省一遍重写。
- **接口文档用注释 + 手写 registry**：自动扫描 route 在 Next 下 fragile（动态路由、条件导出）；注释在代码旁，改接口时顺手改。代价是 33 个文件加注释 + registry 手写，一次性投入，后续维护成本低。
- **showcase 手写 registry**：稳定可控，示例由开发者定。比全自动反射可靠。
- **模块变量不建全局 `modules/` 目录**：模块差异变量直接写在该模块根组件 CSS Module 内，避免空壳文件。
- **lib 分层用 re-export 过渡**：先建 `core`/`domain`，旧路径 re-export，逐个改 import，避免一次性大改炸掉。
