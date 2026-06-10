import { NextRequest, NextResponse } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { BizCode, fail, success } from '@/lib/api-response';
import { getUploadById, deleteUploadById } from '@/lib/uploads';

interface RouteContext { params: Promise<{ id: string }>; }

/*== 单个图片操作：DELETE。 ==*/

/*-- DELETE: 删除图片 --*/
export async function DELETE(request: NextRequest, context: RouteContext) {
    if (!requireAdminFromRequest(request)) {
        return NextResponse.json(fail(BizCode.UNAUTHORIZED, '未登录或登录已失效。'), { status: 401 });
    }

    const { id } = await context.params;
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
}
