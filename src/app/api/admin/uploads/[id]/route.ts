import { NextResponse } from 'next/server';

import { BizCode, fail, success } from '@/lib/api-response'
import { withAdmin } from '@/lib/with-admin';
import { getUploadById, deleteUploadById, updateUploadById } from '@/lib/uploads';

/*== 单个图片操作：PATCH / DELETE。 ==*/

/*-- PATCH: 修改图片名称或 alt --*/
export const PATCH = withAdmin(async (request, _admin, { params }) => {
    const { id } = await params;
    const uploadId = Number(id);
    if (!Number.isInteger(uploadId) || uploadId <= 0) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的图片 ID。'), { status: 400 });
    }

    /*-- 解析请求体 --*/
    let body: { original?: string; alt?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式错误。'), { status: 400 });
    }

    const { original, alt } = body;
    if (original !== undefined && typeof original !== 'string') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, 'original 必须为字符串。'), { status: 400 });
    }
    if (alt !== undefined && typeof alt !== 'string') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, 'alt 必须为字符串。'), { status: 400 });
    }
    if (original !== undefined && !original.trim()) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '名称不能为空。'), { status: 400 });
    }

    /*-- 检查图片是否存在 --*/
    const existing = await getUploadById(uploadId);
    if (!existing) {
        return NextResponse.json(fail(BizCode.UPLOAD_NOT_FOUND, '图片不存在。'), { status: 404 });
    }

    try {
        const updated = await updateUploadById(uploadId, {
            ...(original !== undefined ? { original: original.trim() } : {}),
            ...(alt !== undefined ? { alt } : {}),
        });
        if (!updated) {
            return NextResponse.json(fail(BizCode.INTERNAL, '更新图片失败。'), { status: 500 });
        }
        return NextResponse.json(success(updated, '修改成功。'));
    } catch (err) {
        console.error('更新图片失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '更新图片失败。'), { status: 500 });
    }
});

/*-- DELETE: 删除图片 --*/
export const DELETE = withAdmin(async (_request, _admin, { params }) => {
    const { id } = await params;
    const uploadId = Number(id);
    if (!Number.isInteger(uploadId) || uploadId <= 0) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的图片 ID。'), { status: 400 });
    }

    /*-- 先检查图片是否存在 --*/
    const existing = await getUploadById(uploadId);
    if (!existing) {
        return NextResponse.json(fail(BizCode.UPLOAD_NOT_FOUND, '图片不存在。'), { status: 404 });
    }

    try {
        const deleted = await deleteUploadById(uploadId);
        if (!deleted) {
            return NextResponse.json(fail(BizCode.INTERNAL, '删除图片失败。'), { status: 500 });
        }
        return NextResponse.json(success(null, '图片已删除。'));
    } catch (err) {
        console.error('删除图片失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '删除图片失败。'), { status: 500 });
    }
});
