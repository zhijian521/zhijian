'use client';

import { useCallback, useRef } from 'react';

import styles from './note-markdown-editor.module.css';

export interface NoteMarkdownEditorProps {
    content: string;
    onContentChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
}

/*== NoteMarkdownEditor 导航页专用 Markdown 编辑器 ==*/
export default function NoteMarkdownEditor({ content, onContentChange, onBlur, placeholder = '开始编写 Markdown 笔记...' }: NoteMarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            e.preventDefault();
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const before = content.slice(0, start);
            const after = content.slice(end);

            if (e.shiftKey) {
                const lineStart = before.lastIndexOf('\n') + 1;
                const linePrefix = content.slice(lineStart, start);

                if (linePrefix.startsWith('    ')) {
                    const newContent = content.slice(0, lineStart) + content.slice(lineStart + 4);
                    onContentChange(newContent);
                    requestAnimationFrame(() => {
                        textarea.selectionStart = Math.max(lineStart, start - 4);
                        textarea.selectionEnd = Math.max(lineStart, start - 4);
                    });
                    return;
                }

                if (linePrefix.startsWith('\t')) {
                    const newContent = content.slice(0, lineStart) + content.slice(lineStart + 1);
                    onContentChange(newContent);
                    requestAnimationFrame(() => {
                        textarea.selectionStart = Math.max(lineStart, start - 1);
                        textarea.selectionEnd = Math.max(lineStart, start - 1);
                    });
                }
                return;
            }

            const newContent = before + '    ' + after;
            onContentChange(newContent);
            requestAnimationFrame(() => {
                textarea.selectionStart = start + 4;
                textarea.selectionEnd = start + 4;
            });
        },
        [content, onContentChange]
    );

    return (
        <div className={styles.editor}>
            <div className={styles.editorBody}>
                <textarea
                    className={styles.textarea}
                    onBlur={onBlur}
                    onChange={(e) => onContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    ref={textareaRef}
                    value={content}
                />
            </div>
        </div>
    );
}
