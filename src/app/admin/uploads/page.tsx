import type { Metadata } from 'next';
import UploadManagement from '@/app/admin/uploads/_components/upload-management';

export const metadata: Metadata = {
    title: '图片管理',
};

export default function AdminUploadsPage() {
    return <UploadManagement />;
}
