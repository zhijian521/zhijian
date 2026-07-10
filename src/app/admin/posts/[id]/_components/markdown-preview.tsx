'use client';

import { ArticleView } from '@/components/site/article-view';

import styles from './markdown-preview.module.css';

export interface MarkdownPreviewProps {
    content: string;
}

/*== MarkdownPreview 编辑器实时预览区 — 复用 ArticleView 组件 ==*/
export function MarkdownPreview({ content }: MarkdownPreviewProps) {
    // ponytail: 预览没有完整 Post 对象，仅传 content，标题等走 ArticleHeader 暂不渲染
    return (
        <div className={styles.preview}>
            <ArticleView content={content} fullWidth />
        </div>
    );
}
