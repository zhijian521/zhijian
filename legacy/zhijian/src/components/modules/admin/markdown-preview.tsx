/*============================================================================
  markdown-preview — 编辑器实时预览区

  使用编辑中的 Post 数据复用博客详情页画布与 ArticleView 渲染链。
============================================================================*/

'use client';

/*== 组件导入 ==*/
import { ArticleDetail } from '@/components/site/article-view';

/*== 数据与配置 ==*/
import type { Post } from '@/lib/domain/post-shared';

/*== 样式导入 ==*/
import articleStyles from '@/components/site/article-view.module.css';
import styles from './markdown-preview.module.css';

export interface MarkdownPreviewProps {
    post: Post;
}

/*== MarkdownPreview 编辑器实时预览区 — 与博客详情页共享画布、文章容器和正文组件 ==*/
export function MarkdownPreview({ post }: MarkdownPreviewProps) {
    return (
        <div className={`${articleStyles.page} ${styles.preview}`}>
            <article className={articleStyles.surface}>
                <ArticleDetail post={post} />
            </article>
        </div>
    );
}
