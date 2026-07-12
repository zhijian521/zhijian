/*============================================================================
  page — 数据概览页

  观澜站点监控仪表盘，交互由 AnalyticsDashboard 客户端组件承接。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import AnalyticsDashboard from '@/components/modules/admin/analytics-dashboard';

export const metadata: Metadata = {
    title: '统计概览',
};

/*== 观澜 — 站点监控仪表盘 ==*/
export default function AnalyticsPage() {
    return <AnalyticsDashboard />;
}
