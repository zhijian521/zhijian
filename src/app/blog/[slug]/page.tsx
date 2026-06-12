import { notFound } from 'next/navigation';

import { GhostButton } from '@/components/ui/ghost-button';
import { ArticleView } from '@/components/site/article-view';
import { getPostBySlug, getPublishedPosts } from '@/lib/posts';

import styles from './page.module.css';

/*== ISR：每 60 秒重新验证 ==*/
export const revalidate = 60;

/*== 生成静态路径（ISR 预渲染） ==*/
export async function generateStaticParams() {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({ slug: post.slug }));
}

/*== 博客详情页：从数据库读取文章，复用 ArticleView 组件 ==*/
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className={styles.page}>
            <article className={styles.article}>
                <ArticleView
                    altText={post.altText}
                    categoryName={post.categoryName}
                    content={post.content}
                    coverImage={post.coverImage}
                    publishedAt={post.publishedAt}
                    summary={post.summary}
                    tagNames={post.tagNames}
                    title={post.title}
                />

                {/* 文章底部 */}
                <footer className={styles.footer}>
                    <div className={styles.footerTags}>
                        {post.tagNames?.map((t) => (
                            <span className={styles.footerTag} key={t.id}>{t.name}</span>
                        ))}
                    </div>
                    <div className={styles.footerActions}>
                        <GhostButton href="/blog">
                            ← 返回列表
                        </GhostButton>
                    </div>
                </footer>
            </article>
        </main>
    );
}
