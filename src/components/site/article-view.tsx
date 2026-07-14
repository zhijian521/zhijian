/*============================================================================
  article-view — 文章展示组件

  编辑器预览与前台详情页共用。
  含文章头部、Markdown 正文、更新日期。
============================================================================*/

/*== 组件导入 ==*/
import { ArticleFooter } from '@/components/site/article-footer';
import { ArticleHeader } from '@/components/site/article-header';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { MarkdownArticle } from '@/components/site/markdown-article';
import { Show } from '@/components/ui/show';

/*== 数据与配置 ==*/
import { cn } from '@/lib/core/utils';
import { SITE_METADATA } from '@/lib/core/site';
import { formatPostDate } from '@/lib/domain/post-shared';
import type { Post } from '@/lib/domain/post-shared';

/*== 样式导入 ==*/
import styles from './article-view.module.css';

/*== 类型定义 ==*/
export interface ArticleViewProps {
    /*-- 文章数据（详情页传入），预览场景可仅传 content --*/
    post?: Post;
    fullWidth?: boolean;
    /*-- 纯内容模式：仅渲染正文，不含头部 --*/
    content?: string;
}

interface ArticleDetailProps {
    post: Post;
}

/*== ArticleView 文章展示组件：编辑器预览与前台详情页共用 ==*/
export function ArticleView({ post, fullWidth = false, content }: ArticleViewProps) {
    const displayContent = post?.content || content || '';

    return (
        <div className={cn(styles.article, fullWidth && styles.articleWide)}>
            {/* 文章头部（仅详情页） */}
            <Show when={!!post}>
                <ArticleHeader post={post!} />
            </Show>

            {/* 文章正文 */}
            <MarkdownArticle content={displayContent} fullWidth={fullWidth} />

            {/* 更新日期（仅详情页） */}
            <Show when={post?.status === 'published' && post.updatedAt && post.updatedAt !== post.publishedAt}>
                <div className={styles.updatedDate}>最后更新于：{formatPostDate(post?.updatedAt ?? null)}</div>
            </Show>
        </div>
    );
}

/*== ArticleDetail 文章详情主体：面包屑、正文和底部操作的唯一组合入口。 ==*/
export function ArticleDetail({ post }: ArticleDetailProps) {
    return (
        <>
            <Breadcrumb
                items={[
                    { label: SITE_METADATA.title, href: '/' },
                    { label: '文章', href: '/blog' },
                    { label: post.title },
                ]}
            />
            <ArticleView post={post} />
            <ArticleFooter post={post} />
        </>
    );
}
