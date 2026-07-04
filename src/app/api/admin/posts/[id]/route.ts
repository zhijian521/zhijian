/**
 * @api 文章编辑/删除
 * @group admin
 * @auth admin
 * @method PATCH  更新文章字段
 * @method DELETE 删除文章
 * @returns success<Post> | fail
 */

import { NextResponse } from 'next/server';

import { BizCode, fail, success } from '@/lib/api-response';
import { withAdmin } from '@/lib/with-admin';
import { isPostStatus, updatePostById, deletePostById, getPostById } from '@/lib/posts';
import type { UpdatePostInput } from '@/lib/posts';

/*== 后台文章详情接口：PATCH 更新 / DELETE 删除。 ==*/

/*-- PATCH: 更新文章字段 --*/
export const PATCH = withAdmin(async (request, _admin, { params }) => {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isInteger(postId) || postId <= 0) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '文章 ID 不合法。'), { status: 400 });
    }

    let body: Partial<UpdatePostInput>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    /*-- 校验必填字段（仅当字段被传入时校验） --*/
    if (body.title !== undefined) {
        const title = body.title.trim();
        if (!title) return NextResponse.json(fail(BizCode.BAD_REQUEST, '标题不能为空。'), { status: 400 });
        body.title = title;
    }
    if (body.slug !== undefined) {
        const slug = body.slug.trim();
        if (!slug) return NextResponse.json(fail(BizCode.BAD_REQUEST, 'Slug 不能为空。'), { status: 400 });
        if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 120) {
            return NextResponse.json(fail(BizCode.BAD_REQUEST, 'Slug 只能使用小写字母、数字和中划线，且长度不超过 120 个字符。'), { status: 400 });
        }
        body.slug = slug;
    }
    if (body.summary !== undefined) {
        body.summary = body.summary.trim();
    }
    if (body.content !== undefined) {
        body.content = body.content.trim();
    }
    if (body.status !== undefined && !isPostStatus(body.status)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '发布状态不合法。'), { status: 400 });
    }
    if (body.publishedAt !== undefined && body.publishedAt !== null && typeof body.publishedAt !== 'string') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '发布时间格式不合法。'), { status: 400 });
    }
    if (body.coverImage !== undefined && body.coverImage !== null && typeof body.coverImage !== 'string') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '封面图路径格式不合法。'), { status: 400 });
    }
    if (body.altText !== undefined && body.altText !== null && typeof body.altText !== 'string') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, 'alt 描述格式不合法。'), { status: 400 });
    }
    if (body.categoryId !== undefined && body.categoryId !== null && !Number.isInteger(body.categoryId)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '分类 ID 不合法。'), { status: 400 });
    }
    if (body.tags !== undefined && !Array.isArray(body.tags)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '标签格式不合法。'), { status: 400 });
    }

    const updatedPost = await updatePostById(postId, body as UpdatePostInput);
    if (!updatedPost) {
        return NextResponse.json(fail(BizCode.NOT_FOUND, '文章不存在，或当前环境未连接数据库。'), { status: 404 });
    }

    return NextResponse.json(success(updatedPost, '保存成功。'));
});

/*-- DELETE: 删除文章 --*/
export const DELETE = withAdmin(async (_request, _admin, { params }) => {
    const { id } = await params;
    const postId = Number(id);
    if (!Number.isInteger(postId) || postId <= 0) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '文章 ID 不合法。'), { status: 400 });
    }

    /*-- 先检查文章是否存在 --*/
    const existing = await getPostById(postId);
    if (!existing) {
        return NextResponse.json(fail(BizCode.NOT_FOUND, '文章不存在。'), { status: 404 });
    }

    try {
        const deleted = await deletePostById(postId);
        if (!deleted) {
            return NextResponse.json(fail(BizCode.INTERNAL, '删除文章失败。'), { status: 500 });
        }
        return NextResponse.json(success(null, '文章已删除。'));
    } catch (err) {
        console.error('删除文章失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '删除文章失败。'), { status: 500 });
    }
});
