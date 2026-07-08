import type { Metadata } from 'next';
import { cache } from 'react';

/*== 组件导入 ==*/
import ListClient from '@/components/modules/blog/list-client/list-client';
import type { ActiveFilterChip } from '@/components/modules/blog/header/header';
import type { FilterOption } from '@/components/modules/blog/filter-sidebar/filter-sidebar';
import { buildBlogUrl } from '@/lib/core/utils';

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';
import { listCategories } from '@/lib/domain/categories';
import { getPublishedPosts } from '@/lib/domain/posts';
import { listTags } from '@/lib/domain/tags';

const PAGE_SIZE = 10;

/*== cache 包裹：同一请求内 generateMetadata 与 render 共享查询结果，避免重复查库 ==*/
const cachedCategories = cache(listCategories);
const cachedTags = cache(listTags);
const cachedPublishedPosts = cache(getPublishedPosts);

/*== 类型定义 ==*/
interface BlogPageProps {
    searchParams: Promise<{ category?: string; page?: string; tags?: string }>;
}

interface BlogFilters {
    categorySlug?: string;
    currentPage: number;
    tagSlugs: string[];
}

interface FilterState {
    activeCategoryLabel: string;
    activeCategorySlug: string | undefined;
    activeFilterChips: ActiveFilterChip[];
    activeTagNames: string[];
    activeTagSlugs: string[];
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
}

/*== 参数解析 ==*/
function normalizePageNumber(value: string | undefined): number {
    const page = Number(value);
    if (!Number.isFinite(page) || page < 1) {
        return 1;
    }

    return Math.floor(page);
}

function normalizeTagSlugs(value: string | undefined): string[] {
    if (!value) {
        return [];
    }

    return [
        ...new Set(
            value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
        ),
    ];
}

async function resolveBlogFilters(searchParams: BlogPageProps['searchParams']): Promise<BlogFilters> {
    const params = await searchParams;
    const categorySlug = params.category?.trim();

    return {
        categorySlug: categorySlug || undefined,
        currentPage: normalizePageNumber(params.page),
        tagSlugs: normalizeTagSlugs(params.tags),
    };
}

/*== 筛选状态计算 ==*/
function resolveFilterState(
    filters: BlogFilters,
    categories: Awaited<ReturnType<typeof listCategories>>,
    tags: Awaited<ReturnType<typeof listTags>>
): FilterState {
    const categoryMap = new Map(categories.map((category) => [category.slug, category]));
    const tagMap = new Map(tags.map((tag) => [tag.slug, tag]));

    const activeCategorySlug =
        filters.categorySlug && categoryMap.has(filters.categorySlug) ? filters.categorySlug : undefined;
    const activeCategoryLabel = activeCategorySlug ? categoryMap.get(activeCategorySlug)!.name : '全部';
    const activeTagSlugs = filters.tagSlugs.filter((tagSlug) => tagMap.has(tagSlug));
    const activeTagNames = activeTagSlugs.map((tagSlug) => tagMap.get(tagSlug)!.name);

    /*-- 预计算筛选标签 chip 的移除 URL，避免客户端重建 URL 逻辑 --*/
    const activeFilterChips: ActiveFilterChip[] = [];
    if (activeCategorySlug) {
        activeFilterChips.push({
            label: categoryMap.get(activeCategorySlug)!.name,
            removeHref: buildBlogUrl({ tagSlugs: activeTagSlugs }),
        });
    }
    for (const tagSlug of activeTagSlugs) {
        activeFilterChips.push({
            label: tagMap.get(tagSlug)!.name,
            removeHref: buildBlogUrl({
                categorySlug: activeCategorySlug,
                tagSlugs: activeTagSlugs.filter((s) => s !== tagSlug),
            }),
        });
    }

    return {
        activeCategoryLabel,
        activeCategorySlug,
        activeFilterChips,
        activeTagNames,
        activeTagSlugs,
    };
}

/*== 筛选选项构建 ==*/
function buildFilterOptions(options: {
    activeCategorySlug?: string;
    activeTagSlugs: string[];
    categories: Awaited<ReturnType<typeof listCategories>>;
    tags: Awaited<ReturnType<typeof listTags>>;
}): {
    categoryOptions: FilterOption[];
    tagOptions: FilterOption[];
} {
    const categoryOptions: FilterOption[] = [
        {
            href: buildBlogUrl({
                tagSlugs: options.activeTagSlugs,
            }),
            label: '全部',
            slug: '',
        },
        ...options.categories.map((category) => ({
            href: buildBlogUrl({
                categorySlug: category.slug,
                tagSlugs: options.activeTagSlugs,
            }),
            label: category.name,
            slug: category.slug,
        })),
    ];

    const tagOptions: FilterOption[] = options.tags.map((tag) => {
        const nextTagSlugs = options.activeTagSlugs.includes(tag.slug)
            ? options.activeTagSlugs.filter((activeTag) => activeTag !== tag.slug)
            : [...options.activeTagSlugs, tag.slug];

        return {
            href: buildBlogUrl({
                categorySlug: options.activeCategorySlug,
                tagSlugs: nextTagSlugs,
            }),
            label: tag.name,
            slug: tag.slug,
        };
    });

    return {
        categoryOptions,
        tagOptions,
    };
}

/*== 共享计算：分页、标题、描述 ==*/
function computePagination(totalPosts: number, requestedPage: number): PaginationInfo {
    const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
    const currentPage = Math.min(requestedPage, totalPages);
    return { currentPage, totalPages };
}

function buildPageTitle(
    activeCategorySlug: string | undefined,
    activeCategoryLabel: string,
    activeTagNames: string[],
    currentPage: number
): string {
    return [
        SITE_METADATA.blogTitle,
        ...(activeCategorySlug ? [activeCategoryLabel] : []),
        ...(activeTagNames.length > 0 ? [activeTagNames.join(' / ')] : []),
        ...(currentPage > 1 ? [`第 ${currentPage} 页`] : []),
    ].join(' - ');
}

function buildPageDescription(
    activeCategorySlug: string | undefined,
    activeCategoryLabel: string,
    activeTagNames: string[],
    currentPage: number
): string {
    const segments: string[] = [SITE_METADATA.blogDescription];

    if (activeCategorySlug) {
        segments.push(`当前分类：${activeCategoryLabel}。`);
    }

    if (activeTagNames.length > 0) {
        segments.push(`当前标签：${activeTagNames.join('、')}。`);
    }

    if (currentPage > 1) {
        segments.push(`当前为第 ${currentPage} 页。`);
    }

    return segments.join(' ');
}

/*== 元数据 ==*/
export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
    const [filters, categories, tags] = await Promise.all([
        resolveBlogFilters(searchParams),
        cachedCategories(),
        cachedTags(),
    ]);
    const { activeCategoryLabel, activeCategorySlug, activeTagNames, activeTagSlugs } = resolveFilterState(
        filters,
        categories,
        tags
    );
    const posts = await cachedPublishedPosts({
        categorySlug: activeCategorySlug,
        tagSlugs: activeTagSlugs,
    });
    const hasFilterState = Boolean(activeCategorySlug) || activeTagSlugs.length > 0;
    const { currentPage, totalPages } = computePagination(posts.length, filters.currentPage);
    const canonical = buildBlogUrl({
        categorySlug: activeCategorySlug,
        page: currentPage,
        siteUrl: true,
        tagSlugs: activeTagSlugs,
    });
    const pageTitle = buildPageTitle(activeCategorySlug, activeCategoryLabel, activeTagNames, currentPage);
    const pageDescription = buildPageDescription(activeCategorySlug, activeCategoryLabel, activeTagNames, currentPage);

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: [...activeTagNames, ...(activeCategorySlug ? [activeCategoryLabel] : []), ...SITE_METADATA.keywords],
        robots: hasFilterState
            ? {
                  index: false,
                  follow: true,
              }
            : {
                  index: true,
                  follow: true,
              },
        authors: [{ name: SITE_METADATA.author }],
        creator: SITE_METADATA.author,
        publisher: SITE_METADATA.author,
        alternates: {
            canonical,
            ...(currentPage > 1 && {
                prev: buildBlogUrl({
                    categorySlug: activeCategorySlug,
                    page: currentPage - 1,
                    tagSlugs: activeTagSlugs,
                }),
            }),
            ...(currentPage < totalPages && {
                next: buildBlogUrl({
                    categorySlug: activeCategorySlug,
                    page: currentPage + 1,
                    tagSlugs: activeTagSlugs,
                }),
            }),
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: canonical,
            images: [{ url: SITE_METADATA.ogImage, alt: SITE_METADATA.blogTitle }],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            images: [SITE_METADATA.ogImage],
        },
    };
}

/*== 服务端渲染 ==*/
export const dynamic = 'force-dynamic';

export default async function BlogListPage({ searchParams }: BlogPageProps) {
    const [filters, categories, tags] = await Promise.all([
        resolveBlogFilters(searchParams),
        cachedCategories(),
        cachedTags(),
    ]);
    const { activeCategoryLabel, activeCategorySlug, activeFilterChips, activeTagNames, activeTagSlugs } =
        resolveFilterState(filters, categories, tags);
    const filteredPosts = await cachedPublishedPosts({
        categorySlug: activeCategorySlug,
        tagSlugs: activeTagSlugs,
    });
    const { currentPage, totalPages } = computePagination(filteredPosts.length, filters.currentPage);
    const pagedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const { categoryOptions, tagOptions } = buildFilterOptions({
        activeCategorySlug,
        activeTagSlugs,
        categories,
        tags,
    });

    /*-- 结构化数据 --*/
    const pageUrl = buildBlogUrl({
        categorySlug: activeCategorySlug,
        page: currentPage,
        siteUrl: true,
        tagSlugs: activeTagSlugs,
    });
    const pageName = buildPageTitle(activeCategorySlug, activeCategoryLabel, activeTagNames, currentPage);
    const listStartIndex = (currentPage - 1) * PAGE_SIZE;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${pageUrl}#page`,
                url: pageUrl,
                name: pageName,
                description: SITE_METADATA.blogDescription,
                inLanguage: 'zh-CN',
            },
            {
                '@type': 'ItemList',
                '@id': `${pageUrl}#list`,
                name: `${SITE_METADATA.blogTitle}列表`,
                itemListOrder: 'https://schema.org/ItemListOrderDescending',
                numberOfItems: pagedPosts.length,
                itemListElement: pagedPosts.map((post, index) => ({
                    '@type': 'ListItem',
                    position: listStartIndex + index + 1,
                    url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
                    name: post.title,
                    description: post.summary,
                })),
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ListClient
                activeCategorySlug={activeCategorySlug || undefined}
                activeFilterChips={activeFilterChips}
                activeTagSlugs={activeTagSlugs}
                categoryOptions={categoryOptions}
                currentPage={currentPage}
                posts={pagedPosts}
                tagOptions={tagOptions}
                totalPages={totalPages}
            />
        </>
    );
}
