/*== 组件导入 ==*/
import { ContentImage } from '@/components/site/content-image';
import { PostCard } from '@/components/modules/home/post-card';
import { SectionHeading } from '@/components/site/section-heading';
import { TextLink } from '@/components/ui/text-link';

/*== 数据与配置 ==*/
import { formatPostDate } from '@/lib/domain/posts';
import type { Post } from '@/lib/domain/posts';

/*== 样式导入 ==*/
import styles from './posts-section.module.css';

/*== 类型定义 ==*/
interface PostsSectionProps {
    posts: Post[];
}

export function PostsSection({ posts }: PostsSectionProps) {
    return (
        <section className={styles.section}>
            <SectionHeading action={<TextLink href="/blog">查看全部</TextLink>}>最新文章</SectionHeading>

            <div className={styles.grid}>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            tag={post.categoryName ?? undefined}
                            tagVariant="primary"
                            date={formatPostDate(post.updatedAt || post.publishedAt)}
                            title={post.title}
                            summary={post.summary}
                            href={`/blog/${post.slug}`}
                            visual={
                                post.coverImage ? (
                                    <ContentImage
                                        alt={post.altText || post.title}
                                        sizes="(min-width: 1024px) 22rem, 100vw"
                                        src={post.coverImage}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : undefined
                            }
                        />
                    ))
                ) : (
                    <p className={styles.empty}>暂无文章。</p>
                )}
            </div>
        </section>
    );
}
