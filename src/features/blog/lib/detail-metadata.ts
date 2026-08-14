/*============================================================================
  blog detail metadata - 博客详情元数据

  为已发布文章生成详情页 SEO 元数据与结构化数据。
============================================================================*/

import type { Metadata } from "next";

import { HERO_CONTENT } from "@/config/home";
import { DEFAULT_OPEN_GRAPH, DEFAULT_OG_IMAGE, SITE_METADATA } from "@/config/metadata";
import { toPostIsoDateTime } from "@/lib/core/date";
import { serializeJsonLd } from "@/lib/core/json-ld";
import type { PublishedPostDetail } from "@/types/post";

/*== 文章详情只声明已发布内容；数据不可用时禁止收录故障页 ==*/
export function buildPostMetadata(post: PublishedPostDetail | null): Metadata {
    if (!post) {
        return {
            title: "文章",
            robots: {
                index: false,
                follow: false,
                noarchive: true,
            },
        };
    }

    const title = post.title;
    const description = post.summary ?? SITE_METADATA.description;
    const canonical = getPostHref(post.slug);
    const publishedTime = toPostIsoDateTime(post.publishedAt);
    const modifiedTime = toPostIsoDateTime(post.updatedAt);
    const tagNames = post.tags.map((tag) => tag.name);

    return {
        title,
        description,
        keywords: [...tagNames, ...(post.categoryName ? [post.categoryName] : []), ...SITE_METADATA.keywords],
        alternates: { canonical },
        openGraph: {
            ...DEFAULT_OPEN_GRAPH,
            type: "article",
            title,
            description,
            url: canonical,
            publishedTime,
            modifiedTime,
            authors: [HERO_CONTENT.author],
            section: post.categoryName ?? undefined,
            tags: tagNames,
            images: [
                post.coverImage
                    ? { url: post.coverImage, alt: post.altText ?? post.title }
                    : { url: DEFAULT_OG_IMAGE, alt: SITE_METADATA.brandTitle },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [post.coverImage ?? DEFAULT_OG_IMAGE],
        },
    };
}

export function buildPostJsonLd(post: PublishedPostDetail): string {
    const canonical = getPostHref(post.slug);
    const publishedTime = toPostIsoDateTime(post.publishedAt);
    const modifiedTime = toPostIsoDateTime(post.updatedAt);
    const image = post.coverImage ? new URL(post.coverImage, SITE_METADATA.siteUrl).toString() : undefined;

    return serializeJsonLd({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        headline: post.title,
        description: post.summary ?? SITE_METADATA.description,
        image,
        datePublished: publishedTime,
        dateModified: modifiedTime,
        author: {
            "@type": "Person",
            name: HERO_CONTENT.author,
            url: SITE_METADATA.siteUrl.toString(),
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonical,
        },
        articleSection: post.categoryName ?? undefined,
        keywords: post.tags.map((tag) => tag.name).join(", ") || undefined,
        inLanguage: "zh-CN",
    });
}

function getPostHref(slug: string): string {
    return new URL(`/blog/${slug}`, SITE_METADATA.siteUrl).toString();
}
