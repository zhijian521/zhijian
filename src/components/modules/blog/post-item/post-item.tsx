/*== 组件导入 ==*/
import Link from 'next/link';

import { ContentImage } from '@/components/site/content-image';
import { Tag } from '@/components/ui/tag';

/*== 数据与配置 ==*/
import { formatPostDate } from '@/lib/domain/post-shared';
import type { Post } from '@/lib/domain/post-shared';

/*== 样式导入 ==*/
import styles from './post-item.module.css';

/*== 类型定义 ==*/
interface PostItemProps {
    post: Post;
}

/*== PostItem 文章列表项 — 标题 + 摘要 + 元数据 + 可选封面图 ==*/
export function PostItem({ post }: PostItemProps) {
    return (
        <Link className={styles.item} href={`/blog/${post.slug}`}>
            <div className={styles.body}>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.summary}>{post.summary}</p>
                <div className={styles.meta}>
                    {post.categoryName ? (
                        <span className={styles.category}>{post.categoryName}</span>
                    ) : null}
                    {post.tagNames && post.tagNames.length > 0 ? (
                        <div className={styles.tags}>
                            {post.tagNames.map((tag) => (
                                <Tag key={tag.id} size="mini" variant="outlined">
                                    {tag.name}
                                </Tag>
                            ))}
                        </div>
                    ) : null}
                    <span className={styles.date}>{formatPostDate(post.updatedAt || post.publishedAt)}</span>
                </div>
            </div>
            {post.coverImage ? (
                <div className={styles.cover}>
                    <ContentImage
                        alt={post.altText || post.title}
                        sizes="(max-width: 640px) 100vw, 180px"
                        src={post.coverImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            ) : null}
        </Link>
    );
}
