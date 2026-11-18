/*============================================================================
  page — 数据概览页

  服务端读取站点选项并渲染页面头部，
  AnalyticsDashboard 承接统计查询、筛选和图表交互。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import AdminPageHeader from '@/components/modules/admin/page-header';
import AnalyticsDashboard from '@/components/modules/admin/analytics-dashboard';

/*== 数据与配置 ==*/
import { listTrackSites } from '@/lib/domain/track-sites';

export const metadata: Metadata = {
    title: '统计概览',
};

/*== 观澜 — 站点监控仪表盘 ==*/
export default async function AnalyticsPage() {
    const initialSites = (await listTrackSites()).map(({ id, name }) => ({ id, name }));

    return (
        <>
            <AdminPageHeader
                description="查看站点访问数据，了解流量趋势和用户行为。"
                eyebrow="Analytics"
                title="网站统计"
            />
            <AnalyticsDashboard initialSites={initialSites} />
        </>
    );
}
