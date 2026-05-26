import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPostDate } from '@/lib/post-shared';
import { getPublishedPosts } from '@/lib/posts';
import styles from './page.module.css';

/*== 博客列表页：展示精选文章与全部已发布文章，按发布时间降序。 ==*/
export default async function BlogListPage() {
    const posts = await getPublishedPosts();
    const featuredPost = posts[0] ?? null;
    const secondaryPosts = posts.slice(1, 3);
    const concludingPost = posts[2] ?? posts[0] ?? null;

    return (
        <main className={styles.page}>
            <header className={styles.pageHeader}>
                <div className={styles.headerAccent} />
                <h1 className={styles.headerTitle}>文章与感悟</h1>
                <p className={styles.headerDesc}>在繁杂中寻找秩序，于微末处体悟哲思。探索极简设计、哲学思辨与自然生活的美学交汇。</p>
            </header>

            <div className={styles.layout}>
                <section className={styles.mainColumn}>
                    {featuredPost ? (
                        <article className={styles.featuredCard}>
                            <div className={styles.featuredMedia}>
                                <div className={styles.featuredMediaOverlay} />
                                <div className={styles.featuredMediaLine} />
                                <div className={styles.featuredMediaDot} />
                            </div>
                            <div className={styles.featuredBody}>
                                <div className={styles.featuredMeta}>
                                    <span className={styles.featuredCategory}>设计思考</span>
                                    <span className={styles.featuredMetaDivider}>{formatPostDate(featuredPost.publishedAt)}</span>
                                </div>
                                <h2 className={styles.featuredTitle}>留白的力量：在界面设计中寻找呼吸感</h2>
                                <p className={styles.featuredSummary}>
                                    探讨如何在现代数字产品中运用中国传统水墨画中的留白哲学，通过减少视觉噪音来增强用户的专注力与内心的平静。
                                </p>
                                <Link className={styles.featuredLink} href={`/blog/${featuredPost.slug}`}>
                                    阅读全文
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </article>
                    ) : null}

                    <div className={styles.postsGrid}>
                        {secondaryPosts.map((post, index) => (
                            <article className={styles.secondaryCard} key={post.id}>
                                <div className={index === 0 ? styles.secondaryMediaA : styles.secondaryMediaB}>
                                    {index === 0 ? <div className={styles.secondaryMediaOverlayA} /> : null}
                                    {index === 1 ? <div className={styles.secondaryMediaOverlayB} /> : null}
                                </div>
                                <div className={styles.secondaryMeta}>
                                    <span className={styles.secondaryCategory}>{index === 0 ? '极简主义' : '哲学'}</span>
                                    <span>{formatPostDate(post.publishedAt)}</span>
                                </div>
                                <h3 className={styles.secondaryTitle}>{index === 0 ? '物质的减法与精神的加法' : '无用之用：庄子思想在现代生活中的映射'}</h3>
                                <p className={styles.secondarySummary}>{post.summary}</p>
                            </article>
                        ))}

                        {concludingPost ? (
                            <article className={styles.concludingCard}>
                                <div className={styles.concludingMeta}>
                                    <span className={styles.concludingCategory}>自然</span>
                                    <span>{formatPostDate(concludingPost.publishedAt)}</span>
                                </div>
                                <h3 className={styles.concludingTitle}>四季的韵律：观察一棵树的生长历程</h3>
                                <p className={styles.concludingSummary}>
                                    自然界从不匆忙，却能完成一切。通过长达一年的定点观察，记录一棵银杏树从抽芽、繁茂、金黄到落叶的全过程，体悟时间的流转与生命的韧性。
                                </p>
                            </article>
                        ) : null}
                    </div>

                    <div className={styles.loadMore}>
                        <Button className={styles.loadMoreButton} type="button" variant="outline">
                            加载更多
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </section>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarHeading}>
                            <span className={styles.sidebarHeadingBar} />
                            话题
                        </h3>
                        <ul className={styles.topicList}>
                            {[
                                ['极简主义', '12'],
                                ['哲学', '8'],
                                ['设计思考', '24'],
                                ['自然', '15'],
                            ].map(([label, count]) => (
                                <li className={styles.topicItem} key={label}>
                                    <Link className={styles.topicLink} href="/blog">
                                        <span className={styles.topicLabel}>{label}</span>
                                        <span className={styles.topicCount}>{count}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarHeading}>
                            <span className={styles.sidebarHeadingBar} />
                            标签
                        </h3>
                        <div className={styles.tagList}>
                            {['茶道', '生活美学', '冥想', '哲思', '自然观察', 'UI/UX'].map((tag) => (
                                <span className={styles.tag} key={tag}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
