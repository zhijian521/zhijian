/*============================================================================
  page — 站点管理页

  多站点注册与删除交互由 SiteManagement 客户端组件承接。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import SiteManagement from '@/components/modules/admin/site-management';

export const metadata: Metadata = {
    title: '站点管理',
};

/*== 站点管理页面 ==*/
export default function AnalyticsSitesPage() {
    return <SiteManagement />;
}
