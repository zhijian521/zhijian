'use client';

/*============================================================================
  analytics-visits — 访问记录展示区

  纯展示统计站点的访问记录表格和分页，接收容器提供的数据与回调，
  不直接处理接口请求、站点选择或时间范围状态。
============================================================================*/

import { memo } from 'react';

import { DataTable, type DataColumn } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Tag } from '@/components/ui/tag';
import type { VisitRecord } from '@/lib/domain/analytics';

import styles from './analytics-visits.module.css';

/*== 表格配置 ==*/

function formatVisitTime(value: string): string {
    try {
        const date = new Date(value);
        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(
            date.getHours()
        ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
        return value;
    }
}

function deviceTagVariant(device: string): 'primary' | 'default' | 'outlined' {
    if (device === 'Mobile') return 'primary';
    if (device === 'Tablet') return 'outlined';
    return 'default';
}

const VISIT_COLUMNS: DataColumn<VisitRecord>[] = [
    {
        header: '页面',
        width: '200px',
        render: (visit) => (
            <div className={styles.visitPageCell}>
                <span className={styles.visitPath}>{visit.path}</span>
                {visit.title ? <span className={styles.visitTitle}>{visit.title}</span> : null}
            </div>
        ),
    },
    { header: '来源', width: '150px', render: (visit) => <span className={styles.visitMuted}>{visit.referrer}</span> },
    {
        header: '设备',
        width: '120px',
        render: (visit) => (
            <Tag size="mini" variant={deviceTagVariant(visit.device)}>
                {visit.device}
            </Tag>
        ),
    },
    { header: '浏览器', width: '120px', render: (visit) => <span className={styles.visitMuted}>{visit.browser}</span> },
    { header: '操作系统', width: '120px', render: (visit) => <span className={styles.visitMuted}>{visit.os}</span> },
    { header: '语言', width: '100px', render: (visit) => <span className={styles.visitMuted}>{visit.lang}</span> },
    {
        header: '访客',
        width: '150px',
        render: (visit) => (
            <span className={styles.visitMuted}>
                {visit.visitorId}
                {visit.isNew ? (
                    <Tag className={styles.newTag} size="mini" variant="primary">
                        新
                    </Tag>
                ) : null}
            </span>
        ),
    },
    {
        header: '会话',
        width: '150px',
        render: (visit) => (
            <span className={styles.visitMuted}>
                {visit.sessionId}
                {visit.isSession ? (
                    <Tag className={styles.newTag} size="mini" variant="outlined">
                        入口
                    </Tag>
                ) : null}
            </span>
        ),
    },
    { header: '位置', width: '150px', render: (visit) => <span className={styles.visitMuted}>{visit.location}</span> },
    { header: 'IP', width: '150px', render: (visit) => <span className={styles.visitMuted}>{visit.ip}</span> },
    {
        header: '停留',
        width: '100px',
        render: (visit) => (
            <span className={styles.visitMuted}>{visit.duration != null ? `${visit.duration}s` : '-'}</span>
        ),
    },
    {
        header: '时间',
        width: '150px',
        render: (visit) => <span className={styles.visitMuted}>{formatVisitTime(visit.createdAt)}</span>,
    },
];

/*== 访问记录展示 ==*/

interface AnalyticsVisitsProps {
    data: VisitRecord[];
    total: number;
    page: number;
    pageSize: number;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

export const AnalyticsVisits = memo(function AnalyticsVisits({
    data,
    total,
    page,
    pageSize,
    isLoading,
    onPageChange,
    onPageSizeChange,
}: AnalyticsVisitsProps) {
    return (
        <>
            <DataTable
                columns={VISIT_COLUMNS}
                emptyText={isLoading ? '加载中...' : '暂无访问记录'}
                rowKey={(visit) => visit.id}
                rows={data}
                scrollable
            />
            <Pagination
                current={page}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                pageSize={pageSize}
                total={Math.max(1, Math.ceil(total / pageSize))}
            />
        </>
    );
});
