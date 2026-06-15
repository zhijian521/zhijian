import type { Metadata } from 'next';

import SiteManagement from './_components/site-management';

export const metadata: Metadata = {
    title: '站点管理',
};

/*== 站点管理页面 ==*/
export default function AnalyticsSitesPage() {
    return <SiteManagement />;
}
