/*============================================================================
  page — 分类标签管理页

  合并分类与标签的 CRUD 管理，交互由 TaxonomyManagement 客户端组件承接。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import TaxonomyManagement from '@/components/modules/admin/taxonomy-management';

export const metadata: Metadata = {
    title: '分类标签',
};

/*== 分类与标签合并管理页 ==*/
export default function AdminTaxonomyPage() {
    return <TaxonomyManagement />;
}
