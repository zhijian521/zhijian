'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

import styles from './markdown-editor.module.css';

export interface MarkdownEditorProps {
    content: string;
    onContentChange: (value: string) => void;
    onInsertImage: (markdown: string) => void;
    fullWidth?: boolean;
}

/* 上传中标记 */
const UPLOADING_MARKER_PREFIX = '![⏳上传中...](';

/*== MarkdownEditor Markdown 编辑区 ==*/
export function MarkdownEditor({
    content,
    onContentChange,
    onInsertImage,
    fullWidth,
}: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    /* 用 ref 追踪最新 content，避免异步回调中闭包捕获过时值 */
    const contentRef = useRef(content);
    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    /* 在光标位置插入文本 */
    const insertAtCursor = useCallback(
        (text: string) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const before = content.slice(0, start);
            const after = content.slice(end);
            const newContent = before + text + after;
            onContentChange(newContent);

            // 恢复光标位置
            requestAnimationFrame(() => {
                textarea.selectionStart = start + text.length;
                textarea.selectionEnd = start + text.length;
                textarea.focus();
            });
        },
        [content, onContentChange],
    );

    /* 包裹选中文本 */
    const wrapSelection = useCallback(
        (prefix: string, suffix: string) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = content.slice(start, end);
            const before = content.slice(0, start);
            const after = content.slice(end);
            const newContent = before + prefix + selected + suffix + after;
            onContentChange(newContent);

            requestAnimationFrame(() => {
                if (selected) {
                    textarea.selectionStart = start + prefix.length;
                    textarea.selectionEnd = start + prefix.length + selected.length;
                } else {
                    textarea.selectionStart = start + prefix.length;
                    textarea.selectionEnd = start + prefix.length;
                }
                textarea.focus();
            });
        },
        [content, onContentChange],
    );

    /* 上传图片文件 */
    const uploadImage = useCallback(
        async (file: File) => {
            const startMarker = `${UPLOADING_MARKER_PREFIX}${file.name})`;
            insertAtCursor(startMarker);

            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                });
                const result = await res.json();

                if (!res.ok || !result.data?.path) {
                    throw new Error(result.message || '上传失败');
                }

                // 用 ref 读取最新 content，替换上传中标记为最终 markdown
                const finalMarkdown = `![${file.name}](${result.data.path})`;
                const latestContent = contentRef.current;
                const newContent = latestContent.replace(startMarker, finalMarkdown);
                onInsertImage(finalMarkdown);
                onContentChange(newContent);
            } catch {
                // 上传失败，用 ref 读取最新 content，清除上传标记
                const latestContent = contentRef.current;
                const newContent = latestContent.replace(startMarker, '');
                onContentChange(newContent);
                toast.error('上传失败');
            }
        },
        [insertAtCursor, onContentChange, onInsertImage],
    );

    /* 处理粘贴事件 */
    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        uploadImage(file);
                    }
                    return;
                }
            }
        },
        [uploadImage],
    );

    /* 处理拖拽 */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith('image/')) {
                    uploadImage(file);
                }
            }
        },
        [uploadImage],
    );

    /* Tab 缩进支持 */
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const textarea = textareaRef.current;
                if (!textarea) return;

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const before = content.slice(0, start);
                const after = content.slice(end);

                if (e.shiftKey) {
                    // 反缩进：移除行首的 4 个空格或 1 个 tab
                    const lineStart = before.lastIndexOf('\n') + 1;
                    const linePrefix = content.slice(lineStart, start);
                    if (linePrefix.startsWith('    ')) {
                        const newContent = content.slice(0, lineStart) + content.slice(lineStart + 4);
                        onContentChange(newContent);
                        requestAnimationFrame(() => {
                            textarea.selectionStart = Math.max(lineStart, start - 4);
                            textarea.selectionEnd = Math.max(lineStart, start - 4);
                        });
                    } else if (linePrefix.startsWith('\t')) {
                        const newContent = content.slice(0, lineStart) + content.slice(lineStart + 1);
                        onContentChange(newContent);
                        requestAnimationFrame(() => {
                            textarea.selectionStart = Math.max(lineStart, start - 1);
                            textarea.selectionEnd = Math.max(lineStart, start - 1);
                        });
                    }
                } else {
                    // 缩进：插入 4 个空格
                    const newContent = before + '    ' + after;
                    onContentChange(newContent);
                    requestAnimationFrame(() => {
                        textarea.selectionStart = start + 4;
                        textarea.selectionEnd = start + 4;
                    });
                }
            }
        },
        [content, onContentChange],
    );

    /* Mini 工具栏按钮操作 */
    const handleToolbarAction = useCallback(
        (action: string) => {
            switch (action) {
                case 'bold':
                    wrapSelection('**', '**');
                    break;
                case 'italic':
                    wrapSelection('*', '*');
                    break;
                case 'h2':
                    insertAtCursor('## ');
                    break;
                case 'h3':
                    insertAtCursor('### ');
                    break;
                case 'link':
                    wrapSelection('[', '](url)');
                    break;
                case 'code':
                    wrapSelection('`', '`');
                    break;
                case 'image':
                    fileInputRef.current?.click();
                    break;
            }
        },
        [insertAtCursor, wrapSelection],
    );

    /* 文件选择回调 */
    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith('image/')) {
                uploadImage(file);
            }
            // 重置 input 以便再次选择同一文件
            e.target.value = '';
        },
        [uploadImage],
    );

    return (
        <div className={`${styles.editor}${fullWidth ? ` ${styles.fullWidth}` : ''}`}>
            {/* Mini 工具栏 */}
            <div className={styles.miniToolbar}>
                <button
                    className={styles.miniBtn}
                    onClick={() => handleToolbarAction('bold')}
                    title="粗体"
                    type="button"
                >
                    B
                </button>
                <button
                    className={styles.miniBtn}
                    onClick={() => handleToolbarAction('italic')}
                    title="斜体"
                    type="button"
                >
                    <em>I</em>
                </button>
                <div className={styles.separator} />
                <button
                    className={styles.miniBtn}
                    onClick={() => handleToolbarAction('h2')}
                    title="二级标题"
                    type="button"
                >
                    H2
                </button>
                <button
                    className={styles.miniBtn}
                    onClick={() => handleToolbarAction('h3')}
                    title="三级标题"
                    type="button"
                >
                    H3
                </button>
                <div className={styles.separator} />
                <button
                    className={styles.miniBtn}
                    onClick={() => handleToolbarAction('link')}
                    title="链接"
                    type="button"
                >
                    🔗
                </button>
                <button
                    className={styles.miniBtn}
                    onClick={() => handleToolbarAction('image')}
                    title="图片"
                    type="button"
                >
                    <ImageIcon className={styles.miniBtnIcon} />
                </button>
                <button
                    className={styles.miniBtn}
                    onClick={() => handleToolbarAction('code')}
                    title="行内代码"
                    type="button"
                >
                    &lt;/&gt;
                </button>
            </div>

            {/* 编辑区 */}
            <div
                className={styles.editorWrap}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <textarea
                    className={styles.textarea}
                    onChange={(e) => onContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder="在此输入 Markdown 内容..."
                    ref={textareaRef}
                    value={content}
                />
                {isDragging && (
                    <div className={styles.dropOverlay}>拖放图片到此处上传</div>
                )}
            </div>

            {/* 隐藏的文件选择 input */}
            <input
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
                type="file"
            />
        </div>
    );
}
