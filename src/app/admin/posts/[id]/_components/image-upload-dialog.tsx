'use client';

import { useCallback, useRef, useState } from 'react';
import Dialog from '@/components/ui/dialog';
import { ImageIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

import styles from './image-upload-dialog.module.css';

export interface ImageUploadDialogProps {
    open: boolean;
    onClose: () => void;
    onInsert: (markdown: string) => void;
}

/*== ImageUploadDialog 图片上传弹窗 ==*/
export function ImageUploadDialog({ open, onClose, onInsert }: ImageUploadDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [altText, setAltText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    /* 重置状态 */
    const resetState = useCallback(() => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setAltText('');
        setIsUploading(false);
        setIsDragging(false);
    }, []);

    /* 关闭弹窗 */
    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [resetState, onClose]);

    /* 选择文件 */
    const selectFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件');
            return;
        }
        setSelectedFile(file);
        setAltText(file.name.replace(/\.[^.]+$/, ''));
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }, []);

    /* 拖拽处理 */
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

            const file = e.dataTransfer.files[0];
            if (file) {
                selectFile(file);
            }
        },
        [selectFile]
    );

    /* 点击上传 */
    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                selectFile(file);
            }
            e.target.value = '';
        },
        [selectFile]
    );

    /* 上传并插入 */
    const handleSubmit = useCallback(async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await res.json();

            if (!res.ok || !result.data?.path) {
                throw new Error(result.message || '上传失败');
            }

            const markdown = `![${altText}](${result.data.path})`;
            onInsert(markdown);
            handleClose();
        } catch {
            toast.error('图片上传失败');
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, altText, onInsert, handleClose]);

    return (
        <Dialog maxWidth="24rem" onClose={handleClose} open={open} title="上传图片">
            {previewUrl ? (
                <>
                    <div className={styles.previewWrap}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- 上传预览不走 next/image 优化 */}
                        <img alt="预览" className={styles.previewImage} src={previewUrl} />
                    </div>
                    <div className={styles.altField}>
                        <label className={styles.altLabel} htmlFor="image-alt">
                            替代文本
                        </label>
                        <input className={styles.altInput} id="image-alt" onChange={(e) => setAltText(e.target.value)} placeholder="描述图片内容" type="text" value={altText} />
                    </div>
                    <button className={styles.submitBtn} disabled={isUploading} onClick={handleSubmit} type="button">
                        {isUploading ? '上传中...' : '上传并插入'}
                    </button>
                </>
            ) : (
                <div
                    className={`${styles.dropZone}${isDragging ? ` ${styles.dropZoneDragging}` : ''}`}
                    onClick={handleClick}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleClick();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <ImageIcon className={styles.dropIcon} />
                    <span className={styles.dropText}>点击或拖拽上传图片</span>
                </div>
            )}

            <input accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} type="file" />
        </Dialog>
    );
}
