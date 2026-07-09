/*== 组件导入 ==*/
import { Show } from '@/components/ui/show';
import { TextLink } from '@/components/ui/text-link';
import { PostCard } from '@/components/modules/home/post-card';
import { SectionHeading } from '@/components/site/section-heading';

/*== 数据与配置 ==*/
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
                <Show when={posts.length > 0} fallback={<p className={styles.empty}>暂无文章。</p>}>
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} tagVariant="primary" />
                    ))}
                </Show>
            </div>
        </section>
    );
}
