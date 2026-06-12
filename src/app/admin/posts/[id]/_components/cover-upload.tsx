'use client';

import { useCallback, useRef, useState } from 'react';
import { ImageIcon, XIcon } from '@/components/ui/icons';
import { toast } from '@/components/ui/toast';

import styles from './cover-upload.module.css';

export interface CoverUploadProps {
    coverImage: string | null;
    altText: string | null;
    onCoverImageChange: (value: string | null) => void;
    onAltTextChange: (value: string | null) => void;
}

/*== CoverUpload 封面图上传区 ==*/
export function CoverUpload({
    coverImage,
    altText,
    onCoverImageChange,
    onAltTextChange,
}: CoverUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    /* 上传图片 */
    const uploadCover = useCallback(
        async (file: File) => {
            if (!file.type.startsWith('image/')) {
                toast.error('请选择图片文件');
                return;
            }

            setUploading(true);
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

                onCoverImageChange(result.data.path);
            } catch {
                toast.error('封面图上传失败');
            } finally {
                setUploading(false);
            }
        },
        [onCoverImageChange],
    );

    /* 拖拽处理 */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!uploading) setIsDragging(true);
    }, [uploading]);

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

            if (uploading) return;
            const file = e.dataTransfer.files[0];
            if (file) {
                uploadCover(file);
            }
        },
        [uploadCover, uploading],
    );

    /* 点击上传 */
    const handleClick = useCallback(() => {
        if (!uploading) fileInputRef.current?.click();
    }, [uploading]);

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                uploadCover(file);
            }
            e.target.value = '';
        },
        [uploadCover],
    );

    /* 删除封面 */
    const handleDelete = useCallback(() => {
        if (uploading) return;
        onCoverImageChange(null);
    }, [onCoverImageChange, uploading]);

    /* Alt 文本变更 */
    const handleAltChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onAltTextChange(e.target.value || null);
        },
        [onAltTextChange],
    );

    return (
        <div className={styles.coverUpload}>
            {coverImage ? (
                <>
                    <div className={styles.previewWrap}>
                        <img
                            alt={altText || '封面图'}
                            className={`${styles.previewImage}${uploading ? ` ${styles.previewImageUploading}` : ''}`}
                            src={coverImage}
                        />
                        <button
                            aria-label="删除封面图"
                            className={styles.deleteBtn}
                            disabled={uploading}
                            onClick={handleDelete}
                            type="button"
                        >
                            <XIcon className={styles.deleteIcon} />
                        </button>
                    </div>
                    <div className={styles.altField}>
                        <label className={styles.altLabel} htmlFor="cover-alt">
                            替代文本
                        </label>
                        <input
                            className={styles.altInput}
                            disabled={uploading}
                            id="cover-alt"
                            onChange={handleAltChange}
                            placeholder="描述封面图内容"
                            type="text"
                            value={altText || ''}
                        />
                    </div>
                </>
            ) : (
                <div
                    className={`${styles.dropZone}${isDragging ? ` ${styles.dropZoneDragging}` : ''}${uploading ? ` ${styles.dropZoneUploading}` : ''}`}
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
                    tabIndex={uploading ? -1 : 0}
                >
                    {uploading ? (
                        <>
                            <span className={styles.spinner} />
                            <span className={styles.dropText}>上传中...</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon className={styles.dropIcon} />
                            <span className={styles.dropText}>点击或拖拽上传封面图</span>
                        </>
                    )}
                </div>
            )}

            <input
                accept="image/*"
                disabled={uploading}
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
                type="file"
            />
        </div>
    );
}
