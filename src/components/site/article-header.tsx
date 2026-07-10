/*============================================================================
  article-header — 文章头部信息

  含封面图、标题、摘要、分类标签、发布日期。
============================================================================*/

/*== 组件导入 ==*/
import { ContentImage } from '@/components/site/content-image';
import { Show } from '@/components/ui/show';
import { Tag } from '@/components/ui/tag';

/*== 数据与配置 ==*/
import type { Post } from '@/lib/domain/post-shared';
import { formatPostDate } from '@/lib/domain/post-shared';

/*== 样式导入 ==*/
import styles from './article-header.module.css';

/*== 类型定义 ==*/
export interface ArticleHeaderProps {
    post: Post;
}

/*== ArticleHeader 文章头部 — 封面图 + 标题 + 摘要 + 元信息 ==*/
export function ArticleHeader({ post }: ArticleHeaderProps) {
    const tagLabels = post.tagNames?.map((tag) => tag.name) ?? [];
    const hasHeader = !!(
        post.title ||
        post.summary ||
        post.coverImage ||
        post.categoryName ||
        tagLabels.length > 0 ||
        post.publishedAt
    );

    return (
        <Show when={hasHeader}>
            <div className={styles.header}>
                <Show when={post.coverImage}>
                    <ContentImage
                        alt={post.altText || post.title || '封面图'}
                        className={styles.coverImage}
                        sizes="(min-width: 896px) 56rem, 100vw"
                        src={post.coverImage!}
                    />
                </Show>
                <Show when={post.title}>
                    <h1 className={styles.title}>{post.title}</h1>
                </Show>
                <Show when={post.summary}>
                    <p className={styles.summary}>{post.summary}</p>
                </Show>
                <Show when={post.categoryName || tagLabels.length > 0 || post.publishedAt}>
                    <div className={styles.meta}>
                        <Show when={post.categoryName}>
                            <Tag size="mini" variant="primary">
                                {post.categoryName}
                            </Tag>
                        </Show>
                        {tagLabels.map((name) => (
                            <Tag key={name} size="mini" variant="outlined">
                                {name}
                            </Tag>
                        ))}
                        <Show when={post.publishedAt}>
                            <span className={styles.date}>{formatPostDate(post.publishedAt!)}</span>
                        </Show>
                    </div>
                </Show>
            </div>
        </Show>
    );
}
