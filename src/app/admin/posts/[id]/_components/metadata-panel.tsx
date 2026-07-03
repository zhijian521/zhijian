'use client';

import { useCallback } from 'react';
import { Select } from '@/components/ui/select';
import { PillSelect } from '@/components/ui/pill-select';
import { XIcon } from '@/components/ui/icons';
import type { PostStatus } from '@/lib/post-shared';
import { toDateTimeLocalValue } from '@/lib/post-shared';
import type { Category } from '@/lib/categories';
import type { Tag } from '@/lib/tags';

import { CoverUpload } from './cover-upload';
import styles from './metadata-panel.module.css';

export interface MetadataPanelProps {
    categories: Category[];
    tags: Tag[];
    slug: string;
    status: PostStatus;
    publishedAt: string | null;
    coverImage: string | null;
    altText: string | null;
    categoryId: number | null;
    selectedTags: number[];
    onSlugChange: (value: string) => void;
    onStatusChange: (value: PostStatus) => void;
    onPublishedAtChange: (value: string | null) => void;
    onCoverImageChange: (value: string | null) => void;
    onAltTextChange: (value: string | null) => void;
    onCategoryIdChange: (value: number | null) => void;
    onSelectedTagsChange: (value: number[]) => void;
}

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
];

const NONE_VALUE = '__none__';

/*== MetadataPanel 左侧元数据面板 ==*/
export function MetadataPanel({
    categories,
    tags,
    slug,
    status,
    publishedAt,
    coverImage,
    altText,
    categoryId,
    selectedTags,
    onSlugChange,
    onStatusChange,
    onPublishedAtChange,
    onCoverImageChange,
    onAltTextChange,
    onCategoryIdChange,
    onSelectedTagsChange,
}: MetadataPanelProps) {
    /* 分类选项：加一个"无分类"选项 */
    const categoryOptions = [{ value: NONE_VALUE, label: '无分类' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))];
    const categoryValue = categoryId ? String(categoryId) : NONE_VALUE;

    const handleCategoryChange = useCallback(
        (value: string) => {
            onCategoryIdChange(value === NONE_VALUE ? null : Number(value));
        },
        [onCategoryIdChange]
    );

    /* 标签多选 */
    const handleAddTag = useCallback(
        (tagId: number) => {
            if (!selectedTags.includes(tagId)) {
                onSelectedTagsChange([...selectedTags, tagId]);
            }
        },
        [selectedTags, onSelectedTagsChange]
    );

    const handleRemoveTag = useCallback(
        (tagId: number) => {
            onSelectedTagsChange(selectedTags.filter((id) => id !== tagId));
        },
        [selectedTags, onSelectedTagsChange]
    );

    /* 发布时间变更 */
    const handlePublishedAtChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onPublishedAtChange(e.target.value || null);
        },
        [onPublishedAtChange]
    );

    return (
        <div className={styles.panel}>
            {/* 封面图 */}
            <CoverUpload altText={altText} coverImage={coverImage} onAltTextChange={onAltTextChange} onCoverImageChange={onCoverImageChange} />

            <hr className={styles.sectionDivider} />

            {/* 分类 */}
            <div className={styles.field}>
                <span className={styles.fieldLabel}>分类</span>
                <Select className={styles.fieldFull} onChange={handleCategoryChange} options={categoryOptions} size="small" value={categoryValue} />
            </div>

            {/* 标签 */}
            <div className={styles.tagSection}>
                <span className={styles.tagLabel}>标签</span>
                {selectedTags.length > 0 && (
                    <div className={styles.selectedTags}>
                        {selectedTags.map((tagId) => {
                            const tag = tags.find((t) => t.id === tagId);
                            if (!tag) return null;
                            return (
                                <span className={styles.tagItem} key={tagId}>
                                    {tag.name}
                                    <button className={styles.tagRemoveBtn} onClick={() => handleRemoveTag(tagId)} type="button" aria-label={`移除标签 ${tag.name}`}>
                                        <XIcon className={styles.tagRemoveIcon} />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                )}
                <div className={styles.availableTags}>
                    {tags
                        .filter((t) => !selectedTags.includes(t.id))
                        .map((tag) => (
                            <button className={styles.availableTag} key={tag.id} onClick={() => handleAddTag(tag.id)} type="button">
                                + {tag.name}
                            </button>
                        ))}
                </div>
            </div>

            <hr className={styles.sectionDivider} />

            {/* Slug */}
            <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="post-slug">
                    Slug
                </label>
                <input className={styles.fieldInput} id="post-slug" onChange={(e) => onSlugChange(e.target.value)} placeholder="url-slug" type="text" value={slug} />
            </div>

            {/* 状态：药丸单选 */}
            <div className={styles.field}>
                <span className={styles.fieldLabel}>状态</span>
                <PillSelect name="post-status" onChange={onStatusChange} options={STATUS_OPTIONS} size="small" value={status} />
            </div>

            {/* 发布时间 */}
            <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="post-published-at">
                    发布时间
                </label>
                <input className={styles.fieldInput} id="post-published-at" onChange={handlePublishedAtChange} type="datetime-local" value={toDateTimeLocalValue(publishedAt)} />
            </div>
        </div>
    );
}
