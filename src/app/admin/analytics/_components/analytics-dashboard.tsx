'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { DateRange } from '@/lib/analytics';

import { TrendingUpIcon, TrendingDownIcon, CopyIcon } from '@/components/ui/icons';
import { GhostButton } from '@/components/ui/ghost-button';
import { PillSelect } from '@/components/ui/pill-select';
import { toast } from '@/components/ui/toast';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import { Tag } from '@/components/ui/tag';
import { Pagination } from '@/components/ui/pagination';
import { getEmbedScript } from '@/lib/utils';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { api } from '@/lib/http-client';

import styles from './analytics-dashboard.module.css';

/*== 数据类型 ==*/
interface OverviewData {
    pv: number;
    uv: number;
    bounceRate: number;
    avgDuration: number;
    pvChange: number;
    uvChange: number;
}

interface TrendPoint {
    date: string;
    pv: number;
    uv: number;
}

interface PageRankItem {
    path: string;
    pv: number;
    uv: number;
}

interface SourceItem {
    source: string;
    count: number;
    percent: number;
}

interface DeviceItem {
    device: string;
    count: number;
    percent: number;
}

interface AnalyticsData {
    overview: OverviewData;
    trend: TrendPoint[];
    pages: PageRankItem[];
    sources: SourceItem[];
    devices: DeviceItem[];
}

interface VisitRecord {
    id: number;
    path: string;
    referrer: string;
    device: string;
    visitorId: string;
    duration: number | null;
    createdAt: string;
}

interface SiteOption {
    id: string;
    name: string;
}

/*== 格式化数字 ==*/
function formatNum(n: number): string {
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
}

/*== 格式化时长 ==*/
function formatDuration(seconds: number): string {
    if (seconds >= 60) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    }
    return `${seconds}s`;
}

/*== 格式化日期 ==*/
function formatDateShort(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
    return dateStr;
}

/*== 变化百分比指示 ==*/
function ChangeIndicator({ value }: { value: number }) {
    if (value === 0) return <span className={styles.changeNeutral}>-</span>;
    const isUp = value > 0;
    return (
        <span className={`${styles.change} ${isUp ? styles.changeUp : styles.changeDown}`}>
            {isUp ? <TrendingUpIcon className={styles.changeIcon} /> : <TrendingDownIcon className={styles.changeIcon} />}
            {isUp ? '+' : ''}{value}%
        </span>
    );
}

/*== 主题色（匹配 theme.css） ==*/
const CHART_COLORS = {
    primary: '#9f000f',       // 朱砂红
    primarySubtle: '#f5e6e8', // 朱砂淡底
    muted: '#6f655c',         // 暖褐
    mutedSubtle: '#e7ddd1',   // 驼色
    border: '#e7ddd1',
    foreground: '#1d1b20',
    background: '#f9f5f0',
};

/*== 自定义 Tooltip ==*/
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipLabel}>{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className={styles.tooltipValue} style={{ color: entry.color }}>
                    {entry.name === 'pv' ? '浏览量' : '访客数'}：{formatNum(entry.value)}
                </p>
            ))}
        </div>
    );
}

/*== 仪表盘主组件 ==*/
export default function AnalyticsDashboard() {
    const [sites, setSites] = useState<SiteOption[]>([]);
    const [siteId, setSiteId] = useState('');
    const [range, setRange] = useState<DateRange>('7d');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'visits'>('overview');
    const [visits, setVisits] = useState<{ data: VisitRecord[]; total: number }>({ data: [], total: 0 });
    const [visitsPage, setVisitsPage] = useState(1);
    const [visitsLoading, setVisitsLoading] = useState(false);
    const visitsPageSize = 20;

    /* 获取站点列表 */
    const fetchSites = useCallback(async () => {
        try {
            const res = await api.get<{ data: SiteOption[]; total: number }>('/admin/analytics/sites');
            if (res.code === 0 && res.data?.data) {
                const list = res.data.data;
                setSites(list);
                setSiteId((prev) => prev || (list.length > 0 ? list[0].id : ''));
            }
        } catch (err) {
            console.error('获取站点列表失败：', err);
        }
    }, []);

    /* 获取分析数据 */
    const fetchData = useCallback(async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const res = await api.get<AnalyticsData>('/admin/analytics/overview', { siteId, range });
            if (res.code === 0 && res.data) {
                setData(res.data);
            }
        } catch (err) {
            console.error('获取分析数据失败：', err);
        } finally {
            setLoading(false);
        }
    }, [siteId, range]);

    useEffect(() => {
        fetchSites();
    }, [fetchSites]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function copyEmbedCode() {
        if (!siteId) return;
        const code = getEmbedScript(siteId);
        try {
            await navigator.clipboard.writeText(code);
            toast.success('接入代码已复制');
        } catch {
            toast.error('复制失败');
        }
    }

    const fetchVisits = useCallback(async () => {
        if (!siteId) return;
        setVisitsLoading(true);
        try {
            const res = await api.get<{ data: VisitRecord[]; total: number }>('/admin/analytics/visits', {
                siteId,
                range,
                page: visitsPage,
                pageSize: visitsPageSize,
            });
            if (res.code === 0 && res.data) {
                setVisits(res.data);
            }
        } catch (err) {
            console.error('获取访问记录失败：', err);
        } finally {
            setVisitsLoading(false);
        }
    }, [siteId, range, visitsPage]);

    useEffect(() => {
        if (tab === 'visits') fetchVisits();
    }, [tab, fetchVisits]);

    function formatVisitTime(isoStr: string): string {
        try {
            const d = new Date(isoStr);
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');
            return `${mm}-${dd} ${hh}:${mi}`;
        } catch {
            return isoStr;
        }
    }

    const deviceTagVariant = (device: string): 'primary' | 'default' | 'outlined' => {
        if (device === 'Mobile') return 'primary';
        if (device === 'Tablet') return 'outlined';
        return 'default';
    };

    const visitColumns: DataColumn<VisitRecord>[] = [
        {
            header: '页面',
            render: (v) => <span className={styles.visitPath}>{v.path}</span>,
        },
        {
            header: '来源',
            hideBelow: 'sm',
            render: (v) => <span className={styles.visitMuted}>{v.referrer}</span>,
        },
        {
            header: '设备',
            hideBelow: 'md',
            render: (v) => (
                <Tag size="mini" variant={deviceTagVariant(v.device)}>
                    {v.device}
                </Tag>
            ),
        },
        {
            header: '访客',
            hideBelow: 'lg',
            render: (v) => <span className={styles.visitMuted}>{v.visitorId}</span>,
        },
        {
            header: '停留时长',
            hideBelow: 'lg',
            render: (v) => (
                <span className={styles.visitMuted}>
                    {v.duration != null ? `${v.duration}s` : '-'}
                </span>
            ),
        },
        {
            header: '访问时间',
            render: (v) => <span className={styles.visitMuted}>{formatVisitTime(v.createdAt)}</span>,
        },
    ];

    const overview = data?.overview;
    const trend = data?.trend || [];
    const pages = data?.pages || [];
    const sources = data?.sources || [];
    const devices = data?.devices || [];

    const maxPagePv = pages.length > 0 ? Math.max(...pages.map(p => p.pv)) : 1;

    return (
        <>
            <AdminPageHeader
                description='查看站点访问数据，了解流量趋势和用户行为。'
                eyebrow='Analytics'
                tag={sites.length > 0 ? `${sites.length} 个站点` : undefined}
                title='网站统计'
            />

            {/* 站点选择 + 时间范围 + Tab */}
            <div className={styles.controls}>
                <div className={styles.siteSelect}>
                    <select
                        className={styles.select}
                        value={siteId}
                        onChange={(e) => setSiteId(e.target.value)}
                    >
                        {sites.length === 0 && <option value="">暂无站点</option>}
                        {sites.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                        ))}
                    </select>
                    {siteId && (
                        <GhostButton asButton icon={<CopyIcon />} onClick={copyEmbedCode} size="small" title="复制接入代码">
                            接入代码
                        </GhostButton>
                    )}
                </div>
                <div className={styles.rightControls}>
                    <PillSelect
                        name="range"
                        onChange={(v) => setRange(v as DateRange)}
                        options={[
                            { value: '7d', label: '7 天' },
                            { value: '30d', label: '30 天' },
                            { value: '90d', label: '90 天' },
                        ]}
                        value={range}
                    />
                    <PillSelect
                        name="analytics-tab"
                        onChange={(v) => { setTab(v as 'overview' | 'visits'); setVisitsPage(1); }}
                        options={[
                            { value: 'overview', label: '统计概览' },
                            { value: 'visits', label: '访问记录' },
                        ]}
                        value={tab}
                    />
                </div>
            </div>

            {tab === 'overview' && (
                loading && !data ? (
                    <div className={styles.loading}>加载中...</div>
                ) : !siteId ? (
                    <div className={styles.empty}>
                        <p>请先在「站点管理」中创建站点，获取接入代码嵌入目标网站。</p>
                        <GhostButton asButton href="/admin/analytics/sites" size="medium" variant="primary">
                            前往站点管理
                        </GhostButton>
                    </div>
                ) : (
                    <>
                        {/* 概览卡片 */}
                        <div className={styles.cards}>
                            <div className={styles.card}>
                                <p className={styles.cardLabel}>浏览量 (PV)</p>
                                <p className={styles.cardValue}>{formatNum(overview?.pv || 0)}</p>
                                <ChangeIndicator value={overview?.pvChange || 0} />
                            </div>
                            <div className={styles.card}>
                                <p className={styles.cardLabel}>访客数 (UV)</p>
                                <p className={styles.cardValue}>{formatNum(overview?.uv || 0)}</p>
                                <ChangeIndicator value={overview?.uvChange || 0} />
                            </div>
                            <div className={styles.card}>
                                <p className={styles.cardLabel}>跳出率</p>
                                <p className={styles.cardValue}>{overview?.bounceRate || 0}%</p>
                            </div>
                            <div className={styles.card}>
                                <p className={styles.cardLabel}>平均停留</p>
                                <p className={styles.cardValue}>{formatDuration(overview?.avgDuration || 0)}</p>
                            </div>
                        </div>

                        {/* PV/UV 趋势图 */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>流量趋势</h3>
                            <div className={styles.chartContainer}>
                                {trend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.mutedSubtle} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={formatDateShort}
                                                tick={{ fontSize: 12, fill: CHART_COLORS.muted }}
                                                axisLine={{ stroke: CHART_COLORS.border }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: CHART_COLORS.muted }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={formatNum}
                                            />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="pv"
                                                name="pv"
                                                stroke={CHART_COLORS.primary}
                                                fill={CHART_COLORS.primarySubtle}
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="uv"
                                                name="uv"
                                                stroke={CHART_COLORS.muted}
                                                fill="none"
                                                strokeWidth={1.5}
                                                strokeDasharray="4 2"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className={styles.chartEmpty}>暂无趋势数据</div>
                                )}
                            </div>
                            <div className={styles.legend}>
                                <span className={styles.legendItem}>
                                    <span className={styles.legendLine} style={{ background: CHART_COLORS.primary }} /> 浏览量
                                </span>
                                <span className={styles.legendItem}>
                                    <span className={`${styles.legendLine} ${styles.legendLineDashed}`} style={{ background: CHART_COLORS.muted }} /> 访客数
                                </span>
                            </div>
                        </div>

                        {/* 双列：热门页面 + 来源排行 */}
                        <div className={styles.twoCol}>
                            {/* 热门页面 */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>热门页面 TOP 10</h3>
                                {pages.length > 0 ? (
                                    <div className={styles.rankList}>
                                        {pages.map((page, i) => (
                                            <div key={page.path} className={styles.rankItem}>
                                                <span className={styles.rankIndex}>{i + 1}</span>
                                                <div className={styles.rankContent}>
                                                    <span className={styles.rankLabel}>{page.path}</span>
                                                    <div className={styles.rankBarWrap}>
                                                        <div
                                                            className={styles.rankBar}
                                                            style={{ width: `${(page.pv / maxPagePv) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className={styles.rankValue}>{formatNum(page.pv)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.chartEmpty}>暂无页面数据</div>
                                )}
                            </div>

                            {/* 来源排行 */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>来源排行</h3>
                                {sources.length > 0 ? (
                                    <div className={styles.sourceList}>
                                        {sources.map((src) => (
                                            <div key={src.source} className={styles.sourceItem}>
                                                <span className={styles.sourceName}>{src.source}</span>
                                                <div className={styles.sourceBarWrap}>
                                                    <div
                                                        className={styles.sourceBar}
                                                        style={{ width: `${src.percent}%` }}
                                                    />
                                                </div>
                                                <span className={styles.sourcePercent}>{src.percent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.chartEmpty}>暂无来源数据</div>
                                )}
                            </div>
                        </div>

                        {/* 设备分布 */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>设备分布</h3>
                            {devices.length > 0 ? (
                                <div className={styles.deviceList}>
                                    {devices.map((dev) => (
                                        <div key={dev.device} className={styles.deviceItem}>
                                            <div className={styles.deviceInfo}>
                                                <span className={styles.deviceName}>{dev.device}</span>
                                                <span className={styles.deviceCount}>{formatNum(dev.count)} 次</span>
                                            </div>
                                            <div className={styles.deviceBarWrap}>
                                                <div
                                                    className={styles.deviceBar}
                                                    style={{ width: `${dev.percent}%` }}
                                                />
                                            </div>
                                            <span className={styles.devicePercent}>{dev.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.chartEmpty}>暂无设备数据</div>
                            )}
                        </div>
                    </>
                )
            )}
            {tab === 'visits' && (
                <>
                    {!siteId ? (
                        <div className={styles.empty}>
                            <p>请先在「站点管理」中创建站点，获取接入代码嵌入目标网站。</p>
                            <GhostButton asButton href="/admin/analytics/sites" size="medium" variant="primary">
                                前往站点管理
                            </GhostButton>
                        </div>
                    ) : (
                        <>
                            <DataTable
                                columns={visitColumns}
                                emptyText={visitsLoading ? '加载中...' : '暂无访问记录'}
                                rowKey={(v) => v.id}
                                rows={visits.data}
                            />
                            <Pagination
                                current={visitsPage}
                                onPageChange={setVisitsPage}
                                total={Math.max(1, Math.ceil(visits.total / visitsPageSize))}
                            />
                        </>
                    )}
                </>
            )}
        </>
    );
}
