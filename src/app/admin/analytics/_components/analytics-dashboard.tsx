'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell,
    ResponsiveContainer,
} from 'recharts';
import type { DateRange, OverviewData, TrendPoint, PageRankItem, SourceItem, DeviceItem, LanguageItem, GeoItem, BrowserItem, OSItem, EntryExitItem } from '@/lib/analytics';

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

interface AnalyticsData {
    overview: OverviewData;
    trend: TrendPoint[];
    pages: PageRankItem[];
    sources: SourceItem[];
    devices: DeviceItem[];
    languages: LanguageItem[];
    countries: GeoItem[];
    regions: GeoItem[];
    browsers: BrowserItem[];
    os: OSItem[];
    entryPages: EntryExitItem[];
    exitPages: EntryExitItem[];
}

interface VisitRecord {
    id: number;
    path: string;
    title: string;
    referrer: string;
    device: string;
    visitorId: string;
    isNew: boolean;
    ip: string;
    location: string;
    duration: number | null;
    createdAt: string;
}

interface SiteOption { id: string; name: string; }

/*== 工具函数 ==*/

function formatNum(n: number): string {
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
}

function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '-';
    const s = Math.round(seconds);
    if (s >= 60) {
        const m = Math.floor(s / 60);
        const rem = s % 60;
        return `${m}m ${rem}s`;
    }
    return `${s}s`;
}

function formatDateShort(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
    return dateStr;
}

/*== 色板 ==*/

const CHART_COLORS = {
    primary: '#9f000f',
    primarySubtle: '#f5e6e8',
    muted: '#6f655c',
    mutedSubtle: '#e7ddd1',
};

/* 三组环形图各自独立色板 */
const DEVICE_PALETTE = ['#9f000f', '#c4616d', '#d9969e', '#efcdd2'];
const BROWSER_PALETTE = ['#4a6741', '#6d8f64', '#96b68e', '#c2dbc0'];
const OS_PALETTE = ['#5c4a2a', '#8b7355', '#b5a07a', '#d9cbb0'];

/*== 变化指示器 ==*/

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

/*== 环形图组件 ==*/

interface DonutEntry { name: string; value: number; percent: number; }

function DonutChart({ data, palette }: { data: DonutEntry[]; palette: string[] }) {
    return (
        <div className={styles.donutWrap}>
            <div className={styles.donutSvg}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="52%"
                            outerRadius="78%"
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                            paddingAngle={1}
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={palette[i % palette.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(val: any, name: any) => [formatNum(Number(val)), String(name)]}
                            contentStyle={{ border: '1px solid #e7ddd1', background: '#fbf9f9', fontSize: 12, padding: '4px 8px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className={styles.donutLegend}>
                {data.map((d, i) => (
                    <div key={d.name} className={styles.donutLegendRow}>
                        <span className={styles.donutDot} style={{ background: palette[i % palette.length] }} />
                        <span className={styles.donutName}>{d.name}</span>
                        <span className={styles.donutPct}>{d.percent}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/*== 趋势图 Tooltip ==*/

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

/*== 主组件 ==*/

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

    const fetchData = useCallback(async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const res = await api.get<AnalyticsData>('/admin/analytics/overview', { siteId, range });
            if (res.code === 0 && res.data) setData(res.data);
        } catch (err) {
            console.error('获取分析数据失败：', err);
        } finally {
            setLoading(false);
        }
    }, [siteId, range]);

    useEffect(() => { fetchSites(); }, [fetchSites]);
    useEffect(() => { fetchData(); }, [fetchData]);

    async function copyEmbedCode() {
        if (!siteId) return;
        try {
            await navigator.clipboard.writeText(getEmbedScript(siteId));
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
                siteId, range, page: visitsPage, pageSize: visitsPageSize,
            });
            if (res.code === 0 && res.data) setVisits(res.data);
        } catch (err) {
            console.error('获取访问记录失败：', err);
        } finally {
            setVisitsLoading(false);
        }
    }, [siteId, range, visitsPage]);

    useEffect(() => { if (tab === 'visits') fetchVisits(); }, [tab, fetchVisits]);

    function formatVisitTime(isoStr: string): string {
        try {
            const d = new Date(isoStr);
            return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        } catch { return isoStr; }
    }

    const deviceTagVariant = (d: string): 'primary' | 'default' | 'outlined' => {
        if (d === 'Mobile') return 'primary';
        if (d === 'Tablet') return 'outlined';
        return 'default';
    };

    const visitColumns: DataColumn<VisitRecord>[] = [
        { header: '页面', render: (v) => <div className={styles.visitPageCell}><span className={styles.visitPath}>{v.path}</span>{v.title && <span className={styles.visitTitle}>{v.title}</span>}</div> },
        { header: '来源', hideBelow: 'sm', render: (v) => <span className={styles.visitMuted}>{v.referrer}</span> },
        { header: '设备', hideBelow: 'md', render: (v) => <Tag size="mini" variant={deviceTagVariant(v.device)}>{v.device}</Tag> },
        { header: '访客', hideBelow: 'lg', render: (v) => <span className={styles.visitMuted}>{v.visitorId}{v.isNew && <Tag size="mini" variant="primary" className={styles.newTag}>新</Tag>}</span> },
        { header: '位置', hideBelow: 'md', render: (v) => <span className={styles.visitMuted}>{v.location}</span> },
        { header: '停留', hideBelow: 'lg', render: (v) => <span className={styles.visitMuted}>{v.duration != null ? `${v.duration}s` : '-'}</span> },
        { header: '时间', render: (v) => <span className={styles.visitMuted}>{formatVisitTime(v.createdAt)}</span> },
    ];

    /* 入口/出口页面表格列 */
    const entryExitColumns: DataColumn<EntryExitItem>[] = [
        { header: '页面路径', render: (r) => <span className={styles.tablePath}>{r.path}</span> },
        { header: '次数', render: (r) => <span className={styles.tableNum}>{r.count}</span> },
        { header: '占比', render: (r) => <span className={styles.tableNum}>{r.percent}%</span> },
    ];

    /*-- 提取数据 --*/
    const overview = data?.overview;
    const trend = data?.trend || [];
    const pages = data?.pages || [];
    const sources = data?.sources || [];
    const devices = data?.devices || [];
    const languages = data?.languages || [];
    const countries = data?.countries || [];
    const regions = data?.regions || [];
    const browsers = data?.browsers || [];
    const osList = data?.os || [];
    const entryPages = data?.entryPages || [];
    const exitPages = data?.exitPages || [];
    const maxPagePv = pages.length > 0 ? Math.max(...pages.map(p => p.pv)) : 1;

    return (
        <>
            <AdminPageHeader
                description="查看站点访问数据，了解流量趋势和用户行为。"
                eyebrow="Analytics"
                tag={sites.length > 0 ? `${sites.length} 个站点` : undefined}
                title="网站统计"
            />

            {/* 控制栏 */}
            <div className={styles.controls}>
                <div className={styles.siteSelect}>
                    <select className={styles.select} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                        {sites.length === 0 && <option value="">暂无站点</option>}
                        {sites.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                    </select>
                    {siteId && (
                        <GhostButton asButton icon={<CopyIcon />} onClick={copyEmbedCode} size="small" title="复制接入代码">接入代码</GhostButton>
                    )}
                </div>
                <div className={styles.rightControls}>
                    <PillSelect name="range" onChange={(v) => setRange(v as DateRange)} options={[{ value: '7d', label: '7 天' }, { value: '30d', label: '30 天' }, { value: '90d', label: '90 天' }]} value={range} />
                    <PillSelect name="analytics-tab" onChange={(v) => { setTab(v as 'overview' | 'visits'); setVisitsPage(1); }} options={[{ value: 'overview', label: '统计概览' }, { value: 'visits', label: '访问记录' }]} value={tab} />
                </div>
            </div>

            {tab === 'overview' && (
                loading && !data ? (
                    <div className={styles.loading}>加载中...</div>
                ) : !siteId ? (
                    <div className={styles.empty}>
                        <p>请先在「站点管理」中创建站点，获取接入代码嵌入目标网站。</p>
                        <GhostButton asButton href="/admin/analytics/sites" size="medium" variant="primary">前往站点管理</GhostButton>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {/* == 1. 概览指标 — 一行五个 == */}
                        <div className={styles.metricsRow}>
                            <div className={styles.metric}>
                                <p className={styles.metricLabel}>浏览量</p>
                                <p className={styles.metricValue}>{formatNum(overview?.pv || 0)}</p>
                                <ChangeIndicator value={overview?.pvChange || 0} />
                            </div>
                            <div className={styles.metric}>
                                <p className={styles.metricLabel}>访客数</p>
                                <p className={styles.metricValue}>{formatNum(overview?.uv || 0)}</p>
                                <ChangeIndicator value={overview?.uvChange || 0} />
                            </div>
                            <div className={styles.metric}>
                                <p className={styles.metricLabel}>跳出率</p>
                                <p className={styles.metricValue}>{overview?.bounceRate || 0}%</p>
                            </div>
                            <div className={styles.metric}>
                                <p className={styles.metricLabel}>平均停留</p>
                                <p className={styles.metricValue}>{formatDuration(overview?.avgDuration || 0)}</p>
                            </div>
                            <div className={styles.metric}>
                                <p className={styles.metricLabel}>新访客</p>
                                <p className={styles.metricValue}>{overview?.newVisitorRate || 0}%</p>
                            </div>
                        </div>

                        {/* == 2. 流量趋势 — 全宽，图例在右上 == */}
                        <div className={styles.cardWide}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>流量趋势</h3>
                                <div className={styles.legend}>
                                    <span className={styles.legendItem}><span className={styles.legendLine} style={{ background: CHART_COLORS.primary }} /> 浏览量</span>
                                    <span className={styles.legendItem}><span className={`${styles.legendLine} ${styles.legendLineDashed}`} style={{ background: CHART_COLORS.muted }} /> 访客数</span>
                                </div>
                            </div>
                            <div className={styles.chartArea}>
                                {trend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.mutedSubtle} />
                                            <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={{ stroke: CHART_COLORS.mutedSubtle }} tickLine={false} />
                                            <YAxis tick={{ fontSize: 12, fill: CHART_COLORS.muted }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area type="monotone" dataKey="pv" name="pv" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primarySubtle} strokeWidth={2} />
                                            <Area type="monotone" dataKey="uv" name="uv" stroke={CHART_COLORS.muted} fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className={styles.chartEmpty}>暂无趋势数据</div>
                                )}
                            </div>
                        </div>

                        {/* == 3. 热门页面 + 来源排行 — 一行各半 == */}
                        <div className={styles.rowPair}>
                            <div className={styles.pairCard}>
                                <h3 className={styles.cardTitle}>热门页面 TOP 10</h3>
                                {pages.length > 0 ? (
                                    <div className={styles.rankList}>
                                        {pages.map((page, i) => (
                                            <div key={page.path} className={styles.rankItem}>
                                                <span className={styles.rankIdx}>{i + 1}</span>
                                                <div className={styles.rankBody}>
                                                    <span className={styles.rankLabel}>{page.path}</span>
                                                    <div className={styles.barTrack}>
                                                        <div className={styles.barFill} style={{ width: `${(page.pv / maxPagePv) * 100}%` }} />
                                                    </div>
                                                    <span className={styles.rankMeta}>跳出 {page.bounceRate}% · 停留 {formatDuration(page.avgDuration)}</span>
                                                </div>
                                                <span className={styles.rankNum}>{formatNum(page.pv)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className={styles.chartEmpty}>暂无数据</div>}
                            </div>

                            <div className={styles.pairCard}>
                                <h3 className={styles.cardTitle}>来源排行</h3>
                                {sources.length > 0 ? (
                                    <div className={styles.sourceList}>
                                        {sources.map((src) => (
                                            <div key={src.source} className={styles.sourceRow}>
                                                <span className={styles.sourceName}>{src.source}</span>
                                                <div className={styles.sourceBarTrack}>
                                                    <div className={styles.sourceBarFill} style={{ width: `${src.percent}%` }} />
                                                </div>
                                                <span className={styles.sourcePct}>{src.percent}%</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className={styles.chartEmpty}>暂无数据</div>}
                            </div>
                        </div>

                        {/* == 4. 设备/浏览器/OS — 一行三个环形图 == */}
                        <div className={styles.cardThird}>
                            <h3 className={styles.cardTitle}>设备分布</h3>
                            {devices.length > 0 ? (
                                <DonutChart data={devices.map((d) => ({ name: d.device, value: d.count, percent: d.percent }))} palette={DEVICE_PALETTE} />
                            ) : <div className={styles.chartEmpty}>暂无数据</div>}
                        </div>

                        <div className={styles.cardThird}>
                            <h3 className={styles.cardTitle}>浏览器</h3>
                            {browsers.length > 0 ? (
                                <DonutChart data={browsers.map((b) => ({ name: b.browser, value: b.count, percent: b.percent }))} palette={BROWSER_PALETTE} />
                            ) : <div className={styles.chartEmpty}>暂无数据</div>}
                        </div>

                        <div className={styles.cardThird}>
                            <h3 className={styles.cardTitle}>操作系统</h3>
                            {osList.length > 0 ? (
                                <DonutChart data={osList.map((o) => ({ name: o.os, value: o.count, percent: o.percent }))} palette={OS_PALETTE} />
                            ) : <div className={styles.chartEmpty}>暂无数据</div>}
                        </div>

                        {/* == 5. 地理 + 语言分布 — 全宽三栏 == */}
                        <div className={styles.cardWide}>
                            <h3 className={styles.cardTitle}>地理与语言分布</h3>
                            {countries.length > 0 || regions.length > 0 || languages.length > 0 ? (
                                <div className={styles.geoInner}>
                                    {countries.length > 0 && (
                                        <div className={styles.geoCol}>
                                            <p className={styles.subTitle}>国家/地区</p>
                                            <div className={styles.tagCloud}>
                                                {countries.map((c) => (
                                                    <span key={c.name} className={styles.cloudTag}>
                                                        <span className={styles.cloudName}>{c.name}</span>
                                                        <span className={styles.cloudPct}>{c.percent}%</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {regions.length > 0 && (
                                        <div className={styles.geoCol}>
                                            <p className={styles.subTitle}>省份/城市</p>
                                            <div className={styles.dotList}>
                                                {regions.map((r) => (
                                                    <div key={r.name} className={styles.dotRow}>
                                                        <span className={styles.dotMark} />
                                                        <span className={styles.dotName}>{r.name}</span>
                                                        <span className={styles.dotCnt}>{formatNum(r.count)}</span>
                                                        <span className={styles.dotPct}>{r.percent}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {languages.length > 0 && (
                                        <div className={styles.geoCol}>
                                            <p className={styles.subTitle}>语言</p>
                                            <div className={styles.dotList}>
                                                {languages.map((lang) => (
                                                    <div key={lang.language} className={styles.dotRow}>
                                                        <span className={styles.dotMark} />
                                                        <span className={styles.dotName}>{lang.language}</span>
                                                        <span className={styles.dotCnt}>{formatNum(lang.count)}</span>
                                                        <span className={styles.dotPct}>{lang.percent}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : <div className={styles.chartEmpty}>暂无数据</div>}
                        </div>

                        {/* == 6. 入口/出口页面 — 一行各半，DataTable == */}
                        <div className={styles.rowPair}>
                            <div className={styles.pairCard}>
                                <h3 className={styles.cardTitle}>入口页面 TOP 10</h3>
                                <DataTable
                                    columns={entryExitColumns}
                                    emptyText="暂无数据"
                                    rowKey={(r) => r.path}
                                    rows={entryPages}
                                />
                            </div>

                            <div className={styles.pairCard}>
                                <h3 className={styles.cardTitle}>出口页面 TOP 10</h3>
                                <DataTable
                                    columns={entryExitColumns}
                                    emptyText="暂无数据"
                                    rowKey={(r) => r.path}
                                    rows={exitPages}
                                />
                            </div>
                        </div>
                    </div>
                )
            )}

            {tab === 'visits' && (
                !siteId ? (
                    <div className={styles.empty}>
                        <p>请先在「站点管理」中创建站点，获取接入代码嵌入目标网站。</p>
                        <GhostButton asButton href="/admin/analytics/sites" size="medium" variant="primary">前往站点管理</GhostButton>
                    </div>
                ) : (
                    <>
                        <DataTable columns={visitColumns} emptyText={visitsLoading ? '加载中...' : '暂无访问记录'} rowKey={(v) => v.id} rows={visits.data} />
                        <Pagination current={visitsPage} onPageChange={setVisitsPage} total={Math.max(1, Math.ceil(visits.total / visitsPageSize))} />
                    </>
                )
            )}
        </>
    );
}
