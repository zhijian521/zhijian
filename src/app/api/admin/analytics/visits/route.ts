import { NextRequest, NextResponse } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { getVisits } from '@/lib/analytics';
import { success, fail, BizCode } from '@/lib/api-response';
import type { DateRange } from '@/lib/analytics';

const VALID_RANGES = new Set<DateRange>(['7d', '30d', '90d']);

/*== GET /admin/analytics/visits — 访问记录分页列表 ==*/
export async function GET(request: NextRequest) {
    const admin = await requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

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
}
