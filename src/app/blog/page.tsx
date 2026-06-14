import type { Metadata } from 'next';
import { Suspense } from 'react';

import { listCategories } from '@/lib/categories';
import { getPublishedPosts } from '@/lib/posts';
import { SITE_METADATA } from '@/lib/site';
import { listTags } from '@/lib/tags';

import BlogListClient from './_components/blog-list-client';
import styles from './page.module.css';

const BLOG_DESCRIPTION = SITE_METADATA.blogDescription;
const PAGE_SIZE = 10;
const ALL_CATEGORY_SLUG = '';

interface BlogPageProps {
    searchParams: Promise<{ category?: string; page?: string; tags?: string }>;
}

interface BlogFilters {
    categorySlug?: string;
    currentPage: number;
    tagSlugs: string[];
}

interface FilterOption {
    label: string;
    slug: string;
}

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

    return [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))];
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

function buildBlogUrl(filters: {
    categorySlug?: string;
    page?: number;
    siteUrl?: boolean;
    tagSlugs?: string[];
}): string {
    const params = new URLSearchParams();

    if (filters.categorySlug) {
        params.set('category', filters.categorySlug);
    }

    if (filters.tagSlugs && filters.tagSlugs.length > 0) {
        params.set('tags', filters.tagSlugs.join(','));
    }

    if (filters.page && filters.page > 1) {
        params.set('page', String(filters.page));
    }

    const query = params.toString();
    const path = query ? `/blog?${query}` : '/blog';

    return filters.siteUrl ? `${SITE_METADATA.siteUrl}${path}` : path;
}

function resolveFilterState(filters: BlogFilters, categories: Awaited<ReturnType<typeof listCategories>>, tags: Awaited<ReturnType<typeof listTags>>) {
    const categoryMap = new Map(categories.map((category) => [category.slug, category]));
    const tagMap = new Map(tags.map((tag) => [tag.slug, tag]));

    const activeCategorySlug = filters.categorySlug && categoryMap.has(filters.categorySlug)
        ? filters.categorySlug
        : undefined;
    const activeCategoryLabel = activeCategorySlug
        ? categoryMap.get(activeCategorySlug)!.name
        : '全部';
    const activeTagSlugs = filters.tagSlugs.filter((tagSlug) => tagMap.has(tagSlug));
    const activeTagNames = activeTagSlugs.map((tagSlug) => tagMap.get(tagSlug)!.name);

    return {
        activeCategoryLabel,
        activeCategorySlug,
        activeTagNames,
        activeTagSlugs,
    };
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
    const [filters, categories, tags] = await Promise.all([
        resolveBlogFilters(searchParams),
        listCategories(),
        listTags(),
    ]);
    const {
        activeCategoryLabel,
        activeCategorySlug,
        activeTagNames,
        activeTagSlugs,
    } = resolveFilterState(filters, categories, tags);
    const posts = await getPublishedPosts({
        categorySlug: activeCategorySlug,
        tagSlugs: activeTagSlugs,
    });
    const hasFilterState = Boolean(activeCategorySlug) || activeTagSlugs.length > 0;
    const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
    const currentPage = Math.min(filters.currentPage, totalPages);
    const canonical = buildBlogUrl({
        categorySlug: activeCategorySlug,
        page: currentPage,
        siteUrl: true,
        tagSlugs: activeTagSlugs,
    });
    const titleSegments = [
        SITE_METADATA.blogTitle,
        ...(activeCategorySlug ? [activeCategoryLabel] : []),
        ...(activeTagNames.length > 0 ? [activeTagNames.join(' / ')] : []),
        ...(currentPage > 1 ? [`第 ${currentPage} 页`] : []),
    ];
    const descriptionSegments: string[] = [BLOG_DESCRIPTION];

    if (activeCategorySlug) {
        descriptionSegments.push(`当前分类：${activeCategoryLabel}。`);
    }

    if (activeTagNames.length > 0) {
        descriptionSegments.push(`当前标签：${activeTagNames.join('、')}。`);
    }

    if (currentPage > 1) {
        descriptionSegments.push(`当前为第 ${currentPage} 页。`);
    }

    return {
        title: `${titleSegments.join(' - ')} - ${SITE_METADATA.title}`,
        description: descriptionSegments.join(' '),
        keywords: [
            ...activeTagNames,
            ...(activeCategorySlug ? [activeCategoryLabel] : []),
            ...SITE_METADATA.keywords,
        ],
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
            title: titleSegments.join(' - '),
            description: descriptionSegments.join(' '),
            url: canonical,
            images: [{ url: SITE_METADATA.ogImage, alt: SITE_METADATA.blogTitle }],
        },
        twitter: {
            card: 'summary_large_image',
            title: titleSegments.join(' - '),
            description: descriptionSegments.join(' '),
            images: [SITE_METADATA.ogImage],
        },
    };
}

export const dynamic = 'force-dynamic';

export default async function BlogListPage({ searchParams }: BlogPageProps) {
    const [filters, categories, tags] = await Promise.all([
        resolveBlogFilters(searchParams),
        listCategories(),
        listTags(),
    ]);
    const {
        activeCategoryLabel,
        activeCategorySlug,
        activeTagNames,
        activeTagSlugs,
    } = resolveFilterState(filters, categories, tags);
    const filteredPosts = await getPublishedPosts({
        categorySlug: activeCategorySlug,
        tagSlugs: activeTagSlugs,
    });
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
    const currentPage = Math.min(filters.currentPage, totalPages);
    const pagedPosts = filteredPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const pageUrl = buildBlogUrl({
        categorySlug: activeCategorySlug,
        page: currentPage,
        siteUrl: true,
        tagSlugs: activeTagSlugs,
    });
    const categoryOptions: FilterOption[] = [
        { label: '全部', slug: ALL_CATEGORY_SLUG },
        ...categories.map((category) => ({
            label: category.name,
            slug: category.slug,
        })),
    ];
    const tagOptions: FilterOption[] = tags.map((tag) => ({
        label: tag.name,
        slug: tag.slug,
    }));
    const listStartIndex = (currentPage - 1) * PAGE_SIZE;
    const pageName = [
        SITE_METADATA.blogTitle,
        ...(activeCategorySlug ? [activeCategoryLabel] : []),
        ...(activeTagNames.length > 0 ? [activeTagNames.join(' / ')] : []),
        ...(currentPage > 1 ? [`第 ${currentPage} 页`] : []),
    ].join(' - ');
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${pageUrl}#page`,
                url: pageUrl,
                name: pageName,
                description: BLOG_DESCRIPTION,
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
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense
                fallback={(
                    <main className={styles.page}>
                        <p style={{ color: 'var(--muted-foreground)', padding: '2rem 0', fontSize: '0.9375rem' }}>
                            加载中...
                        </p>
                    </main>
                )}
            >
                <BlogListClient
                    activeCategorySlug={activeCategorySlug ?? ALL_CATEGORY_SLUG}
                    activeTagSlugs={activeTagSlugs}
                    categoryOptions={categoryOptions}
                    currentPage={currentPage}
                    posts={pagedPosts}
                    tagOptions={tagOptions}
                    totalPages={totalPages}
                />
            </Suspense>
        </>
    );
}
