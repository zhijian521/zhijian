import { headers } from 'next/headers';

import AdminShell from '@/app/admin/_components/admin-shell';
import { ToastContainer } from '@/components/ui/toast';
import { requireAdmin } from '@/lib/auth';
import { APP_ROUTES } from '@/lib/site';
import './globals.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

/*== 编辑器路由：匹配 /admin/posts/:id 时脱离 AdminShell，全屏编辑。 ==*/
const EDITOR_PATTERN = /^\/admin\/posts\/\d+/;

/*== 后台布局：登录页和编辑器页跳过后台壳层，其余页面统一做鉴权与侧边导航包裹。 ==*/
export default async function AdminLayout({ children }: AdminLayoutProps) {
    const headersList = await headers();
    const currentPath = headersList.get('x-current-path') || '/admin';
    const isLoginRoute = currentPath === APP_ROUTES.adminLogin;
    const isEditorRoute = EDITOR_PATTERN.test(currentPath);

    if (isLoginRoute) {
        return children;
    }

    // requireAdmin：未登录 → /admin/login，非 admin → /forbidden
    await requireAdmin();

    if (isEditorRoute) {
        return (
            <>
                {children}
                <ToastContainer />
            </>
        );
    }

    return <AdminShell>{children}</AdminShell>;
}
