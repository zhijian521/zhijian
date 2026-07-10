/*============================================================================
  related-posts — 博客相关文章推荐

  展示与当前文章标签匹配的相关文章卡片网格。
============================================================================*/

/*== 依赖导入 ==*/
import Link from 'next/link';

/*== 组件导入 ==*/
import { Show } from '@/components/ui/show';
import { Tag } from '@/components/ui/tag';

/*== 数据与配置 ==*/
import type { Post } from '@/lib/domain/post-shared';
import { formatPostDate } from '@/lib/domain/posts';

/*== 样式导入 ==*/
import styles from './related-posts.module.css';

/*== 类型定义 ==*/
interface RelatedPostsProps {
    posts: Pick<Post, 'slug' | 'title' | 'categoryName' | 'tagNames' | 'publishedAt'>[];
}

/*== RelatedPosts 相关文章推荐 — 卡片网格 ==*/
export function RelatedPosts({ posts }: RelatedPostsProps) {
    return (
        <section className={styles.related}>
            <h2 className={styles.title}>相关文章</h2>
            <div className={styles.grid}>
                {posts.map((post) => (
                    <Link className={styles.card} href={`/blog/${post.slug}`} key={post.slug}>
                        <h3 className={styles.cardTitle}>{post.title}</h3>
                        <Show when={post.tagNames && post.tagNames.length > 0}>
                            <div className={styles.cardTags}>
                                {post.tagNames!.slice(0, 3).map((tag) => (
                                    <Tag key={tag.id} size="mini" variant="outlined">
                                        {tag.name}
                                    </Tag>
                                ))}
                            </div>
                        </Show>
                        <div className={styles.cardMeta}>
                            <Show when={post.categoryName}>
                                <Tag size="mini" variant="primary">
                                    {post.categoryName}
                                </Tag>
                            </Show>
                            <Show when={post.publishedAt}>
                                <span>{formatPostDate(post.publishedAt!)}</span>
                            </Show>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
