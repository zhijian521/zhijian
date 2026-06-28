import { NextResponse } from 'next/server';

import { clearSiteData } from '@/lib/analytics';
import { BizCode, fail, success } from '@/lib/api-response';
import { withAdmin } from '@/lib/with-admin';

/*==
  站点数据清空 API
  DELETE /api/admin/analytics/data?siteId=xxx — 清空指定站点的全部统计记录
==*/

export const DELETE = withAdmin(async (request) => {
    const url = new URL(request.url);
    const siteId = url.searchParams.get('siteId');
    if (!siteId) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少站点 ID。'), { status: 400 });
    }

    try {
        const result = await clearSiteData(siteId);
        return NextResponse.json(success(result, `已清空 ${result.events} 条事件、${result.daily} 条日聚合记录。`));
    } catch (err) {
        console.error('清空站点数据失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '清空站点数据失败。'), { status: 500 });
    }
});
