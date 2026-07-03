import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from './code-block';

import 'highlight.js/styles/github.css';
import styles from './markdown-article.module.css';

export interface MarkdownArticleProps {
    /** Markdown 文本内容 */
    content: string;
    fullWidth?: boolean;
}

/*== MarkdownArticle - 统一 MD 渲染组件，前台详情页与后台预览共用 ==*/
export function MarkdownArticle({ content, fullWidth = false }: MarkdownArticleProps) {
    const bodyClassName = fullWidth ? `${styles.body} ${styles.bodyWide}` : styles.body;

    return (
        <div className={bodyClassName}>
            <ReactMarkdown components={{ pre: CodeBlock }} rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
