import { NextRequest, NextResponse } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { BizCode, fail, success } from '@/lib/api-response';
import { listUploads } from '@/lib/uploads';

/*== 图片列表接口（GET）。 ==*/
export async function GET(request: NextRequest) {
    if (!requireAdminFromRequest(request)) {
        return NextResponse.json(fail(BizCode.UNAUTHORIZED, '未登录或登录已失效。'), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20));

    try {
        const result = await listUploads(page, pageSize);
        return NextResponse.json(success(result));
    } catch (err) {
        console.error('获取图片列表失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取图片列表失败。'), { status: 500 });
    }
}
