import type { Metadata } from 'next';

import { StatusPage } from '@/components/ui/status-page';

export const metadata: Metadata = {
    title: '403 禁止访问',
};

/*== 403 页面：非管理员尝试访问后台时展示。 ==*/
export default function ForbiddenPage() {
    return <StatusPage code={403} title="此门非君可入，且留步转身" subtitle="权限未至，莫强前行。" />;
}
