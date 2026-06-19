import type { Metadata } from 'next';

import TaxonomyManagement from '@/app/admin/taxonomy/_components/taxonomy-management';

export const metadata: Metadata = {
    title: '分类标签',
};

/*== 分类与标签合并管理页 ==*/
export default function AdminTaxonomyPage() {
    return <TaxonomyManagement />;
}
