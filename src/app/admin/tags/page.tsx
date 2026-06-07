import type { Metadata } from 'next';

import TagManagement from '@/app/admin/tags/_components/tag-management';

export const metadata: Metadata = {
    title: '标签管理 - Zhijian',
};

/*== 标签管理页：静态数据，不调 API。 ==*/
export default function AdminTagsPage() {
    return <TagManagement />;
}
