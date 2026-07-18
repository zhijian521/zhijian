/**
 * @api 统计站点管理
 * @group admin
 * @auth admin
 * @method GET    站点列表
 * @method POST   创建站点
 * @method PUT    更新站点
 * @method DELETE 删除站点
 * @returns GET success<{ data: TrackSite[]; total: number }> | POST/PUT success<{ site: TrackSite | null }> | DELETE success<null> | fail
 */

import { NextResponse } from 'next/server';

import { listTrackSites, createTrackSite, updateTrackSite, deleteTrackSite } from '@/lib/domain/track-sites';
import { BizCode, fail, success } from '@/lib/core/api-response';
import { withAdmin } from '@/lib/core/with-admin';

/*==
  站点管理 API
  GET  /api/admin/analytics/sites  — 站点列表
  POST /api/admin/analytics/sites  — 创建站点
  PUT  /api/admin/analytics/sites  — 更新站点
  DELETE /api/admin/analytics/sites — 删除站点
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

/*-- PUT: 更新站点 --*/
export const PUT = withAdmin(async (request) => {
    let body: { id?: string; name?: string; domain?: string; status?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const { id, name, domain, status } = body;
    if (!id) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少站点 ID。'), { status: 400 });
    }

    const fields: Partial<Pick<import('@/lib/domain/track-sites').TrackSite, 'name' | 'domain' | 'status'>> = {};
    if (name !== undefined) fields.name = name.trim();
    if (domain !== undefined) fields.domain = domain.trim();
    if (status !== undefined) {
        if (!['active', 'paused'].includes(status)) {
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的状态值。'), { status: 400 });
        }
        fields.status = status as 'active' | 'paused';
    }

    try {
        const site = await updateTrackSite(id, fields);
        return NextResponse.json(success({ site }, '站点更新成功。'));
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(fail(BizCode.CONFLICT, '该域名已被占用。'), { status: 409 });
        }
        console.error('更新站点失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '更新站点失败。'), { status: 500 });
    }
});

/*-- DELETE: 删除站点（软删除，id 从 query 参数读取） --*/
export const DELETE = withAdmin(async (request) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少站点 ID。'), { status: 400 });
    }

    try {
        const deleted = await deleteTrackSite(id);
        if (!deleted) {
            return NextResponse.json(fail(BizCode.NOT_FOUND, '站点不存在。'), { status: 404 });
        }
        return NextResponse.json(success(null, '站点已删除。'));
    } catch (err) {
        console.error('删除站点失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '删除站点失败。'), { status: 500 });
    }
});
