/*============================================================================
  page — 图片管理页

  服务端读取图片首屏数据并渲染页面头部，
  UploadManagement 承接后续分页、编辑和同步交互。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import AdminPageHeader from '@/components/modules/admin/page-header';
import UploadManagement from '@/components/modules/admin/upload-management';

/*== 数据与配置 ==*/
import { listUploads } from '@/lib/domain/uploads';

export const metadata: Metadata = {
    title: '图片管理',
};

export default async function AdminUploadsPage() {
    const initialData = await listUploads(1, 10);

    return (
        <>
            <AdminPageHeader
                description="上传和管理文章图片，支持复制 Markdown 路径和同步到本地开发环境。"
                eyebrow="Uploads"
                title="图片管理"
            />
            <UploadManagement initialData={initialData} />
        </>
    );
}
