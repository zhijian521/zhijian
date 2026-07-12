/*============================================================================
  page — 图片管理页

  图片上传、浏览、删除等交互由 UploadManagement 客户端组件承接。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import UploadManagement from '@/components/modules/admin/upload-management';

export const metadata: Metadata = {
    title: '图片管理',
};

export default function AdminUploadsPage() {
    return <UploadManagement />;
}
