/*============================================================================
  page — 分类标签管理页

  服务端并行读取分类与标签并渲染页面头部，
  TaxonomyManagement 承接后续 CRUD 交互。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import AdminPageHeader from '@/components/modules/admin/page-header';
import TaxonomyManagement from '@/components/modules/admin/taxonomy-management';

/*== 数据与配置 ==*/
import { listCategories } from '@/lib/domain/categories';
import { listTags } from '@/lib/domain/tags';

export const metadata: Metadata = {
    title: '分类标签',
};

/*== 分类与标签合并管理页 ==*/
export default async function AdminTaxonomyPage() {
    const [categories, tags] = await Promise.all([listCategories(), listTags()]);

    return (
        <>
            <AdminPageHeader
                description="管理文章分类与标签，支持新增、编辑和删除。"
                eyebrow="Categories & Tags"
                title="分类标签"
            />
            <TaxonomyManagement
                initialCategories={categories.map(({ id, name, slug, sort_order }) => ({
                    id,
                    name,
                    slug,
                    sort_order,
                }))}
                initialTags={tags.map(({ id, name, slug }) => ({ id, name, slug }))}
            />
        </>
    );
}
