/*============================================================================
  app-frame — 根壳层分发器

  客户端组件，根据当前 pathname 实时分发：
    /admin/* 和 /nav → 直接渲染 children（后台/导航站自有布局）
    其余路由 → 包裹 PublicChrome（前台公共壳层）
============================================================================*/

'use client';

import { usePathname } from 'next/navigation';

/*== 数据与配置 ==*/
import { APP_ROUTES } from '@/lib/core/site';
import PublicChrome from '@/components/site/public-chrome';

/*== 类型定义 ==*/
interface AppFrameProps {
    children: React.ReactNode;
}

/*== 根壳层分发器：根据当前路由在前台 PublicChrome 与后台页面之间实时切换。 ==*/
export default function AppFrame({ children }: AppFrameProps) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith(APP_ROUTES.admin);
    const isNavRoute = pathname === APP_ROUTES.nav;

    if (isAdminRoute || isNavRoute) {
        return children;
    }

    return <PublicChrome>{children}</PublicChrome>;
}
