/*============================================================================
  article-footer — 文章底部

  标签列表 + 返回/主页/顶部操作按钮。
============================================================================*/

/*== 组件导入 ==*/
import { ArticleFooterActions } from '@/components/modules/blog/article-footer-actions';
import { Show } from '@/components/ui/show';
import { Tag } from '@/components/ui/tag';

/*== 数据与配置 ==*/
import type { Post } from '@/lib/domain/post-shared';

/*== 样式导入 ==*/
import styles from './article-footer.module.css';

/*== 类型定义 ==*/
interface ArticleFooterProps {
    post: Post;
}

/*== ArticleFooter 文章底部 — 标签 + 操作按钮 ==*/
export function ArticleFooter({ post }: ArticleFooterProps) {
    return (
        <footer className={styles.footer}>
            <Show when={post.tagNames && post.tagNames.length > 0}>
                <div className={styles.tags}>
                    {post.tagNames!.map((tag) => (
                        <Tag key={tag.id} size="mini" variant="outlined">
                            {tag.name}
                        </Tag>
                    ))}
                </div>
            </Show>
            <ArticleFooterActions />
        </footer>
    );
}