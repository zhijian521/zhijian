'use client';

import { PencilIcon, Trash2Icon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/icon-button';

import styles from './taxonomy-card.module.css';

interface TaxonomyCardProps {
    /*-- 显示名称 --*/
    name: string;
    /*-- 排序号，仅分类有 --*/
    sortOrder?: number;
    /*-- 卡片色调：cat=淡朱砂，tag=青苔绿 --*/
    tone: 'cat' | 'tag';
    /*-- 是否正在删除中 --*/
    deleting?: boolean;
    /*-- 编辑回调 --*/
    onEdit: () => void;
    /*-- 删除回调 --*/
    onDelete: () => void;
}

export default function TaxonomyCard({ name, sortOrder, tone, deleting, onEdit, onDelete }: TaxonomyCardProps) {
    return (
        <div
            className={`${styles.card} ${tone === 'tag' ? styles.cardTag : styles.cardCat}`}
            role="listitem"
            tabIndex={0}
        >
            <div className={styles.actions}>
                <IconButton icon={<PencilIcon />} onClick={onEdit} size="small" title="编辑" />
                <IconButton
                    disabled={deleting}
                    icon={<Trash2Icon />}
                    onClick={onDelete}
                    size="small"
                    title="删除"
                    variant="danger"
                />
            </div>
            <span className={styles.name}>{name}</span>
            {sortOrder != null && <span className={styles.meta}>#{sortOrder}</span>}
        </div>
    );
}
