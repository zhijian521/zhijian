import { NextResponse } from 'next/server';

import { listCategories, createCategory } from '@/lib/categories';
import { BizCode, fail, success } from '@/lib/api-response'
import { withAdmin } from '@/lib/with-admin';

/*==
  分类列表（GET） / 创建分类（POST）
  均需管理员权限。
==*/

/*-- GET: 全部分类列表 --*/
export const GET = withAdmin(async () => {
    try {
        const categories = await listCategories();
        return NextResponse.json(success({ data: categories, total: categories.length }));
    } catch (err) {
        console.error('获取分类列表失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取分类列表失败。'), { status: 500 });
    }
});

/*-- POST: 创建分类 --*/
export const POST = withAdmin(async (request) => {
    let body: { name?: string; slug?: string; sort_order?: number };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const name = body.name?.trim() || '';
    const slug = body.slug?.trim() || '';
    const sortOrder = typeof body.sort_order === 'number' ? body.sort_order : 0;

    if (!name) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '分类名不能为空。'), { status: 400 });
    }
    if (!slug) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, 'Slug 不能为空。'), { status: 400 });
    }

    try {
        const category = await createCategory({ name, slug, sort_order: sortOrder });
        return NextResponse.json(success({ category }, '分类创建成功。'), { status: 201 });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(fail(BizCode.CATEGORY_EXISTS, 'Slug 已被占用。'), { status: 409 });
        }
        console.error('创建分类失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '创建分类失败。'), { status: 500 });
    }
});
