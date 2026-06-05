import type { Metadata } from 'next';
import { Suspense } from 'react';

import AppFrame from '@/components/site/app-frame';
import { SITE_METADATA } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
    title: 'Zhijian',
    description: SITE_METADATA.description,
    icons: {
        icon: '/images/logo.png',
    },
};

interface RootLayoutProps {
    children: React.ReactNode;
}

/*== 项目根布局：交由客户端壳层根据当前路由分发前台与后台视觉结构。 ==*/
export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang='zh-CN'>
            <body>
                <AppFrame>
                    <Suspense>{children}</Suspense>
                </AppFrame>
            </body>
        </html>
    );
}
