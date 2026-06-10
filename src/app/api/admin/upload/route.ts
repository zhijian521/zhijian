import { NextRequest, NextResponse } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { BizCode, fail, success } from '@/lib/api-response';
import { validateImageFile, saveUpload } from '@/lib/uploads';

/*== 单图上传接口（POST）。 ==*/
export async function POST(request: NextRequest) {
    if (!requireAdminFromRequest(request)) {
        return NextResponse.json(fail(BizCode.UNAUTHORIZED, '未登录或登录已失效。'), { status: 401 });
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
        return NextResponse.json(fail(BizCode.UPLOAD_INVALID_FILE, '请选择要上传的图片。'), { status: 400 });
    }

    /*-- 校验图片格式和大小 --*/
    const validationError = validateImageFile({ type: file.type, size: file.size });
    if (validationError) {
        const bizCode = file.size > 5 * 1024 * 1024
            ? BizCode.UPLOAD_TOO_LARGE
            : BizCode.UPLOAD_INVALID_FILE;
        return NextResponse.json(fail(bizCode, validationError), { status: 400 });
    }

    try {
        const upload = await saveUpload(file);
        if (!upload) {
            return NextResponse.json(fail(BizCode.INTERNAL, '上传失败，请稍后重试。'), { status: 500 });
        }
        return NextResponse.json(success(upload, '上传成功。'), { status: 201 });
    } catch (err) {
        console.error('上传图片失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '上传失败，请稍后重试。'), { status: 500 });
    }
}
