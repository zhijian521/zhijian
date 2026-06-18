# 网站统计（观澜）

知简后台的网站统计模块由两个页面组成：统计概览页、站点管理页。统计概览页是纯 Client Component，通过 API 获取数据，所有图表和表格在前端渲染；站点管理页同样是 Client Component，负责站点的 CRUD 操作和接入代码分发。

数据采集由 `public/script.js` 嵌入脚本完成，通过 `POST /api/collect` 上报事件，后端写入 `zhijian_track_events` 表，再由日聚合逻辑将原始事件汇总到 `zhijian_track_daily` 表供仪表盘查询。

---

## 目录

- [数据采集脚本](#数据采集脚本)
- [数据收集 API](#数据收集-api)
- [日聚合机制](#日聚合机制)
- [统计概览页](#统计概览页)
- [站点管理页](#站点管理页)
- [数据层](#数据层)
- [辅助模块](#辅助模块)
- [样式体系](#样式体系)

---

## 数据采集脚本

**文件**：`public/script.js`

嵌入目标网站 `<head>` 的轻量追踪脚本，采集页面浏览、停留时长、SPA 路由变化等数据。

### 接入方式

```html
<script async src="https://yuwb.cn/script.js" data-site-id="YOUR_SITE_ID"></script>
```

可选属性：
- `data-collect-url`：自定义上报地址（默认从 `src` 推推断 `/api/collect`）

### 采集数据

| 事件类型 | 触发时机 | 附加字段 |
|----------|----------|----------|
| `pageview` | 页面加载 / SPA 路由变化 / bfcache 恢复 | url、referrer、title、screen、lang、ua、isNew、isSessionStart |
| `leave` | 页面隐藏（`visibilitychange`） | duration（从 pageview 到 leave 的秒数） |

### 追踪逻辑

| 项目 | 说明 |
|------|------|
| Visitor ID | localStorage `_zj_vid`，不可用时降级 cookie（同 key），有效期 365 天 |
| Session ID | sessionStorage `_zj_sid`，标签页级生命周期 |
| 新访客判断 | localStorage `_zj_vid` 是否存在（页面生命周期内缓存结果） |
| 会话开始判断 | sessionStorage `_zj_ss` 是否存在 |
| SPA 路由 | Monkey-patch `pushState` / `replaceState` + `popstate` 监听 |
| 防抖 | 同 URL + title 500ms 内不重复触发 pageview |
| 停留时长下限 | 停留 < 1 秒不上报 leave 事件（`MIN_DURATION = 1`） |
| 切标签页恢复 | `visibilitychange` 切回时重置 `enterTime`，避免 leave duration 累积旧停留 |
| 上报策略 | `sendBeacon(text/plain)` 优先，`fetch keepalive` 降级 |
| 批量上报 | 5 秒定时 + leave 时立即 flush |

### 嵌入代码生成

```typescript
getEmbedScript(siteId)  // → `<script async src="${base}/script.js" data-site-id="${siteId}"></script>`
```

站点管理页创建站点后自动弹出接入代码对话框；仪表盘页和站点列表页均有「复制接入代码」按钮。

---

## 数据收集 API

**文件**：`src/app/api/collect/route.ts`  
**路由**：`POST /api/collect`  
**鉴权**：无（公开端点，供嵌入脚本调用）

### 处理流程

```
请求到达
  │
  ▼
读取请求体（兼容 text/plain 和 application/json）
  │
  ▼
基础校验 — siteId / events 数组 / 单次上限 20 条
  │
  ▼
令牌桶限流 — 每个 siteId 每秒最多 10 次
  │
  ▼
站点校验 — zhijian_track_sites 中 id 存在且 status = 'active'
  │
  ▼
IP + Geo 解析 — x-forwarded-for / x-real-ip → maskIp() + lookup()
  │
  ▼
批次内去重 — type + path + visitorId + sessionId + 60秒窗口
  │
  ▼
UA 解析 — parseUA() 提取 browser / os
  │
  ▼
批量 INSERT — zhijian_track_events 表
  │
  ▼
202 已接受（无响应体）
```

### CORS 处理

- 动态返回请求 `origin`，兼容 sendBeacon 和 fetch
- 有 origin 时附加 `Access-Control-Allow-Credentials: true`
- OPTIONS 预检返回 204，Max-Age 86400

### 安全措施

| 项目 | 说明 |
|------|------|
| 令牌桶限流 | 每个 siteId 10 req/s，惰性清理 60s 无活动桶 |
| 字段白名单 | type 只允许 pageview / heartbeat / leave |
| 长度截断 | path ≤ 500, referrer ≤ 500, title ≤ 500, ua ≤ 500 等 |
| IP 遮蔽 | `maskIp()` 最后一段替换为 `xxx`，存储遮蔽后 IP |
| 去重 | 60s 窗口内相同 type+path+visitor+session 视为重复 |
| duration 上限 | `Math.min(duration, 86400)` 防止异常值 |

---

## 日聚合机制

**文件**：`src/lib/analytics.ts`（`aggregateDaily` / `ensureAggregated`）

原始事件存入 `zhijian_track_events` 后，日聚合逻辑将数据汇总到 `zhijian_track_daily` 表，供仪表盘查询使用。

### 聚合行类型

| row_type | 说明 | 存储内容 |
|----------|------|----------|
| `summary` | 整站汇总 | pv / uv / sessions / new_visitors / bounce / avg_duration |
| `page` | 按页面路径 | path / pv / uv / sessions / bounce / avg_duration |
| `dim` | 维度分布 | dim_name + dim_value / pv |

### 维度列表

| dim_name | 说明 | SQL 表达式 |
|----------|------|-----------|
| `source` | 来源域名 | SUBSTRING_INDEX 从 referrer 提取，空值跳过（归入直接访问） |
| `device` | 设备类型 | screen 宽度 ≤ 768 → Mobile, ≤ 1200 → Tablet, 其余 → Desktop |
| `browser` | 浏览器 | COALESCE(browser, '未知') |
| `os` | 操作系统 | COALESCE(os, '未知') |
| `lang` | 语言 | COALESCE(lang, '未知') |
| `country` | 国家 | COALESCE(country, '未知') |
| `region` | 省份 | COALESCE(region, '未知') |

### 懒聚合（`ensureAggregated`）

仪表盘查询前自动触发：

1. 查询 `daily` 表中已有 `summary` 行的日期
2. 收集缺失日期（范围 N 天 ~ 今天）
3. 分批并行补算，每批 7 天（避免连接池过载，上限 3 连接）
4. 补算完成后，安全清理 90 天前的原始 events（分批 LIMIT 5000 删除，UTC 范围匹配）

### UTC 时区处理

`events` 表的 `created_at` 由 MySQL `CURRENT_TIMESTAMP` 写入（UTC），本地日期需转换为 UTC 范围匹配：

```
本地日期 "2026-06-14"（UTC+8） → UTC 范围 2026-06-13T16:00:00 ~ 2026-06-14T16:00:00
```

| 工具函数 | 用途 |
|----------|------|
| `localDateToUtcRange(date)` | 单天本地日期 → UTC 范围，`aggregateDaily` 使用 |
| `rangeToUtcRange(range)` | 日期范围（7d/30d/90d）→ UTC 范围，`getOverview` / `getVisits` / `getDistribution` 使用 |

所有查询 events 表的函数统一使用 UTC 范围匹配（`created_at >= ? AND created_at < ?`），与 `aggregateDaily` 的口径一致。`ensureAggregated` 清理旧数据时也使用 `localDateToUtcRange(cutoffDate).start` 确保 UTC 对齐。

---

## 统计概览页

**文件**：`src/app/admin/analytics/page.tsx`（路由页）  
**展示组件**：`src/app/admin/analytics/_components/analytics-dashboard.tsx`  
**路由**：`/admin/analytics`  
**组件类型**：Server Component（page）+ Client Component（dashboard）

### 控制栏

```
控制栏
  ├── 左侧：站点下拉选择 + 「复制接入代码」按钮
  └── 右侧：时间范围切换（7天 / 30天 / 90天）+ 标签页切换（统计概览 / 访问记录）
```

### 统计概览 Tab 页面布局

```
<main>
  ├── 概览指标行 — 五列一行
  │    ├── 浏览量（PV）+ 环比变化
  │    ├── 访客数（UV）+ 环比变化
  │    ├── 跳出率
  │    ├── 平均停留时长
  │    └── 新访客占比
  │
  ├── 流量趋势 — 全宽面积图
  │    └── PV（实线朱砂红）+ UV（虚线灰）
  │
  ├── 热门页面 + 来源排行 — 一行各半
  │    ├── 热门页面 TOP 10 — 排行列表 + 进度条 + 跳出率/停留
  │    └── 来源排行 — 智能归类后的来源列表 + 百分比
  │
  ├── 设备/浏览器/OS — 一行三个环形图
  │    ├── 设备分布 — DonutChart（朱砂红色板）
  │    ├── 浏览器分布 — DonutChart（绿色板）
  │    └── 操作系统分布 — DonutChart（棕色板）
  │
  ├── 地理与语言分布 — 全宽三栏
  │    ├── 国家/地区 — 标签云
  │    ├── 省份/城市 — 圆点列表（仅中国访客）
  │    └── 语言 — 圆点列表
  │
  └── 入口/出口页面 — 一行各半，DataTable
       ├── 入口页面 TOP 10
       └── 出口页面 TOP 10
</main>
```

### 访问记录 Tab 页面布局

```
<main>
  ├── DataTable — 访问记录列表
  │    ├── 页面（路径 + 标题）
  │    ├── 来源（域名）
  │    ├── 设备（Tag 标签）
  │    ├── 访客（ID 前 8 位 + 新访客标记）
  │    ├── 位置（国家·省份·城市）
  │    ├── 停留时长
  │    └── 时间
  └
  └── Pagination — 分页（每页 20 条）
</main>
```

### 数据流

```
页面加载
  │
  ▼
fetchSites() — GET /admin/analytics/sites → 站点列表
  │
  ▼
fetchData() — GET /admin/analytics/overview?siteId=xxx&range=7d
  │                             → API 内部：ensureAggregated → Promise.all(12 个查询)
  │                             → 返回 overview / trend / pages / sources / devices / ...
  │
  ▼
切换到访问记录 Tab
  │
  ▼
fetchVisits() — GET /admin/analytics/visits?siteId=xxx&range=7d&page=1&pageSize=20
```

### 空状态与错误处理

| 状态 | UI |
|------|-----|
| 无站点 | 提示创建站点 + 「前往站点管理」按钮 |
| 加载中 | 「加载中...」 |
| 请求失败 | 错误横幅 + 「重试」按钮 |
| 无数据 | 各图表区域显示「暂无数据」 |

### 环比变化计算

概览指标的 PV/UV 变化百分比与上一周期对比：

```
当前周期：[today - N days, today]
上一周期：[today - 2N days, today - N days]
变化 = ((当前 - 上期) / 上期) × 100%，保留 1 位小数
```

---

## 站点管理页

**文件**：`src/app/admin/analytics/sites/page.tsx`（路由页）  
**展示组件**：`src/app/admin/analytics/sites/_components/site-management.tsx`  
**路由**：`/admin/analytics/sites`  
**组件类型**：Server Component（page）+ Client Component（site-management）

### 功能

| 操作 | 说明 |
|------|------|
| 新增站点 | Dialog 表单（站点名称 + 域名），创建后弹出接入代码 Dialog |
| 编辑站点 | Dialog 表单，修改名称 / 域名 |
| 启用/暂停 | 切换站点状态（active ↔ paused） |
| 删除站点 | 软删除（status → 'deleted'），ConfirmDialog 二次确认 |
| 复制接入代码 | 从站点 ID 列或弹窗复制 `getEmbedScript(siteId)` |

### 站点数据结构

```typescript
interface TrackSite {
    id: string;        // 8 位随机 ID（小写字母+数字）
    name: string;      // 站点名称
    domain: string;    // 站点域名
    status: 'active' | 'paused' | 'deleted';
    created_at: string;
    updated_at: string;
}
```

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/admin/analytics/sites` | 站点列表（排除 deleted） |
| `POST` | `/admin/analytics/sites` | 创建站点（自动生成 ID） |
| `PUT` | `/admin/analytics/sites` | 更新站点（名称/域名/状态） |
| `DELETE` | `/admin/analytics/sites?id=xxx` | 软删除站点 |

域名重复时返回 409 Conflict。

---

## 数据层

### 概览数据类型

```typescript
interface OverviewData {
    pv: number;           // 总浏览量
    uv: number;           // 总访客数
    bounceRate: number;   // 跳出率百分比（如 32.5）
    avgDuration: number;  // 平均停留秒数（leave 事件 AVG）
    newVisitorRate: number; // 新访客占比百分比
    pvChange: number;     // PV 环比变化百分比
    uvChange: number;     // UV 环比变化百分比
}

type DateRange = '7d' | '30d' | '90d';
```

### 公开查询函数

| 函数 | 数据源 | 说明 |
|------|--------|------|
| `getOverview(siteId, range)` | **events 表** | 概览指标 + 环比变化，UV 用 `COUNT(DISTINCT visitor_id)` 跨天去重，跳出率分母为 sessions |
| `getTrend(siteId, range)` | daily 表 | PV/UV 日趋势，补全缺失日期保证连续 |
| `getPageRank(siteId, range, limit)` | daily 表 | 页面排行 TOP N，含跳出率和加权平均停留 |
| `getSources(siteId, range, limit)` | daily 表 + 智能归类 | 来源排行，域名归类合并后截取 TOP N |
| `getDevices(siteId, range)` | daily 表（dim=device） | 设备分布 |
| `getBrowsers(siteId, range, limit)` | daily 表（dim=browser） | 浏览器分布 |
| `getOS(siteId, range, limit)` | daily 表（dim=os） | 操作系统分布 |
| `getCountries(siteId, range, limit)` | daily 表（dim=country） | 国家分布 |
| `getRegions(siteId, range, limit)` | daily 表（dim=region, country=中国） | 中国省份分布 |
| `getLanguages(siteId, range, limit)` | daily 表（dim=lang） | 语言分布 |
| `getEntryPages(siteId, range, limit)` | events 表（is_session=1） | 入口页面排行 |
| `getExitPages(siteId, range, limit)` | events 表（type='leave'） | 出口页面排行 |
| `getVisits(siteId, range, page, pageSize)` | events 表 | 访问记录分页列表 |

### 通用分布查询

`getDistributionFromDaily()` — 从 daily 表查维度数据：

```typescript
interface DailyDistributionConfig {
    dimName: string;        // 维度名（如 source/device/browser）
    columnAlias: string;    // 返回对象的 key（如 device/language/name）
    regionFilter?: string;  // 省份查询时的国家过滤（如 '中国'）
    limit?: number;
}
```

独立查询整站 PV 总量作为百分比分母，省份查询通过 INNER JOIN country 维度行过滤。

`getDistribution()` — 从 events 表实时查（入口/出口页面使用）：

```typescript
interface DistributionConfig {
    columnExpr: string;
    columnAlias: string;
    extraWhere?: string;       // 额外 WHERE 条件
    overrideWhere?: string;    // 完全覆盖 baseWhere
    overrideTotalWhere?: string;
    overrideParams?: unknown[];
    overrideTotalParams?: unknown[];
    limit?: number;
}
```

### 来源智能归类

`categorizeSource()` 将原始域名归类为中文标签：

| 类别 | 匹配域名 |
|------|----------|
| 直接访问 | 空 referrer |
| Google 搜索 | google.* |
| 百度搜索 | baidu.com / *.baidu.com |
| Bing 搜索 | bing.com / *.bing.com |
| 搜狗搜索 | sogou.com / *.sogou.com |
| 360 搜索 | so.com / *.so.com / 360.cn |
| DuckDuckGo | duckduckgo.com |
| 微信 | weixin.qq.com / mp.weixin |
| 微博 | weibo.com / weibo.cn |
| 抖音/TikTok | douyin.com / tiktok.com |
| 小红书 | xiaohongshu.com / xhslink.com |
| 知乎 | zhihu.com |
| B站 | bilibili.com |
| Twitter/X | twitter.com / x.com |
| Facebook | facebook.com / fb.com |
| LinkedIn | linkedin.com |
| GitHub | github.com |
| ChatGPT | chatgpt.com / chat.openai.com |
| Perplexity | perplexity.ai |
| Claude | claude.ai |

归类后合并同名 count，无外部来源的 PV 归入「直接访问」。

### 概览 API 并行查询

`GET /admin/analytics/overview` 聚合后 `Promise.all` 并行执行 12 个查询，`skipAggregate=true` 避免重复聚合：

```typescript
await ensureAggregated(siteId, range);  // 先聚合
const [overview, trend, pages, ...] = await Promise.all([
    getOverview(siteId, range, true),   // skipAggregate
    getTrend(siteId, range, true),
    getPageRank(siteId, range, 10, true),
    ...
]);
```

### 涉及的数据库表

| 表 | 用途 |
|----|------|
| `zhijian_track_sites` | 站点注册表（id / name / domain / status） |
| `zhijian_track_events` | 原始事件表（pageview / leave，含 visitor / session / IP / geo / UA） |
| `zhijian_track_daily` | 日聚合表（summary / page / dim 三种行类型） |

---

## 辅助模块

### GeoIP 解析

**文件**：`src/lib/geo.ts`

使用 `ip2region` 离线数据库解析 IP 地理位置：

```typescript
interface GeoInfo {
    country: string;   // 中文名，如 '中国'
    region: string;    // 中文名（去「省」「市」后缀），如 '陕西'
    city: string;      // 中文名（去「市」后缀），如 '西安'
}
```

| 函数 | 说明 |
|------|------|
| `lookup(ip)` | 解析 IP → GeoInfo，内网 IP 返回 null |
| `maskIp(ip)` | IP 遮蔽，最后一段替换为 `xxx` |

内网 IP 跳过查询：`127.*` / `10.*` / `172.16-31.*` / `192.168.*` / `0.0.0.*` / `::1` / `fc` / `fd`

### UA 解析

**文件**：`src/lib/ua.ts`

轻量手写正则解析 User-Agent，不引入外部库：

```typescript
interface UAInfo {
    browser: string;  // Chrome / Edge / Firefox / Safari / Opera / 微信 / QQ / UC 等
    os: string;       // Windows / macOS / Android / iOS / Linux / ChromeOS 等
}
```

浏览器检测顺序：Edge → Opera → Vivaldi → Samsung → UC → QQ → 微信 → Firefox → Chrome → Chromium → Safari → IE

### 站点数据层

**文件**：`src/lib/track-sites.ts`

| 函数 | 说明 |
|------|------|
| `generateSiteId()` | 生成 8 位随机 ID（小写字母+数字），查库去重，最多 5 次 |
| `listTrackSites()` | 获取全部站点（排除 deleted），按 created_at DESC |
| `getTrackSiteById(id)` | 按 ID 获取单个站点 |
| `createTrackSite({ name, domain })` | 创建站点（自动生成 ID） |
| `updateTrackSite(id, fields)` | 更新站点（动态 SET，仅更新传入字段） |
| `deleteTrackSite(id)` | 软删除（status → 'deleted'） |

---

## 样式体系

### 布局网格

仪表盘使用三列自适应网格，概览指标行五列一行：

| 区域 | 桌面 | 平板 | 手机 |
|------|------|------|------|
| 主网格 | 3 列 | 2 列 | 1 列 |
| 概览指标 | 5 列 | 3 列 | 2 列 |
| 热门/来源 | 1fr 1fr | 1fr 1fr | 1 列 |
| 设备/浏览器/OS | 各占 1 列 | 各占 1 列 | 全宽 |
| 地理/语言 | 3 列 | 2 列 | 1 列 |

断点：`1024px` / `640px`

### 色板

| 用途 | 色值 |
|------|------|
| 主色（PV 线 + 进度条 + 指标数字） | `var(--primary)` / `#9f000f`（朱砂红） |
| 主色浅（面积图填充） | `#f5e6e8` |
| 辅色（UV 线 + 灰文字） | `#6f655c` |
| 辅色浅（网格线） | `#e7ddd1` |
| 设备环形图 | `#9f000f` / `#c4616d` / `#d9969e` / `#efcdd2` |
| 浏览器环形图 | `#4a6741` / `#6d8f64` / `#96b68e` / `#c2dbc0`（绿色系） |
| OS 环形图 | `#5c4a2a` / `#8b7355` / `#b5a07a` / `#d9cbb0`（棕色系） |

### 图表组件

| 组件 | 说明 |
|------|------|
| `AreaChart`（recharts） | 流量趋势，PV 实线 + UV 虚线，自定义 Tooltip |
| `DonutChart` | 环形图 + 图例列表，内半径 52%、外半径 78% |
| `ChangeIndicator` | 环比变化标签，上涨朱砂红 + 下降灰色 |
| `DataTable` | 访问记录 + 入口/出口页面表格 |
| `Pagination` | 访问记录分页 |

### 关键文件速查

| 文件 | 说明 |
|------|------|
| `public/script.js` | 数据采集嵌入脚本 |
| `src/app/api/collect/route.ts` | 数据收集 API（无鉴权） |
| `src/app/admin/analytics/page.tsx` | 统计概览路由页 |
| `src/app/admin/analytics/_components/analytics-dashboard.tsx` | 统计概览展示组件 |
| `src/app/admin/analytics/_components/analytics-dashboard.module.css` | 统计概览样式 |
| `src/app/admin/analytics/sites/page.tsx` | 站点管理路由页 |
| `src/app/admin/analytics/sites/_components/site-management.tsx` | 站点管理展示组件 |
| `src/app/admin/analytics/sites/_components/site-management.module.css` | 站点管理样式 |
| `src/app/api/admin/analytics/overview/route.ts` | 概览数据 API |
| `src/app/api/admin/analytics/visits/route.ts` | 访问记录 API |
| `src/app/api/admin/analytics/sites/route.ts` | 站点管理 CRUD API |
| `src/lib/analytics.ts` | 日聚合 + 查询函数（数据层） |
| `src/lib/track-sites.ts` | 站点 CRUD 数据层 |
| `src/lib/geo.ts` | GeoIP 解析（ip2region） |
| `src/lib/ua.ts` | UA 解析（手写正则） |
| `src/lib/utils.ts` | `getEmbedScript()` 嵌入代码生成 |
