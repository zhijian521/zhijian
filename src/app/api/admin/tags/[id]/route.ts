/**
 * @api 标签编辑/删除
 * @group admin
 * @auth admin
 * @method PUT    更新标签
 * @method DELETE 删除标签
 * @returns success<Tag> | fail
 */

import { NextResponse } from 'next/server';

import { getTagById, updateTag, deleteTag } from '@/lib/tags';
import { BizCode, fail, success } from '@/lib/api-response';
import { withAdmin } from '@/lib/with-admin';

/*==
  单个标签操作：PUT / DELETE。均需管理员权限。
==*/

/*-- PUT: 编辑标签 --*/
export const PUT = withAdmin(async (request, _admin, { params }) => {
    const { id } = await params;
    const tagId = Number(id);
    if (!Number.isFinite(tagId)) return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的标签 ID。'), { status: 400 });

    const existing = await getTagById(tagId);
    if (!existing) return NextResponse.json(fail(BizCode.TAG_NOT_FOUND, '标签不存在。'), { status: 404 });

    let body: { name?: string; slug?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const fields: Partial<Pick<typeof existing, 'name' | 'slug'>> = {};

    if (body.name !== undefined) {
        const name = body.name.trim();
        if (!name) return NextResponse.json(fail(BizCode.BAD_REQUEST, '标签名不能为空。'), { status: 400 });
        fields.name = name;
    }
    if (body.slug !== undefined) {
        const slug = body.slug.trim();
        if (!slug) return NextResponse.json(fail(BizCode.BAD_REQUEST, 'Slug 不能为空。'), { status: 400 });
        fields.slug = slug;
    }

    try {
        const updated = await updateTag(tagId, fields);
        return NextResponse.json(success({ tag: updated }, '标签更新成功。'));
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') return NextResponse.json(fail(BizCode.TAG_EXISTS, 'Slug 已被占用。'), { status: 409 });
        console.error('更新标签失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '更新标签失败。'), { status: 500 });
    }
});

/*-- DELETE: 删除标签 --*/
export const DELETE = withAdmin(async (_request, _admin, { params }) => {
    const { id } = await params;
    const tagId = Number(id);
    if (!Number.isFinite(tagId)) return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的标签 ID。'), { status: 400 });

    try {
        const deleted = await deleteTag(tagId);
        if (!deleted) return NextResponse.json(fail(BizCode.TAG_NOT_FOUND, '标签不存在。'), { status: 404 });
        return NextResponse.json(success(null, '标签已删除。'));
    } catch (err) {
        console.error('删除标签失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '删除标签失败。'), { status: 500 });
    }
});
