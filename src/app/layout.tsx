/*============================================================================
  layout — 项目根布局

  Next.js App Router 根布局，设置全局 <html>/<body>、元数据
  （title 模板、OG、Twitter、favicon、manifest、RSS alternate），
  交由 AppFrame 客户端壳层根据路由分发前台与后台视觉结构。
============================================================================*/

import type { Metadata } from 'next';

/*== 组件导入 ==*/
import AppFrame from '@/components/site/app-frame';

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';

/*== 全局样式 ==*/
import './globals.css';

/*== 页面元数据 ==*/
export const metadata: Metadata = {
    metadataBase: new URL(SITE_METADATA.siteUrl),
    title: {
        default: SITE_METADATA.brandTitle,
        template: `%s - ${SITE_METADATA.brandTitle}`,
    },
    description: SITE_METADATA.description,
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '32x32' },
            { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [{ url: '/images/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.json',
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

/*== 类型定义 ==*/
interface RootLayoutProps {
    children: React.ReactNode;
}

/*== 项目根布局：交由客户端壳层根据当前路由分发前台与后台视觉结构。 ==*/
export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="zh-CN">
            <body>
                <AppFrame>{children}</AppFrame>
            </body>
        </html>
    );
}
