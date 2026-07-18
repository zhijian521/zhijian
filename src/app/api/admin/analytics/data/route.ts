/**
 * @api 统计原始数据
 * @group admin
 * @auth admin
 * @method DELETE 清除指定站点统计数据
 * @returns success<{ events: number; daily: number }> | fail
 */

import { NextResponse } from 'next/server';

import { clearSiteData } from '@/lib/domain/analytics';
import { BizCode, fail, success } from '@/lib/core/api-response';
import { withAdmin } from '@/lib/core/with-admin';

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
