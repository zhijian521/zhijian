/*============================================================================
  robots - robots.txt 生成器

  允许公开页面被抓取，禁止后台和内部 API 进入搜索索引。
============================================================================*/

import type { MetadataRoute } from "next";

import { SITE_METADATA } from "@/config/metadata";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/api/"],
        },
        sitemap: new URL("/sitemap.xml", SITE_METADATA.siteUrl).toString(),
    };
}
