'use client';

import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import type { PostStatus } from '@/lib/domain/post-shared';

import styles from './editor-toolbar.module.css';

export type ViewMode = 'edit' | 'split' | 'preview';

export interface EditorToolbarProps {
    isSaving: boolean;
    onBack: () => void;
    onManualSave: () => void;
    onTogglePublish: () => void;
    onViewModeChange: (mode: ViewMode) => void;
    saveStatus: 'saved' | 'saving' | 'unsaved';
    status: PostStatus;
    viewMode: ViewMode;
}

const VIEW_MODES: { value: ViewMode; label: string }[] = [
    { value: 'edit', label: '编辑' },
    { value: 'split', label: '分栏' },
    { value: 'preview', label: '预览' },
];

const SAVE_STATUS_TEXT: Record<EditorToolbarProps['saveStatus'], string> = {
    saved: '已保存',
    saving: '保存中...',
    unsaved: '未保存',
};

/*== EditorToolbar 编辑器顶部工具栏 ==*/
export function EditorToolbar({
    isSaving,
    onBack,
    onManualSave,
    onTogglePublish,
    onViewModeChange,
    saveStatus,
    status,
    viewMode,
}: EditorToolbarProps) {
    return (
        <div className={styles.toolbar}>
            {/* 左侧：返回 + 保存状态 */}
            <div className={styles.left}>
                <button className={styles.backBtn} onClick={onBack} type="button">
                    <ArrowLeftIcon className={styles.backIcon} />
                    返回
                </button>
                <span
                    className={`${styles.saveStatus}${saveStatus === 'saving' ? ` ${styles.saveStatusSaving}` : saveStatus === 'unsaved' ? ` ${styles.saveStatusUnsaved}` : ''}`}
                >
                    {SAVE_STATUS_TEXT[saveStatus]}
                </span>
            </div>

            {/* 中间：视图模式切换 */}
            <div className={styles.center}>
                {VIEW_MODES.map((mode) => (
                    <button
                        className={`${styles.viewBtn}${viewMode === mode.value ? ` ${styles.viewBtnActive}` : ''}`}
                        key={mode.value}
                        onClick={() => onViewModeChange(mode.value)}
                        type="button"
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* 右侧：保存 + 发布 */}
            <div className={styles.right}>
                <button className={styles.saveBtn} disabled={isSaving} onClick={onManualSave} type="button">
                    <SaveIcon className={styles.saveIcon} />
                    保存
                </button>
                <button
                    className={`${styles.publishBtn}${status === 'published' ? ` ${styles.publishBtnPublished}` : ''}`}
                    onClick={onTogglePublish}
                    type="button"
                >
                    {status === 'published' ? '取消发布' : '发布'}
                </button>
            </div>
        </div>
    );
}
