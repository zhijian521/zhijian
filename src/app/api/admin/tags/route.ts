import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireAdminFromRequest } from '@/lib/auth';
import { listTags, createTag } from '@/lib/tags';
import { BizCode, fail, success } from '@/lib/api-response';

/*==
  标签列表（GET） / 创建标签（POST）
  均需管理员权限。
==*/

/*-- GET: 全部标签列表 --*/
export async function GET(request: NextRequest) {
    const admin = requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

    try {
        const tags = await listTags();
        return NextResponse.json(success({ data: tags, total: tags.length }));
    } catch (err) {
        console.error('获取标签列表失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取标签列表失败。'), { status: 500 });
    }
}

/*-- POST: 创建标签 --*/
export async function POST(request: NextRequest) {
    const admin = requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

    let body: { name?: string; slug?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const name = body.name?.trim() || '';
    const slug = body.slug?.trim() || '';

    if (!name) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '标签名不能为空。'), { status: 400 });
    }
    if (!slug) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, 'Slug 不能为空。'), { status: 400 });
    }

    try {
        const tag = await createTag({ name, slug });
        return NextResponse.json(success({ tag }, '标签创建成功。'), { status: 201 });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(fail(BizCode.TAG_EXISTS, 'Slug 已被占用。'), { status: 409 });
        }
        console.error('创建标签失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '创建标签失败。'), { status: 500 });
    }
}
