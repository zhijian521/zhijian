/*============================================================================
  post-item — 博客列表文章卡片

  展示文章标题、摘要、分类、标签、日期，可带封面图。
  整卡可点击跳转到文章详情。
============================================================================*/

/*== 依赖导入 ==*/
import Link from 'next/link';

/*== 组件导入 ==*/
import { ContentImage } from '@/components/site/content-image';
import { Show } from '@/components/ui/show';
import { Tag } from '@/components/ui/tag';

/*== 数据与配置 ==*/
import { formatPostDate } from '@/lib/domain/post-shared';
import type { Post } from '@/lib/domain/post-shared';

/*== 样式导入 ==*/
import styles from './post-item.module.css';

/*== 类型定义 ==*/
/*-- 列表页文章卡片实际消费的字段，服务端按此裁剪后再传入客户端 --*/
export type PostListItem = Pick<
    Post,
    | 'id'
    | 'slug'
    | 'title'
    | 'summary'
    | 'coverImage'
    | 'altText'
    | 'categoryName'
    | 'tagNames'
    | 'publishedAt'
    | 'updatedAt'
>;

interface PostItemProps {
    /*-- 文章数据 --*/
    post: PostListItem;
}

/*== PostItem 文章列表项 — 标题 + 摘要 + 元数据 + 可选封面图 ==*/
export function PostItem({ post }: PostItemProps) {
    return (
        <Link className={styles.item} href={`/blog/${post.slug}`}>
            <div className={styles.body}>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.summary}>{post.summary}</p>
                {/* 元数据栏 */}
                <div className={styles.meta}>
                    <Show when={post.categoryName}>
                        <span className={styles.category}>{post.categoryName}</span>
                    </Show>
                    <Show when={post.tagNames && post.tagNames.length > 0}>
                        <div className={styles.tags}>
                            {(post.tagNames ?? []).map((tag) => (
                                <Tag key={tag.id} size="mini" variant="outlined">
                                    {tag.name}
                                </Tag>
                            ))}
                        </div>
                    </Show>
                    <span className={styles.date}>{formatPostDate(post.updatedAt || post.publishedAt)}</span>
                </div>
            </div>
            {/* 封面图 */}
            <Show when={post.coverImage}>
                <div className={styles.cover}>
                    <ContentImage
                        alt={post.altText || post.title}
                        sizes="(max-width: 640px) 100vw, 180px"
                        src={post.coverImage!}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </Show>
        </Link>
    );
}
