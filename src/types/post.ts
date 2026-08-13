/*============================================================================
  post - 文章预览类型

  首页、文章列表与对应公开接口共用的最小数据结构。
============================================================================*/

export interface PostPreview {
    slug: string;
    title: string;
    summary: string | null;
    categoryName: string | null;
    publishedAt: string | null;
    updatedAt: string | null;
    coverImage: string | null;
    altText: string | null;
}

/*== 分页列表额外携带标签，首页最新文章仍保持最小数据量。 ==*/
export interface PublishedPostPreview extends PostPreview {
    tags: PostFilterOption[];
}

/*== 文章详情页与后台预览共用的公开文章内容。 ==*/
export interface PublishedPostDetail extends PublishedPostPreview {
    content: string;
    categorySlug: string | null;
}

/*== RSS 与 Sitemap 共用的已发布文章分发字段 ==*/
export interface PublishedPostDistribution {
    slug: string;
    title: string;
    summary: string | null;
    publishedAt: string | null;
    updatedAt: string | null;
    tags: PostFilterOption[];
}

export interface PostFilterOption {
    name: string;
    slug: string;
}

export interface PublishedPostFilters {
    categories: PostFilterOption[];
    tags: PostFilterOption[];
}

export interface PublishedPostsPageQuery {
    categorySlug?: string;
    page?: number;
    pageSize?: number;
    tagSlugs?: string[];
}

export interface NormalizedPublishedPostsPageQuery {
    categorySlug?: string;
    page: number;
    pageSize: number;
    tagSlugs: string[];
}

export interface PublishedPostsPage {
    posts: PublishedPostPreview[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
