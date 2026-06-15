import type { Metadata } from 'next';

import AnalyticsDashboard from './_components/analytics-dashboard';

export const metadata: Metadata = {
    title: '统计概览',
};

/*== 观澜 — 站点监控仪表盘 ==*/
export default function AnalyticsPage() {
    return <AnalyticsDashboard />;
}
