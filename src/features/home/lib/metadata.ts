/*============================================================================
  home metadata - 首页元数据

  定义首页专属 SEO 元数据与结构化数据，站点级默认值仍由 config 管理。
============================================================================*/

import type { Metadata } from "next";

import { ABOUT_CONTENT, HERO_CONTENT } from "@/config/home";
import { DEFAULT_OG_IMAGE, DEFAULT_OPEN_GRAPH, SITE_METADATA } from "@/config/metadata";
import { serializeJsonLd } from "@/lib/core/json-ld";

export const HOME_METADATA = {
    title: { absolute: SITE_METADATA.brandTitle },
    description: SITE_METADATA.description,
    keywords: [...SITE_METADATA.keywords],
    alternates: { canonical: "/" },
    openGraph: {
        ...DEFAULT_OPEN_GRAPH,
        title: SITE_METADATA.brandTitle,
        description: SITE_METADATA.description,
        url: "/",
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_METADATA.brandTitle,
        description: SITE_METADATA.description,
        images: [DEFAULT_OG_IMAGE],
    },
} satisfies Metadata;

/*== 当前只声明已真实存在的站点与作者实体 ==*/
const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "@id": new URL("#website", SITE_METADATA.siteUrl).toString(),
            url: SITE_METADATA.siteUrl.toString(),
            name: SITE_METADATA.name,
            alternateName: SITE_METADATA.brandName,
            description: SITE_METADATA.description,
            inLanguage: "zh-CN",
            publisher: { "@id": new URL("#author", SITE_METADATA.siteUrl).toString() },
        },
        {
            "@type": "Person",
            "@id": new URL("#author", SITE_METADATA.siteUrl).toString(),
            name: HERO_CONTENT.author,
            url: SITE_METADATA.siteUrl.toString(),
            image: new URL("/images/profile.webp", SITE_METADATA.siteUrl).toString(),
            description: ABOUT_CONTENT.bio,
            sameAs: [ABOUT_CONTENT.links.github],
        },
    ],
};

export const HOME_JSON_LD = serializeJsonLd(homeJsonLd);
