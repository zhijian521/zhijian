'use client';

import { ArticleView } from '@/components/site/article-view';

import styles from './markdown-preview.module.css';

export interface MarkdownPreviewProps {
    content: string;
    title?: string;
    summary?: string;
    coverImage?: string | null;
    altText?: string | null;
    categoryName?: string | null;
    tagNames?: string[];
    publishedAt?: string | null;
}

/*== MarkdownPreview 编辑器实时预览区 — 复用 ArticleView 组件 ==*/
export function MarkdownPreview({ content, title, summary, coverImage, altText, categoryName, tagNames, publishedAt }: MarkdownPreviewProps) {
    return (
        <div className={styles.preview}>
            <ArticleView altText={altText} categoryName={categoryName} content={content} coverImage={coverImage} publishedAt={publishedAt} summary={summary} tagNames={tagNames} title={title} />
        </div>
    );
}
