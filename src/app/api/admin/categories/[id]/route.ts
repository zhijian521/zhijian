import { NextResponse } from 'next/server';

import { getCategoryById, updateCategory, deleteCategory } from '@/lib/categories';
import { BizCode, fail, success } from '@/lib/api-response'
import { withAdmin } from '@/lib/with-admin';

/*==
  单个分类操作：PUT / DELETE。均需管理员权限。
==*/

/*-- PUT: 编辑分类 --*/
export const PUT = withAdmin(async (request, _admin, { params }) => {
    const { id } = await params;
    const categoryId = Number(id);
    if (!Number.isFinite(categoryId)) return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的分类 ID。'), { status: 400 });

    const existing = await getCategoryById(categoryId);
    if (!existing) return NextResponse.json(fail(BizCode.CATEGORY_NOT_FOUND, '分类不存在。'), { status: 404 });

    let body: { name?: string; slug?: string; sort_order?: number };
    try { body = await request.json(); } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const fields: Partial<Pick<typeof existing, 'name' | 'slug' | 'sort_order'>> = {};

    if (body.name !== undefined) {
        const name = body.name.trim();
        if (!name) return NextResponse.json(fail(BizCode.BAD_REQUEST, '分类名不能为空。'), { status: 400 });
        fields.name = name;
    }
    if (body.slug !== undefined) {
        const slug = body.slug.trim();
        if (!slug) return NextResponse.json(fail(BizCode.BAD_REQUEST, 'Slug 不能为空。'), { status: 400 });
        fields.slug = slug;
    }
    if (body.sort_order !== undefined) {
        fields.sort_order = Number(body.sort_order);
    }

    try {
        const updated = await updateCategory(categoryId, fields);
        return NextResponse.json(success({ category: updated }, '分类更新成功。'));
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY')
            return NextResponse.json(fail(BizCode.CATEGORY_EXISTS, 'Slug 已被占用。'), { status: 409 });
        console.error('更新分类失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '更新分类失败。'), { status: 500 });
    }
});

/*-- DELETE: 删除分类 --*/
export const DELETE = withAdmin(async (_request, _admin, { params }) => {
    const { id } = await params;
    const categoryId = Number(id);
    if (!Number.isFinite(categoryId)) return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的分类 ID。'), { status: 400 });

    try {
        const deleted = await deleteCategory(categoryId);
        if (!deleted) return NextResponse.json(fail(BizCode.CATEGORY_NOT_FOUND, '分类不存在。'), { status: 404 });
        return NextResponse.json(success(null, '分类已删除。'));
    } catch (err) {
        console.error('删除分类失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '删除分类失败。'), { status: 500 });
    }
});
