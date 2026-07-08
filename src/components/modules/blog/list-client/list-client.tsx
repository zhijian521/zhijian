'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/*== 组件导入 ==*/
import { EmptyState } from '@/components/modules/blog/empty-state/empty-state';
import { FilterDialog } from '@/components/modules/blog/filter-dialog/filter-dialog';
import { FilterSidebar } from '@/components/modules/blog/filter-sidebar/filter-sidebar';
import { Header } from '@/components/modules/blog/header/header';
import { PostItem } from '@/components/modules/blog/post-item/post-item';
import { Pagination } from '@/components/ui/pagination';

/*== 数据与配置 ==*/
import type { ActiveFilterChip } from '@/components/modules/blog/header/header';
import type { FilterOption } from '@/components/modules/blog/filter-sidebar/filter-sidebar';
import type { Post } from '@/lib/domain/post-shared';
import { buildBlogUrl } from '@/lib/core/utils';

/*== 样式导入 ==*/
import styles from './list-client.module.css';

/*== 类型定义 ==*/
interface ListClientProps {
    activeCategorySlug?: string;
    activeFilterChips: ActiveFilterChip[];
    activeTagSlugs: string[];
    categoryOptions: FilterOption[];
    currentPage: number;
    posts: Post[];
    tagOptions: FilterOption[];
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
            {isPending ? (
                <div className={styles.loadingOverlay} role="status" aria-live="polite">
                    <div className={styles.loadingBar} />
                </div>
            ) : null}

            <div className={styles.pageContent}>
                <Header
                    activeFilterChips={activeFilterChips}
                    hasFilters={hasFilters}
                    onNavigate={navigateTo}
                    onOpenFilter={() => setFilterOpen(true)}
                />

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

                <div className={styles.layout}>
                    <section className={styles.main}>
                        <div className={styles.list}>
                            {posts.length > 0 ? (
                                posts.map((post) => <PostItem key={post.id} post={post} />)
                            ) : (
                                <EmptyState />
                            )}
                        </div>

                        {totalPages > 1 ? (
                            <Pagination
                                current={currentPage}
                                getHref={getPaginationHref}
                                total={totalPages}
                            />
                        ) : null}
                    </section>

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
