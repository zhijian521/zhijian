'use client';

/*============================================================================
  list-client — 博客列表页客户端容器

  组合 Header、FilterSidebar、FilterDialog、PostItem、Pagination。
  通过 useTransition 管理筛选导航的加载状态。
============================================================================*/

/*== 依赖导入 ==*/
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/*== 组件导入 ==*/
import { FilterDialog } from '@/components/modules/blog/filter-dialog';
import { FilterSidebar } from '@/components/modules/blog/filter-sidebar';
import { Header } from '@/components/modules/blog/header';
import { PostItem } from '@/components/modules/blog/post-item';
import { Pagination } from '@/components/ui/pagination';
import { Show } from '@/components/ui/show';

/*== 数据与配置 ==*/
import type { ActiveFilterChip } from '@/components/modules/blog/header';
import type { FilterOption } from '@/components/modules/blog/filter-sidebar';
import type { PostListItem } from '@/components/modules/blog/post-item';
import { buildBlogUrl } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './list-client.module.css';

/*== 类型定义 ==*/
interface ListClientProps {
    /*-- 当前激活的分类 slug --*/
    activeCategorySlug?: string;
    /*-- 当前激活的筛选标签列表 --*/
    activeFilterChips: ActiveFilterChip[];
    /*-- 当前激活的标签 slug 列表 --*/
    activeTagSlugs: string[];
    /*-- 可选分类列表 --*/
    categoryOptions: FilterOption[];
    /*-- 当前页码 --*/
    currentPage: number;
    /*-- 文章列表数据 --*/
    posts: PostListItem[];
    /*-- 可选标签列表 --*/
    tagOptions: FilterOption[];
    /*-- 总页数 --*/
    totalPages: number;
}

/*== ListClient 博客列表页客户端容器 — 组合头部、筛选、列表、分页 ==*/
export default function ListClient({
    activeCategorySlug,
    activeFilterChips,
    activeTagSlugs,
    categoryOptions,
    currentPage,
    posts,
    tagOptions,
    totalPages,
}: ListClientProps) {
    const [filterOpen, setFilterOpen] = useState(false);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const hasFilters = categoryOptions.length > 1 || tagOptions.length > 0;

    /*-- 导航到新筛选 URL，带 transition 追踪 --*/
    function navigateTo(url: string) {
        startTransition(() => {
            router.push(url);
        });
    }

    /*-- 惰性生成分页 URL，避免预构建所有页码 --*/
    function getPaginationHref(page: number) {
        return buildBlogUrl({
            categorySlug: activeCategorySlug,
            page,
            tagSlugs: activeTagSlugs,
        });
    }

    return (
        <main className={styles.page}>
            <div className="bg-overlay" />
            {/* 导航加载遮罩 */}
            <Show when={isPending}>
                <div className={styles.loadingOverlay} role="status" aria-live="polite">
                    <div className={styles.loadingBar} />
                </div>
            </Show>

            <div className={styles.pageContent}>
                {/* 页头：标题 + 筛选标签 */}
                <Header
                    activeFilterChips={activeFilterChips}
                    hasFilters={hasFilters}
                    onNavigate={navigateTo}
                    onOpenFilter={() => setFilterOpen(true)}
                />

                {/* 移动端筛选弹窗 */}
                <FilterDialog
                    activeCategorySlug={activeCategorySlug}
                    activeTagSlugs={activeTagSlugs}
                    categoryOptions={categoryOptions}
                    onClose={() => setFilterOpen(false)}
                    onSelect={(url) => {
                        setFilterOpen(false);
                        navigateTo(url);
                    }}
                    open={filterOpen}
                    tagOptions={tagOptions}
                />

                {/* 主布局：列表 + 侧边栏 */}
                <div className={styles.layout}>
                    <section className={styles.main}>
                        {/* 文章列表 */}
                        <div className={styles.list}>
                            <Show when={posts.length > 0} fallback={<p className={styles.empty}>没有匹配的文章。</p>}>
                                {posts.map((post) => (
                                    <PostItem key={post.id} post={post} />
                                ))}
                            </Show>
                        </div>

                        {/* 分页 */}
                        <Show when={totalPages > 1}>
                            <Pagination current={currentPage} getHref={getPaginationHref} total={totalPages} />
                        </Show>
                    </section>

                    {/* 桌面端筛选侧边栏 */}
                    <FilterSidebar
                        activeCategorySlug={activeCategorySlug}
                        activeTagSlugs={activeTagSlugs}
                        categoryOptions={categoryOptions}
                        onNavigate={navigateTo}
                        tagOptions={tagOptions}
                    />
                </div>
            </div>
        </main>
    );
}
