'use client';

import { usePathname } from 'next/navigation';

import { APP_ROUTES } from '@/lib/site';
import PublicChrome from '@/components/site/public-chrome';

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
