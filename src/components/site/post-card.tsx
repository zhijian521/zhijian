import { Tag } from '@/components/ui/tag';
import { TextLink } from '@/components/ui/text-link';

import styles from './post-card.module.css';

export interface PostCardProps {
    /** 卡片顶部视觉区内容，传入渐变 div 或图片。不传则为纯文字卡片 */
    visual?: React.ReactNode;
    /** 标签文字 */
    tag?: string;
    /** 标签变体 */
    tagVariant?: 'default' | 'primary';
    /** 日期文字 */
    date?: string;
    /** 文章标题 */
    title: string;
    /** 文章摘要 */
    summary?: string;
    /** 文章链接 */
    href: string;
}

/*== PostCard 文章卡片 — 组合 Tag + TextLink ==*/
export function PostCard({
    visual,
    tag,
    tagVariant = 'default',
    date,
    title,
    summary,
    href,
}: PostCardProps) {
    const isTextOnly = !visual;

    return (
        <article className={styles.card}>
            {visual ? (
                <div className={styles.visual}>
                    <div className={styles.visualContent}>{visual}</div>
                </div>
            ) : null}

            <div className={styles.body}>
                <div className={styles.metaRow}>
                    {tag ? <Tag variant={tagVariant} size="mini">{tag}</Tag> : null}
                    {date ? <span className={styles.date}>{date}</span> : null}
                </div>

                <h3 className={styles.title}>{title}</h3>

                {summary ? <p className={styles.summary}>{summary}</p> : null}

                {isTextOnly ? <div className={styles.divider} /> : null}

                <TextLink href={href}>阅读更多</TextLink>
            </div>
        </article>
    );
}