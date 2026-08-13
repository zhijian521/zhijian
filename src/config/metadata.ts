/*============================================================================
  metadata - 站点元数据

  集中维护站点 URL、跨页面默认值与根布局元数据。
============================================================================*/

import "server-only";

import type { Metadata } from "next";

import { HERO_CONTENT } from "@/config/home";

const DEFAULT_SITE_URL = "https://yuwb.dev";
export const DEFAULT_OG_IMAGE = "/images/og-default.webp";

/*== 项目SEO配置 ==*/
export const SITE_METADATA = {
    name: "知简",
    brandName: "Zhijian",
    brandTitle: "Zhijian博客 - 简静造物",
    description:
        "Zhijian的个人技术博客 - 追求简洁设计与美好事物，以代码与文字安静造物。涵盖前端开发、React、Next.js、TypeScript、AI编程、全栈实践与Agent开发。",
    keywords: [
        "Zhijian",
        "知简",
        "简静造物",
        "前端开发",
        "全栈开发",
        "React",
        "Next.js",
        "TypeScript",
        "AI编程",
        "技术博客",
    ],
    locale: "zh_CN",
    siteUrl: resolveSiteUrl(process.env.SITE_URL),
} as const;

/*== 根布局默认元数据 ==*/
export const ROOT_METADATA = {
    metadataBase: SITE_METADATA.siteUrl,
    title: {
        default: SITE_METADATA.brandTitle,
        template: `%s - ${SITE_METADATA.brandTitle}`,
    },
    description: SITE_METADATA.description,
    applicationName: SITE_METADATA.brandName,
    authors: [{ name: HERO_CONTENT.author, url: SITE_METADATA.siteUrl }],
    creator: HERO_CONTENT.author,
    publisher: HERO_CONTENT.author,
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
            {
                url: "/images/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png",
            },
            {
                url: "/images/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png",
            },
        ],
        apple: [
            {
                url: "/images/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
    openGraph: {
        type: "website",
        locale: SITE_METADATA.locale,
        siteName: SITE_METADATA.name,
        images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_METADATA.brandTitle }],
    },
    alternates: {
        types: {
            "application/rss+xml": "/feed.xml",
        },
    },
    twitter: {
        card: "summary_large_image",
        images: [DEFAULT_OG_IMAGE],
    },
    robots: {
        index: true,
        follow: true,
    },
} satisfies Metadata;

function resolveSiteUrl(value: string | undefined): URL {
    let siteUrl: URL;

    try {
        siteUrl = new URL(value?.trim() || DEFAULT_SITE_URL);
    } catch {
        throw new Error("SITE_URL 必须是完整的 HTTP(S) 站点根地址。");
    }

    const isHttpUrl = siteUrl.protocol === "http:" || siteUrl.protocol === "https:";
    const isRootUrl = siteUrl.pathname === "/" && !siteUrl.search && !siteUrl.hash;

    if (!isHttpUrl || !isRootUrl || siteUrl.username || siteUrl.password) {
        throw new Error("SITE_URL 必须是完整的 HTTP(S) 站点根地址。");
    }

    return siteUrl;
}
