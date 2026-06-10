'use client';

import { MarkdownArticle } from '@/components/site/markdown-article';
import { formatPostDate } from '@/lib/post-shared';

import styles from './markdown-preview.module.css';

export interface MarkdownPreviewProps {
    content: string;
    title?: string;
    coverImage?: string | null;
    altText?: string | null;
    categoryName?: string | null;
    tagNames?: string[];
    publishedAt?: string | null;
}

/*== MarkdownPreview 实时预览区 ==*/
export function MarkdownPreview({
    content,
    title,
    coverImage,
    altText,
    categoryName,
    tagNames,
    publishedAt,
}: MarkdownPreviewProps) {
    const hasHeader = title || coverImage || categoryName || (tagNames && tagNames.length > 0) || publishedAt;

    return (
        <div className={styles.preview}>
            {hasHeader && (
                <div className={styles.previewHeader}>
                    {coverImage && (
                        <img
                            alt={altText || title || '封面图'}
                            className={styles.coverImage}
                            src={coverImage}
                        />
                    )}
                    {title && <h1 className={styles.previewTitle}>{title}</h1>}
                    <div className={styles.previewMeta}>
                        {categoryName && (
                            <span className={styles.previewCategory}>{categoryName}</span>
                        )}
                        {tagNames?.map((name) => (
                            <span className={styles.previewTag} key={name}>{name}</span>
                        ))}
                        {publishedAt && (
                            <span className={styles.previewDate}>
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
