/**
 * @api 统计站点管理
 * @group admin
 * @auth admin
 * @method GET    站点列表
 * @method POST   创建站点
 * @returns GET success<{ data: TrackSite[]; total: number }> | POST success<{ site: TrackSite | null }> | fail
 */

import { NextResponse } from 'next/server';

import { listTrackSites, createTrackSite } from '@/lib/domain/track-sites';
import { BizCode, fail, success } from '@/lib/core/api-response';
import { withAdmin } from '@/lib/core/with-admin';

/*==
  站点管理 API
  GET  /api/admin/analytics/sites  — 站点列表
  POST /api/admin/analytics/sites  — 创建站点
  PUT/DELETE 见 ./[id]/route.ts（路径参数风格）
==*/

/*-- GET: 站点列表 --*/
export const GET = withAdmin(async () => {
    try {
        const sites = await listTrackSites();
        return NextResponse.json(success({ data: sites, total: sites.length }));
    } catch (err) {
        console.error('获取站点列表失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取站点列表失败。'), { status: 500 });
    }
});

/*-- POST: 创建站点 --*/
export const POST = withAdmin(async (request) => {
    let body: { name?: string; domain?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const name = body.name?.trim() || '';
    const domain = body.domain?.trim() || '';

    if (!name) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '站点名称不能为空。'), { status: 400 });
    }
    if (!domain) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '站点域名不能为空。'), { status: 400 });
    }

    try {
        const site = await createTrackSite({ name, domain });
        return NextResponse.json(success({ site }, '站点创建成功。'), { status: 201 });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(fail(BizCode.CONFLICT, '该域名已被注册。'), { status: 409 });
        }
        console.error('创建站点失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '创建站点失败。'), { status: 500 });
    }
});
