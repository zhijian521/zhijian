import type { Metadata } from 'next';

import CategoryManagement from '@/app/admin/categories/_components/category-management';

export const metadata: Metadata = {
    title: '分类管理',
};

/*== 分类管理页：静态数据，不调 API。 ==*/
export default function AdminCategoriesPage() {
    return <CategoryManagement />;
}
