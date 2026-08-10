import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { buildBlogFilterOptions, getBlogHref, getTagSlugs } from "@/features/blog/lib/filters";
import { buildBlogJsonLd, buildBlogMetadata } from "@/features/blog/lib/list-metadata";
import { getBlogListPageData } from "@/features/blog/lib/list-page-data";
import { parseBlogSearchParams, type BlogSearchParams } from "@/features/blog/lib/query";

import { ButtonLink } from "@/components/ui/button-link";
import { Pagination } from "@/components/ui/pagination";
import { StatusPage } from "@/components/ui/status-page";
import { StatusSection } from "@/components/ui/status-section";
import { BlogFilters } from "@/features/blog/ui/blog-filters";
import { PostList } from "@/features/blog/ui/post-list";

import styles from "./page.module.css";

interface BlogPageProps {
    searchParams: Promise<BlogSearchParams>;
}

/*== 分页与筛选均依赖 URL 参数，数据读取与缓存由博客 feature 和领域层管理 ==*/
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
    const query = parseBlogSearchParams(await searchParams);
    const pageData = await getBlogListPageData(query);

    return buildBlogMetadata(pageData);
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
    const query = parseBlogSearchParams(await searchParams);
    const blogData = await getBlogListPageData(query);

    if (!blogData) {
        return (
            <StatusPage className={styles.page} contentClassName={styles.container} description="文章暂时无法加载，请稍后再试。" title="文章">
                <ButtonLink href="/">返回首页</ButtonLink>
            </StatusPage>
        );
    }

    const { filterOptions, filters, pageData } = blogData;
    const tagSlugs = getTagSlugs(filters);

    function getPageHref(page: number) {
        return getBlogHref({ categorySlug: filters.category?.slug, page, tagSlugs });
    }

    /*== 保留有效筛选条件并回到最后一页，避免超页链接渲染为空列表 ==*/
    if (pageData.totalPages > 0 && pageData.page > pageData.totalPages) {
        redirect(getPageHref(pageData.totalPages));
    }

    /*== 当前筛选分页状态 ==*/
    const currentPage = pageData.totalPages > 0 ? pageData.page : 1;
    const { categories, tags } = buildBlogFilterOptions(filters, filterOptions);
    const hasActiveFilters = Boolean(filters.category) || tagSlugs.length > 0;
    const hasFilters = categories.length > 1 || tags.length > 0;
    const blogJsonLd = buildBlogJsonLd({ filters, pageData });

    return (
        <main className={styles.page}>
            {/*== 结构化数据 ==*/}
            <script dangerouslySetInnerHTML={{ __html: blogJsonLd }} type="application/ld+json" />

            <div className={styles.container}>
                <div className={hasFilters ? styles.layout : styles.layoutWithoutFilters}>
                    {/*== 文章筛选 ==*/}
                    {hasFilters ? <BlogFilters categories={categories} tags={tags} /> : null}

                    {/*== 文章内容 ==*/}
                    <div className={styles.contentColumn}>
                        <h1 className={styles.title}>文章</h1>
                        {pageData.posts.length > 0 ? (
                            <PostList posts={pageData.posts} />
                        ) : (
                            <StatusSection
                                align="center"
                                description={hasActiveFilters ? "没有符合当前筛选条件的文章。" : "新的文章会在这里发布。"}
                                title="暂无文章"
                            />
                        )}
                        <Pagination ariaLabel="文章分页" current={currentPage} getHref={getPageHref} total={pageData.totalPages} />
                    </div>
                </div>
            </div>
        </main>
    );
}
