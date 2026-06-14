import { ContentImage } from '@/components/site/content-image';
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

/*== ArticleView 文章展示组件：编辑器预览与前台详情页共用。 ==*/
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
    const tagLabels = tagNames?.map((tag) => typeof tag === 'string' ? tag : tag.name) ?? [];

    return (
        <div className={styles.article}>
            {hasHeader ? (
                <div className={styles.header}>
                    {coverImage ? (
                        <ContentImage
                            alt={altText || title || '封面图'}
                            className={styles.coverImage}
                            sizes='(min-width: 896px) 56rem, 100vw'
                            src={coverImage}
                        />
                    ) : null}
                    {title ? <h1 className={styles.headerTitle}>{title}</h1> : null}
                    {summary ? <p className={styles.headerSummary}>{summary}</p> : null}
                    <div className={styles.headerMeta}>
                        {categoryName ? <span className={styles.category}>{categoryName}</span> : null}
                        {tagLabels.map((name) => (
                            <span className={styles.tag} key={name}>{name}</span>
                        ))}
                        {publishedAt ? (
                            <span className={styles.date}>
                                {formatPostDate(publishedAt)}
                            </span>
                        ) : null}
                    </div>
                </div>
            ) : null}
            <MarkdownArticle content={content} />
        </div>
    );
}
