/*============================================================================
  站点监控分析数据层 — 门面（纯 re-export）

  物理拆分（批次 C 架构债，行为零变化）：
  - analytics-shared.ts     共享类型 + 本地日期 ↔ UTC 换算工具
  - analytics-aggregate.ts  聚合写入：aggregateDaily / ensureAggregated / clearSiteData
  - analytics-query.ts      查询读取：overview / trend / rank / 分布 / visits

  职责：
  - 日聚合：从 events 表聚合到 daily 表
  - 查询：仪表盘读取 daily 表
============================================================================*/

/*== 共享类型 ==*/
export type {
    BrowserItem,
    DateRange,
    DeviceItem,
    EntryExitItem,
    GeoItem,
    LanguageItem,
    OSItem,
    OverviewData,
    PageRankItem,
    SourceItem,
    TrendPoint,
    VisitRecord,
} from './analytics-shared';

/*== 聚合写入 ==*/
export { aggregateDaily, clearSiteData, ensureAggregated } from './analytics-aggregate';

/*== 查询读取 ==*/
export {
    getBrowsers,
    getCountries,
    getDevices,
    getEntryPages,
    getExitPages,
    getLanguages,
    getOS,
    getOverview,
    getPageRank,
    getRegions,
    getSources,
    getTrend,
    getVisits,
} from './analytics-query';
