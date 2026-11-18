/*============================================================================
  layout — 后台布局（鉴权 + 路由分发）

  登录页直接渲染，编辑器页给全屏 + Toast，其余页面渲染侧边导航壳层。
  通过 middleware 注入的 x-current-path 头区分路由模式。
============================================================================*/

import { headers } from 'next/headers';

/*== 组件导入 ==*/
import AdminSidebar from '@/components/modules/admin/admin-sidebar';
import { ToastContainer } from '@/components/ui/toast';

/*== 数据与配置 ==*/
import { requireAdmin } from '@/lib/core/auth';
import { APP_ROUTES } from '@/lib/core/site';

/*== 样式导入 ==*/
import './globals.css';
import styles from './layout.module.css';

/*== 类型定义 ==*/
interface AdminLayoutProps {
    children: React.ReactNode;
}

/*== 编辑器路由：匹配 /admin/posts/:id 时脱离侧边栏，全屏编辑。 ==*/
const EDITOR_PATTERN = /^\/admin\/posts\/\d+/;

/*== 后台布局：登录页直接渲染，编辑器页全屏+Toast，其余页面鉴权后走侧边导航壳层。 ==*/
export default async function AdminLayout({ children }: AdminLayoutProps) {
    const headersList = await headers();
    const currentPath = headersList.get('x-current-path') || '/admin';
    const isLoginRoute = currentPath === APP_ROUTES.adminLogin;
    const isEditorRoute = EDITOR_PATTERN.test(currentPath);

    if (isLoginRoute) {
        return children;
    }

    await requireAdmin();

    if (isEditorRoute) {
        return (
            <>
                {children}
                <ToastContainer />
            </>
        );
    }

    return (
        <main className={styles.layout}>
            <div aria-hidden="true" className={styles.texture} />
            <AdminSidebar />
            <section className={styles.main}>{children}</section>
            <ToastContainer />
        </main>
    );
}
