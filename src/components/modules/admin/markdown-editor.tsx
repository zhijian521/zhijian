/*============================================================================
  markdown-editor — Markdown 编辑区

  带 mini 工具栏的 textarea 编辑器，支持粘贴/拖拽上传图片、
  Tab 缩进、工具栏快捷插入 Markdown 语法。
============================================================================*/

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/*== 组件导入 ==*/
import {
    BoldIcon, ItalicIcon, LinkIcon, ImageIcon,
    CodeIcon, CodeBlockIcon, QuoteIcon, ListIcon,
    ListOrderedIcon, MinusIcon,
} from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

/*== 样式导入 ==*/
import styles from './markdown-editor.module.css';

/*== 类型定义 ==*/
export interface MarkdownEditorProps {
    content: string;
    onContentChange: (value: string) => void;
    onInsertImage: (markdown: string) => void;
    fullWidth?: boolean;
}

/*== 工具栏按钮配置 ==*/
type ToolbarItem =
    | { isSep: true }
    | { isSep?: false; key: string; title: string; render: () => React.ReactNode };

const TOOLBAR_ITEMS: ToolbarItem[] = [
    { key: 'bold', title: '粗体', render: () => <BoldIcon className={styles.miniBtnIcon} /> },
    { key: 'italic', title: '斜体', render: () => <ItalicIcon className={styles.miniBtnIcon} /> },
    { isSep: true },
    { key: 'h2', title: '二级标题', render: () => <span className={styles.miniBtnText}>H2</span> },
    { key: 'h3', title: '三级标题', render: () => <span className={styles.miniBtnText}>H3</span> },
    { isSep: true },
    { key: 'quote', title: '引用', render: () => <QuoteIcon className={styles.miniBtnIcon} /> },
    { key: 'ul', title: '无序列表', render: () => <ListIcon className={styles.miniBtnIcon} /> },
    { key: 'ol', title: '有序列表', render: () => <ListOrderedIcon className={styles.miniBtnIcon} /> },
    { isSep: true },
    { key: 'link', title: '链接', render: () => <LinkIcon className={styles.miniBtnIcon} /> },
    { key: 'image', title: '图片', render: () => <ImageIcon className={styles.miniBtnIcon} /> },
    { isSep: true },
    { key: 'code', title: '行内代码', render: () => <CodeIcon className={styles.miniBtnIcon} /> },
    { key: 'codeblock', title: '代码块', render: () => <CodeBlockIcon className={styles.miniBtnIcon} /> },
    { key: 'hr', title: '水平线', render: () => <MinusIcon className={styles.miniBtnIcon} /> },
];

/*== markdown 语法动作分发 ==*/
function execToolbarAction(action: string, insert: (t: string) => void, wrap: (a: string, b: string) => void, clickFile: () => void) {
    switch (action) {
        case 'bold': wrap('**', '**'); break;
        case 'italic': wrap('*', '*'); break;
        case 'h2': insert('## '); break;
        case 'h3': insert('### '); break;
        case 'link': wrap('[', '](url)'); break;
        case 'image': clickFile(); break;
        case 'code': wrap('`', '`'); break;
        case 'codeblock': insert('\n```\n\n```\n'); break;
        case 'quote': insert('> '); break;
        case 'ul': insert('- '); break;
        case 'ol': insert('1. '); break;
        case 'hr': insert('\n---\n'); break;
    }
}

/* 上传中标记前缀 */
const UPLOADING_MARKER = '![⏳上传中...](';

/*== MarkdownEditor Markdown 编辑区 ==*/
export function MarkdownEditor({ content, onContentChange, onInsertImage, fullWidth }: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    /* 用 ref 追踪最新 content，避免异步回调中闭包捕获过时值 */
    const contentRef = useRef(content);
    useEffect(() => { contentRef.current = content; }, [content]);

    /* 在光标位置插入文本 */
    const insertAtCursor = useCallback((text: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart, end = ta.selectionEnd;
        const newContent = content.slice(0, start) + text + content.slice(end);
        onContentChange(newContent);
        requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + text.length;
            ta.focus();
        });
    }, [content, onContentChange]);

    /* 包裹选中文本 */
    const wrapSelection = useCallback((prefix: string, suffix: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart, end = ta.selectionEnd;
        const selected = content.slice(start, end);
        const newContent = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
        onContentChange(newContent);
        requestAnimationFrame(() => {
            if (selected) {
                ta.selectionStart = start + prefix.length;
                ta.selectionEnd = start + prefix.length + selected.length;
            } else {
                ta.selectionStart = ta.selectionEnd = start + prefix.length;
            }
            ta.focus();
        });
    }, [content, onContentChange]);

    /* 上传图片文件 */
    const uploadImage = useCallback(async (file: File) => {
        const marker = `${UPLOADING_MARKER}${file.name})`;
        insertAtCursor(marker);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
            const result = await res.json();
            if (!res.ok || !result.data?.path) throw new Error(result.message || '上传失败');
            const md = `![${file.name}](${result.data.path})`;
            onContentChange(contentRef.current.replace(marker, md));
            onInsertImage(md);
        } catch {
            onContentChange(contentRef.current.replace(marker, ''));
            toast.error('上传失败');
        }
    }, [insertAtCursor, onContentChange, onInsertImage]);

    /* 粘贴图片 */
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
            if (e.clipboardData.items[i].type.startsWith('image/')) {
                e.preventDefault();
                const file = e.clipboardData.items[i].getAsFile();
                if (file) uploadImage(file);
                return;
            }
        }
    }, [uploadImage]);

    /* 拖拽处理 */
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            if (e.dataTransfer.files[i].type.startsWith('image/')) uploadImage(e.dataTransfer.files[i]);
        }
    }, [uploadImage]);

    /* Tab 缩进 */
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart, end = ta.selectionEnd;
        if (e.shiftKey) {
            const lineStart = content.lastIndexOf('\n', start - 1) + 1;
            const prefix = content.slice(lineStart, start);
            const indent = prefix.startsWith('    ') ? 4 : prefix.startsWith('\t') ? 1 : 0;
            if (!indent) return;
            onContentChange(content.slice(0, lineStart) + content.slice(lineStart + indent));
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - indent);
            });
        } else {
            const newContent = content.slice(0, start) + '    ' + content.slice(end);
            onContentChange(newContent);
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 4;
            });
        }
    }, [content, onContentChange]);

    /* 文件选择 */
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file?.type.startsWith('image/')) uploadImage(file);
        e.target.value = '';
    }, [uploadImage]);

    const onToolbarClick = (action: string) =>
        execToolbarAction(action, insertAtCursor, wrapSelection, () => fileInputRef.current?.click());

    return (
        <div className={`${styles.editor}${fullWidth ? ` ${styles.fullWidth}` : ''}`}>
            <div className={styles.miniToolbar}>
                {TOOLBAR_ITEMS.map((item, i) =>
                    'isSep' in item ? (
                        <div key={`sep-${i}`} className={styles.separator} />
                    ) : (
                        <button
                            key={item.key}
                            className={styles.miniBtn}
                            onClick={() => onToolbarClick(item.key)}
                            title={item.title}
                            type="button"
                        >
                            {item.render()}
                        </button>
                    )
                )}
            </div>

            <div className={styles.editorWrap} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
                <textarea
                    className={styles.textarea}
                    onChange={(e) => onContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder="在此输入 Markdown 内容..."
                    ref={textareaRef}
                    value={content}
                />
                {isDragging && <div className={styles.dropOverlay}>拖放图片到此处上传</div>}
            </div>

            <input accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} type="file" />
        </div>
    );
}
