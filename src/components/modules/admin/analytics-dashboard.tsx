'use client';

/*============================================================================
  analytics-dashboard — 网站统计仪表盘

  编排站点、时间范围和访问记录状态，负责统计接口请求、接入代码复制
  与数据清理；概览和访问记录的展示分别交由独立组件渲染。
============================================================================*/

import { useCallback, useEffect, useState } from 'react';

import AdminPageHeader from '@/components/modules/admin/page-header';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { GhostButton } from '@/components/ui/ghost-button';
import { CopyIcon, Trash2Icon } from '@/components/ui/icons';
import { PillSelect } from '@/components/ui/pill-select';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { api } from '@/lib/core/http-client';
import { getEmbedScript } from '@/lib/core/utils';
import type { DateRange, VisitRecord } from '@/lib/domain/analytics';

import { AnalyticsOverview } from './analytics-overview';
import type { AnalyticsData, AnalyticsSiteOption } from './analytics-dashboard.types';
import { AnalyticsVisits } from './analytics-visits';
import styles from './analytics-dashboard.module.css';

const VISITS_DEFAULT_PAGE_SIZE = 10;

export default function AnalyticsDashboard() {
    const [sites, setSites] = useState<AnalyticsSiteOption[]>([]);
    const [siteId, setSiteId] = useState('');
    const [range, setRange] = useState<DateRange>('7d');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<'overview' | 'visits'>('overview');
    const [visits, setVisits] = useState<{ data: VisitRecord[]; total: number }>({ data: [], total: 0 });
    const [visitsPage, setVisitsPage] = useState(1);
    const [visitsPageSize, setVisitsPageSize] = useState(VISITS_DEFAULT_PAGE_SIZE);
    const [visitsLoading, setVisitsLoading] = useState(false);
    const [clearOpen, setClearOpen] = useState(false);
    const [clearLoading, setClearLoading] = useState(false);

    const fetchSites = useCallback(async () => {
        try {
            const response = await api.get<{ data: AnalyticsSiteOption[]; total: number }>('/admin/analytics/sites');
            if (response.code !== 0 || !response.data?.data) return;

            const siteList = response.data.data;
            setSites(siteList);
            setSiteId((previousSiteId) => previousSiteId || (siteList.length > 0 ? siteList[0].id : ''));
        } catch (error) {
            console.error('获取站点列表失败：', error);
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!siteId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.get<AnalyticsData>('/admin/analytics/overview', { siteId, range });
            if (response.code === 0 && response.data) {
                setData(response.data);
                return;
            }
            setError(response.message || '获取数据失败');
        } catch (error) {
            console.error('获取分析数据失败：', error);
            setError('网络请求失败，请检查网络连接后重试');
        } finally {
            setLoading(false);
        }
    }, [range, siteId]);

    const fetchVisits = useCallback(async () => {
        if (!siteId) return;

        setVisitsLoading(true);
        try {
            const response = await api.get<{ data: VisitRecord[]; total: number }>('/admin/analytics/visits', {
                siteId,
                range,
                page: visitsPage,
                pageSize: visitsPageSize,
            });
            if (response.code === 0 && response.data) setVisits(response.data);
        } catch (error) {
            console.error('获取访问记录失败：', error);
        } finally {
            setVisitsLoading(false);
        }
    }, [range, siteId, visitsPage, visitsPageSize]);

    useEffect(() => {
        fetchSites();
    }, [fetchSites]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (tab === 'visits') fetchVisits();
    }, [fetchVisits, tab]);

    const handleVisitsPageSizeChange = useCallback((pageSize: number) => {
        setVisitsPageSize(pageSize);
        setVisitsPage(1);
    }, []);

    async function copyEmbedCode() {
        if (!siteId) return;

        try {
            await navigator.clipboard.writeText(getEmbedScript(siteId));
            toast.success('接入代码已复制');
        } catch {
            toast.error('复制失败');
        }
    }

    async function handleClearData() {
        if (!siteId) return;

        setClearLoading(true);
        try {
            const response = await api.delete<{ events: number; daily: number }>(
                `/admin/analytics/data?siteId=${siteId}`
            );
            if (response.code !== 0) {
                toast.error(response.message || '清空失败');
                return;
            }

            toast.success(response.message || '数据已清空');
            setClearOpen(false);
            fetchData();
            if (tab === 'visits') fetchVisits();
        } catch {
            toast.error('清空失败');
        } finally {
            setClearLoading(false);
        }
    }

    return (
        <>
            <AdminPageHeader
                description="查看站点访问数据，了解流量趋势和用户行为。"
                eyebrow="Analytics"
                tag={sites.length > 0 ? `${sites.length} 个站点` : undefined}
                title="网站统计"
            />

            <div className={styles.controls}>
                <div className={styles.siteSelect}>
                    <Select
                        onChange={setSiteId}
                        options={sites.map((site) => ({ value: site.id, label: `${site.name} (${site.id})` }))}
                        placeholder="暂无站点"
                        size="medium"
                        value={siteId}
                    />
                    {siteId ? (
                        <GhostButton
                            asButton
                            icon={<CopyIcon />}
                            onClick={copyEmbedCode}
                            size="small"
                            title="复制接入代码"
                        >
                            接入代码
                        </GhostButton>
                    ) : null}
                    {siteId ? (
                        <GhostButton
                            asButton
                            icon={<Trash2Icon />}
                            onClick={() => setClearOpen(true)}
                            size="small"
                            title="清空该站点全部统计记录"
                        >
                            清空记录
                        </GhostButton>
                    ) : null}
                </div>
                <div className={styles.rightControls}>
                    <PillSelect
                        onChange={(value) => setRange(value as DateRange)}
                        options={[
                            { value: '7d', label: '7 天' },
                            { value: '30d', label: '30 天' },
                            { value: '90d', label: '90 天' },
                        ]}
                        value={range}
                    />
                    <PillSelect
                        onChange={(value) => {
                            setTab(value as 'overview' | 'visits');
                            setVisitsPage(1);
                            setVisitsPageSize(VISITS_DEFAULT_PAGE_SIZE);
                        }}
                        options={[
                            { value: 'overview', label: '统计概览' },
                            { value: 'visits', label: '访问记录' },
                        ]}
                        value={tab}
                    />
                </div>
            </div>

            {tab === 'overview' ? (
                error ? (
                    <div className={styles.errorBanner}>
                        <p className={styles.errorText}>{error}</p>
                        <GhostButton asButton onClick={fetchData} size="small" variant="primary">
                            重试
                        </GhostButton>
                    </div>
                ) : loading && !data ? (
                    <div className={styles.loading}>加载中...</div>
                ) : !siteId ? (
                    <AnalyticsEmptyState />
                ) : data ? (
                    <AnalyticsOverview data={data} />
                ) : null
            ) : !siteId ? (
                <AnalyticsEmptyState />
            ) : (
                <AnalyticsVisits
                    data={visits.data}
                    isLoading={visitsLoading}
                    onPageChange={setVisitsPage}
                    onPageSizeChange={handleVisitsPageSizeChange}
                    page={visitsPage}
                    pageSize={visitsPageSize}
                    total={visits.total}
                />
            )}

            <ConfirmDialog
                confirmLabel="清空"
                loading={clearLoading}
                message="确定清空该站点的全部统计记录？此操作不可恢复。"
                onCancel={() => setClearOpen(false)}
                onConfirm={handleClearData}
                open={clearOpen}
                title="清空站点数据"
            />
        </>
    );
}

function AnalyticsEmptyState() {
    return (
        <div className={styles.empty}>
            <p>请先在「站点管理」中创建站点，获取接入代码嵌入目标网站。</p>
            <GhostButton asButton href="/admin/analytics/sites" size="medium" variant="primary">
                前往站点管理
            </GhostButton>
        </div>
    );
}
