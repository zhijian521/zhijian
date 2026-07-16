'use client';

/*============================================================================
  analytics-overview — 统计概览展示区

  纯展示概览指标、趋势、排行和分布数据，不负责请求或交互状态。
  由 AnalyticsDashboard 传入一次完整统计结果，便于跳过无关状态更新。
============================================================================*/

import { memo } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { TrendingDownIcon, TrendingUpIcon } from '@/components/ui/icons';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import type { EntryExitItem } from '@/lib/domain/analytics';

import type { AnalyticsData } from './analytics-dashboard.types';
import styles from './analytics-overview.module.css';

/*== 图表配置 ==*/

const CHART_COLORS = {
    primary: '#9f000f',
    primarySubtle: '#f5e6e8',
    muted: '#6f655c',
    mutedSubtle: '#e7ddd1',
};

const DEVICE_PALETTE = ['#9f000f', '#c4616d', '#d9969e', '#efcdd2'];
const BROWSER_PALETTE = ['#4a6741', '#6d8f64', '#96b68e', '#c2dbc0'];
const OS_PALETTE = ['#5c4a2a', '#8b7355', '#b5a07a', '#d9cbb0'];

const ENTRY_EXIT_COLUMNS: DataColumn<EntryExitItem>[] = [
    { header: '页面路径', render: (item) => <span className={styles.tablePath}>{item.path}</span> },
    { header: '次数', render: (item) => <span className={styles.tableNum}>{item.count}</span> },
    { header: '占比', render: (item) => <span className={styles.tableNum}>{item.percent}%</span> },
];

/*== 工具函数 ==*/

function formatNum(value: number): string {
    if (value >= 10000) return (value / 10000).toFixed(1) + '万';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
    return String(value);
}

function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return '-';
    const roundedSeconds = Math.round(seconds);
    if (roundedSeconds >= 60) {
        const minutes = Math.floor(roundedSeconds / 60);
        const remainder = roundedSeconds % 60;
        return `${minutes}m ${remainder}s`;
    }
    return `${roundedSeconds}s`;
}

function formatDateShort(date: string): string {
    const parts = date.split('-');
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
    return date;
}

/*== 图表原子组件 ==*/

function ChangeIndicator({ value }: { value: number }) {
    if (value === 0) return <span className={styles.changeNeutral}>-</span>;

    const isUp = value > 0;
    return (
        <span className={`${styles.change} ${isUp ? styles.changeUp : styles.changeDown}`}>
            {isUp ? (
                <TrendingUpIcon className={styles.changeIcon} />
            ) : (
                <TrendingDownIcon className={styles.changeIcon} />
            )}
            {isUp ? '+' : ''}
            {value}%
        </span>
    );
}

interface DonutEntry {
    name: string;
    value: number;
    percent: number;
}

function DonutChart({ data, palette }: { data: DonutEntry[]; palette: string[] }) {
    return (
        <div className={styles.donutWrap}>
            <div className={styles.donutSvg}>
                <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                        <Pie
                            cx="50%"
                            cy="50%"
                            data={data}
                            dataKey="value"
                            innerRadius="52%"
                            nameKey="name"
                            outerRadius="78%"
                            paddingAngle={1}
                            stroke="none"
                        >
                            {data.map((_, index) => (
                                <Cell fill={palette[index % palette.length]} key={index} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                border: '1px solid #e7ddd1',
                                background: '#fbf9f9',
                                fontSize: 12,
                                padding: '4px 8px',
                            }}
                            formatter={(value, name) => [formatNum(Number(value)), String(name)]}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className={styles.donutLegend}>
                {data.map((item, index) => (
                    <div className={styles.donutLegendRow} key={item.name}>
                        <span className={styles.donutDot} style={{ background: palette[index % palette.length] }} />
                        <span className={styles.donutName}>{item.name}</span>
                        <span className={styles.donutPct}>{item.percent}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface ChartTooltipPayload {
    color?: string;
    name?: string | number;
    value?: string | number;
}

interface ChartTooltipProps {
    active?: boolean;
    label?: string | number;
    payload?: ChartTooltipPayload[];
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipLabel}>{label}</p>
            {payload.map((entry, index) => (
                <p className={styles.tooltipValue} key={index} style={{ color: entry.color }}>
                    {entry.name === 'pv' ? '浏览量' : '访客数'}：{formatNum(Number(entry.value))}
                </p>
            ))}
        </div>
    );
}

/*== 概览展示 ==*/

interface AnalyticsOverviewProps {
    data: AnalyticsData;
}

export const AnalyticsOverview = memo(function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
    const maxPagePv = data.pages.length > 0 ? Math.max(...data.pages.map((page) => page.pv)) : 1;

    return (
        <div className={styles.grid}>
            <div className={styles.metricsRow}>
                <div className={styles.metric}>
                    <p className={styles.metricLabel}>浏览量</p>
                    <p className={styles.metricValue}>{formatNum(data.overview.pv || 0)}</p>
                    <ChangeIndicator value={data.overview.pvChange || 0} />
                </div>
                <div className={styles.metric}>
                    <p className={styles.metricLabel}>访客数</p>
                    <p className={styles.metricValue}>{formatNum(data.overview.uv || 0)}</p>
                    <ChangeIndicator value={data.overview.uvChange || 0} />
                </div>
                <div className={styles.metric}>
                    <p className={styles.metricLabel}>跳出率</p>
                    <p className={styles.metricValue}>{data.overview.bounceRate || 0}%</p>
                </div>
                <div className={styles.metric}>
                    <p className={styles.metricLabel}>平均停留</p>
                    <p className={styles.metricValue}>{formatDuration(data.overview.avgDuration || 0)}</p>
                </div>
                <div className={styles.metric}>
                    <p className={styles.metricLabel}>新访客</p>
                    <p className={styles.metricValue}>{data.overview.newVisitorRate || 0}%</p>
                </div>
            </div>

            <div className={styles.cardWide}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>流量趋势</h3>
                    <div className={styles.legend}>
                        <span className={styles.legendItem}>
                            <span className={styles.legendLine} style={{ background: CHART_COLORS.primary }} /> 浏览量
                        </span>
                        <span className={styles.legendItem}>
                            <span
                                className={`${styles.legendLine} ${styles.legendLineDashed}`}
                                style={{ background: CHART_COLORS.muted }}
                            />{' '}
                            访客数
                        </span>
                    </div>
                </div>
                <div className={styles.chartArea}>
                    {data.trend.length > 0 ? (
                        <ResponsiveContainer height={260} width="100%">
                            <AreaChart data={data.trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid stroke={CHART_COLORS.mutedSubtle} strokeDasharray="3 3" />
                                <XAxis
                                    axisLine={{ stroke: CHART_COLORS.mutedSubtle }}
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: CHART_COLORS.muted }}
                                    tickFormatter={formatDateShort}
                                    tickLine={false}
                                />
                                <YAxis
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: CHART_COLORS.muted }}
                                    tickFormatter={formatNum}
                                    tickLine={false}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    dataKey="pv"
                                    fill={CHART_COLORS.primarySubtle}
                                    name="pv"
                                    stroke={CHART_COLORS.primary}
                                    strokeWidth={2}
                                    type="monotone"
                                />
                                <Area
                                    dataKey="uv"
                                    fill="none"
                                    name="uv"
                                    stroke={CHART_COLORS.muted}
                                    strokeDasharray="4 2"
                                    strokeWidth={1.5}
                                    type="monotone"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.chartEmpty}>暂无趋势数据</div>
                    )}
                </div>
            </div>

            <div className={styles.rowPair}>
                <div className={styles.pairCard}>
                    <h3 className={styles.cardTitle}>热门页面 TOP 10</h3>
                    {data.pages.length > 0 ? (
                        <div className={styles.rankList}>
                            {data.pages.map((page, index) => (
                                <div className={styles.rankItem} key={page.path}>
                                    <span className={styles.rankIdx}>{index + 1}</span>
                                    <div className={styles.rankBody}>
                                        <span className={styles.rankLabel}>{page.path}</span>
                                        <div className={styles.barTrack}>
                                            <div
                                                className={styles.barFill}
                                                style={{ width: `${(page.pv / maxPagePv) * 100}%` }}
                                            />
                                        </div>
                                        <span className={styles.rankMeta}>
                                            跳出 {page.bounceRate}% · 停留 {formatDuration(page.avgDuration)}
                                        </span>
                                    </div>
                                    <span className={styles.rankNum}>{formatNum(page.pv)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.chartEmpty}>暂无数据</div>
                    )}
                </div>

                <div className={styles.pairCard}>
                    <h3 className={styles.cardTitle}>来源排行</h3>
                    {data.sources.length > 0 ? (
                        <div className={styles.sourceList}>
                            {data.sources.map((source) => (
                                <div className={styles.sourceRow} key={source.source}>
                                    <span className={styles.sourceName}>{source.source}</span>
                                    <div className={styles.sourceBarTrack}>
                                        <div className={styles.sourceBarFill} style={{ width: `${source.percent}%` }} />
                                    </div>
                                    <span className={styles.sourcePct}>{source.percent}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.chartEmpty}>暂无数据</div>
                    )}
                </div>
            </div>

            <div className={styles.cardThird}>
                <h3 className={styles.cardTitle}>设备分布</h3>
                {data.devices.length > 0 ? (
                    <DonutChart
                        data={data.devices.map((item) => ({
                            name: item.device,
                            value: item.count,
                            percent: item.percent,
                        }))}
                        palette={DEVICE_PALETTE}
                    />
                ) : (
                    <div className={styles.chartEmpty}>暂无数据</div>
                )}
            </div>

            <div className={styles.cardThird}>
                <h3 className={styles.cardTitle}>浏览器</h3>
                {data.browsers.length > 0 ? (
                    <DonutChart
                        data={data.browsers.map((item) => ({
                            name: item.browser,
                            value: item.count,
                            percent: item.percent,
                        }))}
                        palette={BROWSER_PALETTE}
                    />
                ) : (
                    <div className={styles.chartEmpty}>暂无数据</div>
                )}
            </div>

            <div className={styles.cardThird}>
                <h3 className={styles.cardTitle}>操作系统</h3>
                {data.os.length > 0 ? (
                    <DonutChart
                        data={data.os.map((item) => ({ name: item.os, value: item.count, percent: item.percent }))}
                        palette={OS_PALETTE}
                    />
                ) : (
                    <div className={styles.chartEmpty}>暂无数据</div>
                )}
            </div>

            <div className={styles.cardWide}>
                <h3 className={styles.cardTitle}>地理与语言分布</h3>
                {data.countries.length > 0 || data.regions.length > 0 || data.languages.length > 0 ? (
                    <div className={styles.geoInner}>
                        {data.countries.length > 0 ? (
                            <div className={styles.geoCol}>
                                <p className={styles.subTitle}>国家/地区</p>
                                <div className={styles.tagCloud}>
                                    {data.countries.map((country) => (
                                        <span className={styles.cloudTag} key={country.name}>
                                            <span className={styles.cloudName}>{country.name}</span>
                                            <span className={styles.cloudPct}>{country.percent}%</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        {data.regions.length > 0 ? (
                            <div className={styles.geoCol}>
                                <p className={styles.subTitle}>省份/城市</p>
                                <div className={styles.dotList}>
                                    {data.regions.map((region) => (
                                        <div className={styles.dotRow} key={region.name}>
                                            <span className={styles.dotMark} />
                                            <span className={styles.dotName}>{region.name}</span>
                                            <span className={styles.dotCnt}>{formatNum(region.count)}</span>
                                            <span className={styles.dotPct}>{region.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        {data.languages.length > 0 ? (
                            <div className={styles.geoCol}>
                                <p className={styles.subTitle}>语言</p>
                                <div className={styles.dotList}>
                                    {data.languages.map((language) => (
                                        <div className={styles.dotRow} key={language.language}>
                                            <span className={styles.dotMark} />
                                            <span className={styles.dotName}>{language.language}</span>
                                            <span className={styles.dotCnt}>{formatNum(language.count)}</span>
                                            <span className={styles.dotPct}>{language.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className={styles.chartEmpty}>暂无数据</div>
                )}
            </div>

            <div className={styles.rowPair}>
                <div className={styles.pairCard}>
                    <h3 className={styles.cardTitle}>入口页面 TOP 10</h3>
                    <DataTable
                        columns={ENTRY_EXIT_COLUMNS}
                        emptyText="暂无数据"
                        rowKey={(item) => item.path}
                        rows={data.entryPages}
                    />
                </div>
                <div className={styles.pairCard}>
                    <h3 className={styles.cardTitle}>出口页面 TOP 10</h3>
                    <DataTable
                        columns={ENTRY_EXIT_COLUMNS}
                        emptyText="暂无数据"
                        rowKey={(item) => item.path}
                        rows={data.exitPages}
                    />
                </div>
            </div>
        </div>
    );
});
