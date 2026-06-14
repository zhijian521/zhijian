import type { Metadata } from 'next';

import AppFrame from '@/components/site/app-frame';
import { SITE_METADATA } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_METADATA.siteUrl),
    title: {
        default: SITE_METADATA.title,
        template: `%s | ${SITE_METADATA.title}`,
    },
    description: SITE_METADATA.description,
    icons: {
        icon: '/images/logo.png',
    },
    openGraph: {
        type: 'website',
        locale: SITE_METADATA.locale,
        siteName: SITE_METADATA.title,
        images: [{ url: SITE_METADATA.ogImage, alt: SITE_METADATA.title }],
    },
    twitter: {
        card: 'summary_large_image',
    },
    alternates: {
        canonical: '/',
    },
    robots: {
        index: true,
        follow: true,
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
                <AppFrame>{children}</AppFrame>
            </body>
        </html>
    );
}
