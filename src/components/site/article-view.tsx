import { MarkdownArticle } from '@/components/site/markdown-article';
import { formatPostDate } from '@/lib/post-shared';

import styles from './article-view.module.css';

export interface ArticleViewProps {
    content: string;
    title?: string;
    summary?: string;
    coverImage?: string | null;
    altText?: string | null;
    categoryName?: string | null;
    tagNames?: { id: number; name: string; slug: string }[] | string[];
    publishedAt?: string | null;
}

/*== ArticleView 文章展示组件 — 编辑器预览 + 前台详情页共用 ==*/
export function ArticleView({
    content,
    title,
    summary,
    coverImage,
    altText,
    categoryName,
    tagNames,
    publishedAt,
}: ArticleViewProps) {
    const hasHeader = title || summary || coverImage || categoryName || (tagNames && tagNames.length > 0) || publishedAt;

    /* 兼容 tagNames 两种格式：对象数组（来自 Post）和字符串数组（编辑器预览） */
    const tagLabels = tagNames?.map((t) => typeof t === 'string' ? t : t.name) ?? [];

    return (
        <div className={styles.article}>
            {hasHeader && (
                <div className={styles.header}>
                    {coverImage && (
                        <img
                            alt={altText || title || '封面图'}
                            className={styles.coverImage}
                            src={coverImage}
                        />
                    )}
                    {title && <h1 className={styles.headerTitle}>{title}</h1>}
                    {summary && <p className={styles.headerSummary}>{summary}</p>}
                    <div className={styles.headerMeta}>
                        {categoryName && (
                            <span className={styles.category}>{categoryName}</span>
                        )}
                        {tagLabels.map((name) => (
                            <span className={styles.tag} key={name}>{name}</span>
                        ))}
                        {publishedAt && (
                            <span className={styles.date}>
                                {formatPostDate(publishedAt)}
                            </span>
                        )}
                    </div>
                </div>
            )}
            <MarkdownArticle content={content} />
        </div>
    );
}
