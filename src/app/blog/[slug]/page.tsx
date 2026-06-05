import { notFound } from 'next/navigation';

import { Tag } from '@/components/ui/tag';
import { GhostButton } from '@/components/ui/ghost-button';
import { MarkdownArticle } from '@/components/site/markdown-article';
import { getStaticPostSlugs, getStaticPostMeta, getStaticPostContent } from '@/lib/static-posts';

import styles from './page.module.css';

/*== 生成静态路径 ==*/
export function generateStaticParams() {
    return getStaticPostSlugs().map((slug) => ({ slug }));
}

/*== 博客详情页：纯静态，从 MD 文件读取正文 ==*/
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const meta = getStaticPostMeta(slug);
    const content = await getStaticPostContent(slug);

    if (!meta || !content) {
        notFound();
    }

    return (
        <main className={styles.page}>
            <article className={styles.article}>
                {/* 文章头部 */}
                <header className={styles.header}>
                    <div className={styles.metaRow}>
                        <Tag variant="accent">{meta.category}</Tag>
                        <span className={styles.metaDot}>·</span>
                        <span>{meta.date}</span>
                    </div>
                    <h1 className={styles.title}>{meta.title}</h1>
                    <p className={styles.subtitle}>{meta.subtitle}</p>
                    <div className={styles.authorRow}>
                        <div className={styles.avatar}>简</div>
                        <div>
                            <div className={styles.authorName}>Zhi Jian</div>
                            <div className={styles.authorDate}>前端开发 · 简约设计</div>
                        </div>
                    </div>
                </header>

                {/* 封面视觉 */}
                <div className={styles.cover}>
                    <div className={styles.coverCenter} />
                    <div className={styles.coverLine} />
                    <div className={styles.coverRing} style={{ width: '12rem', height: '12rem' }} />
                    <div className={styles.coverRing2} style={{ width: '18rem', height: '18rem' }} />
                    <div className={styles.coverRing3} style={{ width: '24rem', height: '24rem' }} />
                </div>

                {/* 正文：MarkdownArticle 统一渲染 */}
                <MarkdownArticle content={content} />

                {/* 文章底部 */}
                <footer className={styles.footer}>
                    <div className={styles.footerTags}>
                        {meta.tags.map((tag) => (
                            <Tag key={tag} variant="outlined">{tag}</Tag>
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