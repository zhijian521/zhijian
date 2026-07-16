/*============================================================================
  analytics-dashboard.types — 统计仪表盘共享数据类型

  定义仪表盘接口响应结构，供数据编排容器和概览展示区复用，
  避免子组件反向依赖父组件。
============================================================================*/

import type {
    BrowserItem,
    DeviceItem,
    EntryExitItem,
    GeoItem,
    LanguageItem,
    OSItem,
    OverviewData,
    PageRankItem,
    SourceItem,
    TrendPoint,
} from '@/lib/domain/analytics';

export interface AnalyticsData {
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

export interface AnalyticsSiteOption {
    id: string;
    name: string;
}
