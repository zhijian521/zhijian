/*============================================================================
  post-editor-content — 编辑器重复展示区

  复用元数据面板和正文编辑区，避免不同视图模式维护两套相同 JSX。
============================================================================*/

import type { Category } from '@/lib/domain/categories';
import type { PostStatus } from '@/lib/domain/post-shared';
import type { Tag } from '@/lib/domain/tags';

import { MarkdownEditor } from './markdown-editor';
import { MetadataPanel } from './metadata-panel';
import styles from './post-editor.module.css';

interface PostEditorMetadataProps {
    altText: string | null;
    categories: Category[];
    categoryId: number | null;
    coverImage: string | null;
    onAltTextChange: (value: string | null) => void;
    onCategoryIdChange: (value: number | null) => void;
    onCoverImageChange: (value: string | null) => void;
    onPublishedAtChange: (value: string | null) => void;
    onSelectedTagsChange: (value: number[]) => void;
    onSlugChange: (value: string) => void;
    onStatusChange: (value: PostStatus) => void;
    publishedAt: string | null;
    selectedTags: number[];
    slug: string;
    status: PostStatus;
    tags: Tag[];
}

export function PostEditorMetadata(props: PostEditorMetadataProps) {
    return (
        <div className={styles.sidePanel}>
            <MetadataPanel {...props} />
        </div>
    );
}

interface PostEditorContentProps {
    content: string;
    fullWidth: boolean;
    onContentChange: (value: string) => void;
    onSummaryChange: (value: string) => void;
    onTitleChange: (value: string) => void;
    summary: string;
    title: string;
}

export function PostEditorContent({
    content,
    fullWidth,
    onContentChange,
    onSummaryChange,
    onTitleChange,
    summary,
    title,
}: PostEditorContentProps) {
    return (
        <div className={styles.editPane}>
            <div className={styles.headerArea}>
                <input
                    className={styles.titleInput}
                    onChange={(event) => onTitleChange(event.target.value)}
                    placeholder="文章标题"
                    type="text"
                    value={title}
                />
                <textarea
                    className={styles.summaryInput}
                    onChange={(event) => onSummaryChange(event.target.value)}
                    placeholder="写一段简短的摘要..."
                    rows={2}
                    value={summary}
                />
            </div>
            <div className={styles.contentEdit}>
                <MarkdownEditor content={content} fullWidth={fullWidth} onContentChange={onContentChange} />
            </div>
        </div>
    );
}
