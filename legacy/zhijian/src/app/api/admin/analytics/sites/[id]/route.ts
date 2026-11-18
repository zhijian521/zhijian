/**
 * @api 统计站点编辑/删除
 * @group admin
 * @auth admin
 * @method PUT    更新站点
 * @method DELETE 删除站点
 * @returns PUT success<{ site: TrackSite | null }> | DELETE success<null> | fail
 */

import { NextResponse } from 'next/server';

import { updateTrackSite, deleteTrackSite } from '@/lib/domain/track-sites';
import type { TrackSite } from '@/lib/domain/track-sites';
import { BizCode, fail, success } from '@/lib/core/api-response';
import { withAdmin } from '@/lib/core/with-admin';

/*==
  站点管理 API（路径参数风格）
  PUT    /api/admin/analytics/sites/[id] — 更新站点
  DELETE /api/admin/analytics/sites/[id] — 删除站点（软删除）
==*/

/*-- PUT: 更新站点 --*/
export const PUT = withAdmin(async (request, _admin, { params }) => {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少站点 ID。'), { status: 400 });
    }

    let body: { name?: string; domain?: string; status?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const { name, domain, status } = body;

    const fields: Partial<Pick<TrackSite, 'name' | 'domain' | 'status'>> = {};
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

/*-- DELETE: 删除站点（软删除，id 从路径参数读取） --*/
export const DELETE = withAdmin(async (_request, _admin, { params }) => {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
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
