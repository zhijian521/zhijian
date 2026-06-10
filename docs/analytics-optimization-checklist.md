# 站点监控功能优化清单

> 生成日期：2026-06-10
> 基于当前观澜功能代码审阅 + 扩展路线图，整理的可实施优化项
> 更新日期：2026-06-10，新增代码审查问题

---

## 🔴 已有数据未充分利用（低成本高回报）

| # | 功能 | 改动量 | 说明 |
|---|------|--------|------|
| 1 | 热门页面加跳出率 + 平均停留 | 低 | `getPageRank` SQL 已有 bounce/avg_duration，只需返回 + 前端加两列 |
| 2 | 访问记录加页面标题 | 低 | `getVisits` 返回 `title`，前端显示标题而非裸路径 |
| 3 | 访问记录加新访客标记 | 低 | `getVisits` 返回 `isNew`，前端用 Tag 显示「新」 |
| 4 | 新访客 vs 回访者比例 | 低 | 概览卡片加一个，数据已有（`is_new`） |
| 5 | 语言分布 | 低 | 复用设备分布 UI，从 events 表查 `lang` 字段 |

## 🟡 IP + 地理位置分析（新功能）

| # | 功能 | 改动量 | 说明 |
|---|------|--------|------|
| 6 | 安装 geoip-lite + 新建 `src/lib/geo.ts` | — | 离线 GeoIP 库，国家代码/省份代码 → 中文名映射，IP 遮蔽 |
| 7 | events 表加 `ip`/`country`/`region`/`city` 列 | 低 | ALTER TABLE + 索引 |
| 8 | collect API 提取 IP + 解析地理位置 + 写入 | 中 | 从 `x-forwarded-for` 取 IP → `lookup()` → INSERT 多 4 列 |
| 9 | 国家分布排行 | 低 | `getCountries()` 函数，复用设备分布 UI |
| 10 | 省份/城市 TOP 10 排行 | 低 | `getRegions()` 函数，复用设备分布 UI |
| 11 | 访问记录加 IP + 位置列 | 低 | `getVisits` 返回 `ip` + `location`，前端加列 |

## 🟠 浏览器 + 操作系统识别（新功能）

| # | 功能 | 改动量 | 说明 |
|---|------|--------|------|
| 12 | script.js 采集 `userAgent` 字符串 | 低 | 已有 `screen`/`lang` 采集，加一个 `navigator.userAgent` 上报 |
| 13 | events 表加 `ua` 列 | 低 | VARCHAR(500) 存储 UA 原始字符串 |
| 14 | 服务端 UA 解析 → 浏览器 + OS | 中 | 用轻量库（如 `ua-parser-js`）或手写正则提取浏览器名/版本/操作系统 |
| 15 | 浏览器分布排行 | 低 | `getBrowsers()` 函数，复用设备分布 UI |
| 16 | 操作系统分布排行 | 低 | `getOS()` 函数，复用设备分布 UI |
| 17 | 设备分布升级：联合浏览器+OS | 低 | 当前只按屏幕宽度分 Mobile/Tablet/Desktop，加 UA 后可区分 iPad vs iPhone 等 |

## 🟢 来源智能归类（体验优化）

| # | 功能 | 改动量 | 说明 |
|---|------|--------|------|
| 18 | 来源智能归类 | 中 | `google.com` → Google 搜索，`weixin.qq.com` → 微信，`chatgpt.com` → AI 来源 等 |

## 🔵 入口/出口页面分析

| # | 功能 | 改动量 | 说明 |
|---|------|--------|------|
| 19 | 入口页面排行 | 中 | 分析 `is_session = 1` 的 pageview 事件 |
| 20 | 出口页面排行 | 中 | 分析 `type = 'leave'` 事件的 path |

---

## 🐛 代码审查 — 逻辑 Bug & 设计问题

### 🔴 P0 — 数据不准（核心指标不可信）

| # | 问题 | 位置 | 说明 | 修复方向 |
|---|------|------|------|----------|
| B1 | 跳出率接近 100%（假数据） | `analytics.ts:75` | 聚合 SQL 从 pageview 事件读 `duration`，但 pageview 没有该字段，`COALESCE(duration,0)` 恒为 0 → 0 < 10 → 所有会话首页都被计为跳出 | 改用 session 维度：该 session 只有一个 pageview 且有 leave 事件（duration < 10），才是跳出 |
| B2 | 平均停留始终为 0 | `analytics.ts:76` | 同 B1，`AVG(CASE WHEN duration > 0 ...)` 对 pageview 事件永远为 NULL → 结果为 0 | 聚合时需要关联 leave 事件的 duration，或在 daily 聚合中单独统计 leave 事件的平均 duration |
| B3 | avgDuration 是简单平均而非加权平均 | `analytics.ts:154` | `ROUND(AVG(avg_duration))` 对各天 avg_duration 取简单平均，不按 PV 加权。1 个 PV 停留 300s + 1000 个 PV 停留 10s → 简单平均 155s，加权平均 ~10s | 改为 `SUM(pv * avg_duration) / SUM(pv)` 或从 leave 事件重新计算 |

### 🟡 P1 — 功能异常

| # | 问题 | 位置 | 说明 | 修复方向 |
|---|------|------|------|----------|
| B4 | CORS `*` + credentials 冲突 | `collect/route.ts:79` | 请求无 origin 头时，`Allow-Origin: *` + `Allow-Credentials: true` 违反 CORS 规范，浏览器会拒绝 | 无 origin 时不设 credentials 头，或默认设为具体 origin 而非 `*` |
| B5 | 趋势图日期断档 | `analytics.ts:192-202` | daily 表中某天无数据时该日期缺失，折线图直接跳过，导致时间轴不连续 | 查询后在 JS 层补全缺失日期（pv=0, uv=0），保证连续 |
| B6 | 第三方 cookie 失效致 UV 不可靠 | `script.js:58` | `SameSite=Lax` cookie 在跨站嵌入场景下无法写入，第三方网站每次访问都被识别为新访客 | 改用 localStorage 替代 cookie（同域下仍可用 cookie 降级），或接受此限制并在文档中说明 |

### 🟡 P2 — 体验/性能问题

| # | 问题 | 位置 | 说明 | 修复方向 |
|---|------|------|------|----------|
| B7 | 访问记录 duration 全是 null | `analytics.ts:326-339` | `getVisits` 只查 pageview 事件，pageview 没有 duration，表格「停留时长」列几乎全是 `-` | 关联 leave 事件：同一 visitor_id + session_id 的 leave 事件提供 duration；或接受当前设计，表格中标注「离开时统计」 |
| B8 | `DATE(created_at)` 破坏索引 | `analytics.ts:247,279` 等 | `WHERE DATE(created_at) >= ?` 对列做函数运算无法利用索引，数据量大时查询变慢 | 改为 `WHERE created_at >= ?`，参数传 `2026-06-03 00:00:00` 格式 |
| B9 | 来源 TOP 8 百分比加总 = 100% | `analytics.ts:253` | total 只算 TOP 8 的 count，不是全站总量，用户会以为没有其他来源 | 先查全站总量再算百分比，或在截断处显示「其他 N%」 |
| B10 | 设备用屏幕宽度判断不准确 | `analytics.ts:273-275` | iPad 横屏 1024 判为 Tablet（边界值），iPad 竖屏 768 判为 Mobile；无 screen 数据的默认为 Desktop | 加 UA 解析后联合判断（#17），短期内可调整阈值为 768/1200 |

### 🟢 P3 — 小问题

| # | 问题 | 位置 | 说明 | 修复方向 |
|---|------|------|------|----------|
| B11 | enterTime 在 pageshow 后未重置 | `script.js:237-241` | bfcache 恢复触发 `trackPageview` 重置了 `leftPage`，但 `enterTime` 还是旧值，下一次 leave 的 duration 不准 | `trackPageview` 中重置 `enterTime = Date.now()`（当前已有此行，但需确认 pageshow 路径也走到这里） |
| B12 | 0 秒停留显示为 `0s` | `analytics-dashboard.tsx:88-95` | `formatDuration(0)` 返回 `0s`，但 0 秒实际表示「无数据」 | 当 avgDuration 为 0 时显示 `-` 而非 `0s` |

---

## 建议实施顺序

```
B1~B3（修复核心指标） → B4~B6（修复功能异常） → 1 → 2 → 3 → 6~11（IP+地理位置） → 12~17（浏览器+OS） → B7~B10（体验优化） → 4 → 5 → 18 → 19/20 → B11~B12
```

## 涉及的关键文件

| 文件 | 相关项 |
|------|--------|
| `public/script.js` | B6, B11, #12 |
| `sql/init.sql` | #7, #13 |
| `src/lib/geo.ts` | #6（新建） |
| `src/lib/analytics.ts` | B1~B3, B5, B7~B10, #1, #9, #10, #15, #16, #19, #20 |
| `src/app/api/collect/route.ts` | B4, #8, #12, #13 |
| `src/app/api/admin/analytics/overview/route.ts` | #9, #10, #15, #16 |
| `src/app/admin/analytics/_components/analytics-dashboard.tsx` | B12, #1, #4, #5, #9, #10, #15, #16 |
| `src/app/admin/analytics/_components/analytics-dashboard.module.css` | 新维度样式 |
