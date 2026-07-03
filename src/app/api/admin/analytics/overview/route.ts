import { NextResponse } from 'next/server';

import { BizCode, fail, success } from '@/lib/api-response';
import { withAdmin } from '@/lib/with-admin';
import { getOverview, getTrend, getPageRank, getSources, getDevices, getLanguages, getBrowsers, getOS, getCountries, getRegions, getEntryPages, getExitPages, ensureAggregated } from '@/lib/analytics';
import type { DateRange } from '@/lib/analytics';

/*== 仪表盘概览数据 API ==*/
export const GET = withAdmin(async (request) => {
    const url = new URL(request.url);
    const siteId = url.searchParams.get('siteId') || '';
    const range = (url.searchParams.get('range') || '7d') as DateRange;

    if (!siteId) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少 siteId 参数。'), { status: 400 });
    }

    if (!['7d', '30d', '90d'].includes(range)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的时间范围。'), { status: 400 });
    }

    try {
        // 先聚合，后续查询共享结果
        await ensureAggregated(siteId, range);

        // 聚合后所有查询互不依赖，并行执行
        const [overview, trend, pages, sources, devices, languages, countries, regions, browsers, os, entryPages, exitPages] = await Promise.all([
            getOverview(siteId, range, true),
            getTrend(siteId, range, true),
            getPageRank(siteId, range, 10, true),
            getSources(siteId, range),
            getDevices(siteId, range),
            getLanguages(siteId, range),
            getCountries(siteId, range),
            getRegions(siteId, range),
            getBrowsers(siteId, range),
            getOS(siteId, range),
            getEntryPages(siteId, range),
            getExitPages(siteId, range),
        ]);

        return NextResponse.json(
            success({
                overview,
                trend,
                pages,
                sources,
                devices,
                languages,
                countries,
                regions,
                browsers,
                os,
                entryPages,
                exitPages,
            })
        );
    } catch (err) {
        console.error('获取分析数据失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取分析数据失败。'), { status: 500 });
    }
});
