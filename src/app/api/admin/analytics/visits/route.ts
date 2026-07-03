import { NextResponse } from 'next/server';

import { fail, BizCode, success } from '@/lib/api-response';
import { withAdmin } from '@/lib/with-admin';
import { getVisits } from '@/lib/analytics';
import type { DateRange } from '@/lib/analytics';

const VALID_RANGES = new Set<DateRange>(['7d', '30d', '90d']);

/*== GET /admin/analytics/visits — 访问记录分页列表 ==*/
export const GET = withAdmin(async (request) => {
    const { searchParams } = request.nextUrl;
    const siteId = searchParams.get('siteId');
    const rangeParam = searchParams.get('range') || '7d';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20));

    if (!siteId) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少 siteId 参数'), { status: 400 });
    }

    if (!VALID_RANGES.has(rangeParam as DateRange)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的 range 参数'), { status: 400 });
    }

    const result = await getVisits(siteId, rangeParam as DateRange, page, pageSize);

    return NextResponse.json(success(result));
});
