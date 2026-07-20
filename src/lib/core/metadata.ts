/*============================================================================
  metadata — Next.js 元数据配置

  集中维护跨页面复用的 Metadata 常量，避免路由文件承担站点级 SEO 配置。
============================================================================*/

/*== 依赖导入 ==*/
import type { Metadata } from 'next';
import { SITE_METADATA } from '@/lib/core/site';

/*== 根布局元数据 ==*/
export const ROOT_METADATA: Metadata = {
    metadataBase: new URL(SITE_METADATA.siteUrl),
    title: {
        default: SITE_METADATA.brandTitle,
        template: `%s - ${SITE_METADATA.brandTitle}`,
    },
    description: SITE_METADATA.description,
    authors: [{ name: SITE_METADATA.author }],
    creator: SITE_METADATA.author,
    publisher: SITE_METADATA.author,
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
        types: {
            'application/rss+xml': `${SITE_METADATA.siteUrl}/feed.xml`,
        },
    },
    robots: {
        index: true,
        follow: true,
    },
};
