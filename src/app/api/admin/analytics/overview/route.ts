import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { BizCode, fail, success } from '@/lib/api-response';
import { getOverview, getTrend, getPageRank, getSources, getDevices, getLanguages, getBrowsers, getOS, getCountries, getRegions, getEntryPages, getExitPages, ensureAggregated } from '@/lib/analytics';
import type { DateRange } from '@/lib/analytics';

/*== 仪表盘概览数据 API ==*/
export async function GET(request: NextRequest) {
    const admin = requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

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
        // 先聚合一次，后续查询共享结果，不再重复 ensureAggregated
        await ensureAggregated(siteId, range);

        const overview = await getOverview(siteId, range, true);
        const trend = await getTrend(siteId, range, true);
        const pages = await getPageRank(siteId, range, 10, true);
        const sources = await getSources(siteId, range);
        const devices = await getDevices(siteId, range);
        const languages = await getLanguages(siteId, range);
        const countries = await getCountries(siteId, range);
        const regions = await getRegions(siteId, range);
        const browsers = await getBrowsers(siteId, range);
        const os = await getOS(siteId, range);
        const entryPages = await getEntryPages(siteId, range);
        const exitPages = await getExitPages(siteId, range);

        return NextResponse.json(success({
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
        }));
    } catch (err) {
        console.error('获取分析数据失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取分析数据失败。'), { status: 500 });
    }
}