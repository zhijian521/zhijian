/*============================================================================
  nav metadata - 导航页元数据

  导航页使用独立的元数据，保留根布局提供的站点级默认配置。
============================================================================*/

import type { Metadata } from "next";

import { DEFAULT_OPEN_GRAPH, SITE_METADATA } from "@/config/metadata";

export const NAV_METADATA = {
    title: "导航",
    description: "知简导航，聚合搜索与常用书签。",
    alternates: { canonical: "/nav" },
    openGraph: {
        ...DEFAULT_OPEN_GRAPH,
        title: `导航 - ${SITE_METADATA.brandTitle}`,
        description: "知简导航，聚合搜索与常用书签。",
        url: "/nav",
    },
} satisfies Metadata;
