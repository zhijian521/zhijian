# 访问记录列表设计

## 背景

数据概览页目前只展示汇总指标（PV/UV/跳出率等）和趋势图，无法查看单次访问的明细数据。需要新增「访问记录」视图，让运营人员能逐条查看站点的访问行为。

## 方案

在数据概览页使用 Tab 切换「统计概览」|「访问记录」，两个 Tab 共享站点选择和时间范围筛选条件。

选择 Tab 方案而非按钮展开，原因是概览内容本身已经较长（卡片 + 趋势图 + 多个排行），再展开表格会导致页面过长且需频繁滚动；Tab 切换互斥显示更清爽。

## 设计细节

### Tab 区域

- 位于控制栏（站点选择 + 时间范围）下方、内容区上方
- 使用 `PillSelect` 组件渲染，风格与现有筛选器统一
- 选项：`{ value: 'overview', label: '统计概览' }` / `{ value: 'visits', label: '访问记录' }`
- 切换时保留 siteId 和 range 状态

### 统计概览 Tab

现有内容不变。

### 访问记录 Tab

展示 `zhijian_track_events` 原始事件 DataTable：

| 列   | 字段       | 说明                                         |
| ---- | ---------- | -------------------------------------------- |
| 页面 | path       | 访问的 URL 路径                              |
| 来源 | referrer   | 来源域名，空则显示「直接访问」               |
| 设备 | device     | 根据 screen 宽度归类 Desktop/Mobile/Tablet，用 Tag 展示 |
| 访客 | visitor_id | 截取前 8 位显示，标灰                        |
| 停留时长 | duration | 格式化为 `Xs`，无数据显示 `-`              |
| 访问时间 | created_at | 格式化为 `MM-DD HH:mm`                    |

- 使用 `DataTable` 组件 + `Pagination` 分页
- 每页 20 条
- 操作列：无（纯查看）

### 后端

**`src/lib/analytics.ts` 新增：**

```typescript
export interface VisitRecord {
  id: number;
  path: string;
  referrer: string;
  device: string;       // 'Desktop' | 'Mobile' | 'Tablet'
  visitorId: string;    // 截取前 8 位
  duration: number | null;
  createdAt: string;    // ISO datetime
}

export async function getVisits(
  siteId: number,
  range: string,
  page: number,
  pageSize: number
): Promise<{ data: VisitRecord[]; total: number }>
```

实现：查询 `zhijian_track_events` 表，按 `created_at DESC` 排序，分页返回。device 由 `screen_width` 推导（≥1024 → Desktop，≥768 → Tablet，<768 → Mobile）。duration 取 `duration` 字段。

**`src/app/api/admin/analytics/visits/route.ts` 新增：**

GET 接口，参数：`siteId`, `range`, `page`, `pageSize`，返回 `{ data, total }`。

### 路由

无新路由。Tab 切换完全是客户端状态，在现有 `analytics-dashboard.tsx` 中实现。

## 不做的事

- 不做搜索/筛选（后续按需添加）
- 不做访客维度聚合（只展示单次访问明细）
- 不做导出功能
