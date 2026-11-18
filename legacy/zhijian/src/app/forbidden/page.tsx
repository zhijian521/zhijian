/*============================================================================
  forbidden — 403 禁止访问页

  非管理员尝试访问后台时展示。
  复用 StatusPage 组件，水墨背景 + 毛玻璃卡片 + 诗意文案。
============================================================================*/

import type { Metadata } from 'next';
import { StatusPage } from '@/components/ui/status-page';

export const metadata: Metadata = {
    title: '403 禁止访问',
};

export default function ForbiddenPage() {
    return <StatusPage code={403} title="此门非君可入，且留步转身" subtitle="权限未至，莫强前行。" />;
}
