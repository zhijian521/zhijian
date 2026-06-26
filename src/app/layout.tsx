import type { Metadata } from 'next';

import AppFrame from '@/components/site/app-frame';
import { SITE_METADATA } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_METADATA.siteUrl),
    title: {
        default: SITE_METADATA.brandTitle,
        template: `%s - ${SITE_METADATA.brandTitle}`,
    },
    description: SITE_METADATA.description,
    icons: {
        /* logo.png 保留 PNG 格式：favicon + JSON-LD Organization logo 兼容性，勿删 */
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
        types: {
            'application/rss+xml': `${SITE_METADATA.siteUrl}/feed.xml`,
        },
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
