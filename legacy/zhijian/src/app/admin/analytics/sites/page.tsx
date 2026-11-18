/*============================================================================
  page — 站点管理页

  服务端读取站点首屏数据并渲染页面头部，
  SiteManagement 承接后续站点管理和接入代码交互。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import AdminPageHeader from '@/components/modules/admin/page-header';
import SiteManagement from '@/components/modules/admin/site-management';

/*== 数据与配置 ==*/
import { listTrackSites } from '@/lib/domain/track-sites';

export const metadata: Metadata = {
    title: '站点管理',
};

/*== 站点管理页面 ==*/
export default async function AnalyticsSitesPage() {
    const sites = await listTrackSites();

    return (
        <>
            <AdminPageHeader
                description="管理监控站点，获取接入代码嵌入目标网站即可开始采集数据。"
                eyebrow="Analytics"
                title="站点管理"
            />
            <SiteManagement initialData={{ data: sites, total: sites.length }} />
        </>
    );
}
