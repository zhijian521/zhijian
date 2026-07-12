/*============================================================================
  post-card — 文章卡片

  首页与列表页复用。有封面图时展示图片 + 渐变蒙层，
  内容区含标题、分类 Tag、日期、摘要与"阅读更多"链接。
============================================================================*/

/*== 组件导入 ==*/
import { ContentImage } from '@/components/site/content-image';
import { Show } from '@/components/ui/show';
import { Tag } from '@/components/ui/tag';
import { TextLink } from '@/components/ui/text-link';

/*== 数据与配置 ==*/
import { cn } from '@/lib/core/utils';
import { formatPostDate } from '@/lib/domain/posts';
import type { Post } from '@/lib/domain/posts';

/*== 样式导入 ==*/
import styles from './post-card.module.css';

export interface PostCardProps {
    /*-- 文章数据 --*/
    post: Post;
    /*-- 标签变体 --*/
    tagVariant?: 'default' | 'primary';
}

/*== PostCard 文章卡片 — 有封面图时展示图片+渐变，内容区统一样式 ==*/
export function PostCard({ post, tagVariant = 'default' }: PostCardProps) {
    const hasVisual = !!post.coverImage;

    return (
        <article className={styles.card}>
            {/*文章封面图*/}
            <Show when={hasVisual}>
                    <div className={styles.visualImage}>
                        <ContentImage
                            alt={post.altText || post.title}
                            sizes="(min-width: 1024px) 22rem, 100vw"
                            src={post.coverImage!}
                        />
                    </div>
                    <div className={styles.visualGradient} />
                </Show>
            {/*文章简要*/}
            <div className={cn(styles.body, hasVisual && styles.hasVisual)}>
                <div className={styles.bodyContent}>
                    <h3 className={styles.title}>{post.title}</h3>
                    <div className={styles.metaRow}>
                        <Show when={post.categoryName}>
                            <Tag variant={tagVariant} size="mini">
                                {post.categoryName}
                            </Tag>
                        </Show>
                        <span className={styles.date}>{formatPostDate(post.updatedAt || post.publishedAt)}</span>
                    </div>
                    <Show when={post.summary}>
                        <p className={styles.summary}>{post.summary}</p>
                    </Show>
                </div>
            </div>
            {/*查看按钮*/}
            <div className={styles.linkWrap}>
                <TextLink href={`/blog/${post.slug}`}>阅读更多</TextLink>
            </div>
        </article>
    );
}
