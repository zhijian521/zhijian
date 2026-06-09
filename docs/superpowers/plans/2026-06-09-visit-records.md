# 访问记录列表 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在数据概览页新增「访问记录」Tab，展示站点访问明细 DataTable，支持分页。

**架构：** 在现有 analytics-dashboard.tsx 中用 PillSelect 做 Tab 切换（统计概览 / 访问记录），两个 Tab 共享 siteId + range 筛选。后端新增 `getVisits` 数据层函数和 `/admin/analytics/visits` API 路由，从 `zhijian_track_events` 表分页查询原始事件。

**技术栈：** Next.js App Router、MySQL (mysql2)、React CSS Modules、现有 DataTable/Pagination/Tag/PillSelect 组件

---

## 文件结构

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `src/lib/analytics.ts` | 新增 `VisitRecord` 类型和 `getVisits` 查询函数 |
| 创建 | `src/app/api/admin/analytics/visits/route.ts` | 访问记录 API 路由（GET，分页） |
| 修改 | `src/app/admin/analytics/_components/analytics-dashboard.tsx` | 新增 Tab 切换 + 访问记录表格 |
| 修改 | `src/app/admin/analytics/_components/analytics-dashboard.module.css` | 新增 Tab 栏和访问记录表格样式 |

---

### 任务 1：后端数据层 — 新增 VisitRecord 类型和 getVisits 函数

**文件：**
- 修改：`src/lib/analytics.ts`

- [ ] **步骤 1：在 analytics.ts 末尾新增 VisitRecord 类型和 getVisits 函数**

在 `src/lib/analytics.ts` 文件末尾（`getDevices` 函数之后）追加：

```typescript
/*== 访问记录 ==*/
export interface VisitRecord {
    id: number;
    path: string;
    referrer: string;
    device: string;
    visitorId: string;
    duration: number | null;
    createdAt: string;
}

export async function getVisits(
    siteId: string,
    range: DateRange,
    page: number,
    pageSize: number,
): Promise<{ data: VisitRecord[]; total: number }> {
    const db = getDb();
    if (!db) return { data: [], total: 0 };

    const days = getDaysAgo(range);
    const startDate = formatDate(new Date(Date.now() - days * 86400000));
    const offset = (page - 1) * pageSize;

    /* 总数 */
    const [countRows] = await db.execute<RowDataPacket[]>(`
        SELECT COUNT(*) AS total
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND DATE(created_at) >= ?
    `, [siteId, startDate]);
    const total = (countRows[0] as any)?.total || 0;

    /* 分页数据 */
    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT
            id,
            path,
            referrer,
            screen,
            visitor_id,
            duration,
            created_at
        FROM zhijian_track_events
        WHERE site_id = ? AND type = 'pageview' AND DATE(created_at) >= ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `, [siteId, startDate, pageSize, offset]);

    const data: VisitRecord[] = (rows as any[]).map((r) => {
        /* 从 screen 字段推导设备类型，格式如 "1920x1080" */
        let device = 'Desktop';
        if (r.screen && typeof r.screen === 'string' && r.screen.includes('x')) {
            const w = parseInt(r.screen.split('x')[0], 10);
            if (!isNaN(w)) {
                if (w <= 768) device = 'Mobile';
                else if (w <= 1024) device = 'Tablet';
            }
        }

        /* 来源：空则显示「直接访问」，否则提取域名 */
        let referrer = '直接访问';
        if (r.referrer && typeof r.referrer === 'string' && r.referrer.trim()) {
            try {
                const url = new URL(r.referrer);
                referrer = url.hostname;
            } catch {
                referrer = r.referrer.split('/')[0] || '直接访问';
            }
        }

        return {
            id: r.id,
            path: r.path || '/',
            referrer,
            device,
            visitorId: (r.visitor_id || '').slice(0, 8),
            duration: r.duration != null && r.duration > 0 ? r.duration : null,
            createdAt: r.created_at instanceof Date
                ? r.created_at.toISOString()
                : String(r.created_at),
        };
    });

    return { data, total };
}
```

- [ ] **步骤 2：运行 TypeScript 类型检查**

运行：`npx tsc --noEmit --pretty`
预期：无错误

- [ ] **步骤 3：Commit**

```bash
git add src/lib/analytics.ts
git commit -m "feat(分析): 新增 VisitRecord 类型和 getVisits 查询函数"
```

---

### 任务 2：后端 API 路由 — 新增 /admin/analytics/visits

**文件：**
- 创建：`src/app/api/admin/analytics/visits/route.ts`

- [ ] **步骤 1：创建 visits API 路由文件**

创建 `src/app/api/admin/analytics/visits/route.ts`：

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { getVisits } from '@/lib/analytics';
import { success, fail, BizCode } from '@/lib/api-response';
import type { DateRange } from '@/lib/analytics';

const VALID_RANGES = new Set<DateRange>(['7d', '30d', '90d']);

/*== GET /admin/analytics/visits — 访问记录分页列表 ==*/
export async function GET(request: NextRequest) {
    const admin = await requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const siteId = searchParams.get('siteId');
    const rangeParam = searchParams.get('range') || '7d';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20));

    if (!siteId) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少 siteId 参数'), { status: 400 });
    }

    if (!VALID_RANGES.has(rangeParam as DateRange)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的 range 参数'), { status: 400 });
    }

    const result = await getVisits(siteId, rangeParam as DateRange, page, pageSize);

    return NextResponse.json(success(result));
}
```

- [ ] **步骤 2：运行 TypeScript 类型检查**

运行：`npx tsc --noEmit --pretty`
预期：无错误

- [ ] **步骤 3：Commit**

```bash
git add src/app/api/admin/analytics/visits/route.ts
git commit -m "feat(分析): 新增 /admin/analytics/visits API 路由"
```

---

### 任务 3：前端 — Tab 切换 + 访问记录表格

**文件：**
- 修改：`src/app/admin/analytics/_components/analytics-dashboard.tsx`
- 修改：`src/app/admin/analytics/_components/analytics-dashboard.module.css`

- [ ] **步骤 1：在 analytics-dashboard.tsx 中新增 imports 和状态**

在文件顶部 import 区域追加：

```typescript
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import { Tag } from '@/components/ui/tag';
import { Pagination } from '@/components/ui/pagination';
```

在 `AnalyticsDashboard` 组件内部，在现有 state 声明之后追加：

```typescript
const [tab, setTab] = useState<'overview' | 'visits'>('overview');
const [visits, setVisits] = useState<{ data: VisitRecord[]; total: number }>({ data: [], total: 0 });
const [visitsPage, setVisitsPage] = useState(1);
const [visitsLoading, setVisitsLoading] = useState(false);
const visitsPageSize = 20;
```

在组件内部（`AnalyticsData` 接口之后、`formatNum` 函数之前）追加 `VisitRecord` 接口：

```typescript
interface VisitRecord {
    id: number;
    path: string;
    referrer: string;
    device: string;
    visitorId: string;
    duration: number | null;
    createdAt: string;
}
```

- [ ] **步骤 2：新增 fetchVisits 函数**

在 `copyEmbedCode` 函数之后追加：

```typescript
const fetchVisits = useCallback(async () => {
    if (!siteId) return;
    setVisitsLoading(true);
    try {
        const res = await api.get<{ data: VisitRecord[]; total: number }>('/admin/analytics/visits', {
            siteId,
            range,
            page: visitsPage,
            pageSize: visitsPageSize,
        });
        if (res.code === 0 && res.data) {
            setVisits(res.data);
        }
    } catch (err) {
        console.error('获取访问记录失败：', err);
    } finally {
        setVisitsLoading(false);
    }
}, [siteId, range, visitsPage]);

useEffect(() => {
    if (tab === 'visits') fetchVisits();
}, [tab, fetchVisits]);
```

- [ ] **步骤 3：新增访问记录列定义和辅助函数**

在 `fetchVisits` 的 useEffect 之后追加：

```typescript
function formatVisitTime(isoStr: string): string {
    try {
        const d = new Date(isoStr);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${mm}-${dd} ${hh}:${mi}`;
    } catch {
        return isoStr;
    }
}

const deviceTagVariant = (device: string): 'primary' | 'default' | 'outlined' => {
    if (device === 'Mobile') return 'primary';
    if (device === 'Tablet') return 'outlined';
    return 'default';
};

const visitColumns: DataColumn<VisitRecord>[] = [
    {
        header: '页面',
        render: (v) => <span className={styles.visitPath}>{v.path}</span>,
    },
    {
        header: '来源',
        hideBelow: 'sm',
        render: (v) => <span className={styles.visitMuted}>{v.referrer}</span>,
    },
    {
        header: '设备',
        hideBelow: 'md',
        render: (v) => (
            <Tag size="mini" variant={deviceTagVariant(v.device)}>
                {v.device}
            </Tag>
        ),
    },
    {
        header: '访客',
        hideBelow: 'lg',
        render: (v) => <span className={styles.visitMuted}>{v.visitorId}</span>,
    },
    {
        header: '停留时长',
        hideBelow: 'lg',
        render: (v) => (
            <span className={styles.visitMuted}>
                {v.duration != null ? `${v.duration}s` : '-'}
            </span>
        ),
    },
    {
        header: '访问时间',
        render: (v) => <span className={styles.visitMuted}>{formatVisitTime(v.createdAt)}</span>,
    },
];
```

- [ ] **步骤 4：修改 JSX — 在 controls 下方添加 Tab 栏，用 tab 切换内容区**

在 `return` 的 JSX 中，找到 `{/* 站点选择 + 时间范围 */}` 的 `</div>` 结束标签之后，插入 Tab 栏：

```tsx
{/* Tab 切换 */}
<div className={styles.tabBar}>
    <PillSelect
        name="analytics-tab"
        onChange={(v) => { setTab(v as 'overview' | 'visits'); setVisitsPage(1); }}
        options={[
            { value: 'overview', label: '统计概览' },
            { value: 'visits', label: '访问记录' },
        ]}
        value={tab}
    />
</div>
```

然后将 `loading && !data` 到 `</>` 之前的整个内容区用 tab 条件包裹：

- 当 `tab === 'overview'` 时，渲染现有的概览内容（从 `{loading && !data ?` 到 `</>` 之前的那段）
- 当 `tab === 'visits'` 时，渲染访问记录表格

具体修改：将现有的三目表达式（`loading && !data ? ... : !siteId ? ... : <>概览内容</>`）包裹在 `{tab === 'overview' && (...)}` 中，然后在其后追加 `{tab === 'visits' && (...)}` 块。

访问记录 Tab 的 JSX：

```tsx
{tab === 'visits' && (
    <>
        {!siteId ? (
            <div className={styles.empty}>
                <p>请先在「站点管理」中创建站点，获取接入代码嵌入目标网站。</p>
                <GhostButton asButton href="/admin/analytics/sites" size="medium" variant="primary">
                    前往站点管理
                </GhostButton>
            </div>
        ) : (
            <>
                <DataTable
                    columns={visitColumns}
                    emptyText={visitsLoading ? '加载中...' : '暂无访问记录'}
                    rowKey={(v) => v.id}
                    rows={visits.data}
                />
                <Pagination
                    current={visitsPage}
                    onPageChange={setVisitsPage}
                    total={Math.max(1, Math.ceil(visits.total / visitsPageSize))}
                />
            </>
        )}
    </>
)}
```

- [ ] **步骤 5：新增 CSS 样式**

在 `analytics-dashboard.module.css` 末尾追加：

```css
/*-- Tab 栏 --*/

.tabBar {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
}

/*-- 访问记录表格 --*/

.visitPath {
    font-size: 0.8rem;
    color: var(--foreground);
    word-break: break-all;
}

.visitMuted {
    font-size: 0.8rem;
    color: var(--muted-foreground);
}
```

- [ ] **步骤 6：运行 TypeScript 类型检查**

运行：`npx tsc --noEmit --pretty`
预期：无错误

- [ ] **步骤 7：Commit**

```bash
git add src/app/admin/analytics/_components/analytics-dashboard.tsx src/app/admin/analytics/_components/analytics-dashboard.module.css
git commit -m "feat(分析): 数据概览页新增访问记录 Tab，展示访问明细表格"
```

---

### 任务 4：验证

- [ ] **步骤 1：运行完整 TypeScript 类型检查**

运行：`npx tsc --noEmit --pretty`
预期：无错误

- [ ] **步骤 2：运行 Next.js 构建**

运行：`npx next build 2>&1 | tail -20`
预期：构建成功

- [ ] **步骤 3：最终 Commit（如有遗漏修复）**

如果有遗漏修复，commit 之。否则跳过。
