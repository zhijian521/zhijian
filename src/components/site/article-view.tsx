/*== 组件导入 ==*/
import { ContentImage } from '@/components/site/content-image';
import { MarkdownArticle } from '@/components/site/markdown-article';

/*== 数据与配置 ==*/
import { formatPostDate } from '@/lib/domain/post-shared';

/*== 样式导入 ==*/
import styles from './article-view.module.css';

/*== 类型定义 ==*/
export interface ArticleViewProps {
    content: string;
    fullWidth?: boolean;
    title?: string;
    summary?: string;
    coverImage?: string | null;
    altText?: string | null;
    categoryName?: string | null;
    tagNames?: { id: number; name: string; slug: string }[] | string[];
    publishedAt?: string | null;
    updatedAt?: string | null;
}

/*== ArticleView 文章展示组件：编辑器预览与前台详情页共用 ==*/
export function ArticleView({
    content,
    fullWidth = false,
    title,
    summary,
    coverImage,
    altText,
    categoryName,
    tagNames,
    publishedAt,
    updatedAt,
}: ArticleViewProps) {
    const tagLabels = tagNames?.map((tag) => (typeof tag === 'string' ? tag : tag.name)) ?? [];

    const hasHeader = !!(title || summary || coverImage || categoryName || tagLabels.length > 0 || publishedAt);

    return (
        <div className={fullWidth ? `${styles.article} ${styles.articleWide}` : styles.article}>
            {hasHeader ? (
                <div className={styles.header}>
                    {coverImage ? (
                        <ContentImage
                            alt={altText || title || '封面图'}
                            className={styles.coverImage}
                            sizes="(min-width: 896px) 56rem, 100vw"
                            src={coverImage}
                        />
                    ) : null}
                    {title ? <h1 className={styles.headerTitle}>{title}</h1> : null}
                    {summary ? <p className={styles.headerSummary}>{summary}</p> : null}
                    {categoryName || tagLabels.length > 0 || publishedAt ? (
                        <div className={styles.headerMeta}>
                            {categoryName ? <span className={styles.category}>{categoryName}</span> : null}
                            {tagLabels.map((name) => (
                                <span className={styles.tag} key={name}>
                                    {name}
                                </span>
                            ))}
                            {publishedAt ? <span className={styles.date}>{formatPostDate(publishedAt)}</span> : null}
                        </div>
                    ) : null}
                </div>
            ) : null}
            <MarkdownArticle content={content} fullWidth={fullWidth} />
            {updatedAt && updatedAt !== publishedAt ? (
                <div className={styles.updatedDate}>最后更新于：{formatPostDate(updatedAt)}</div>
            ) : null}
        </div>
    );
}
