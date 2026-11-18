/**
 * @api 文章管理（列表/创建）
 * @group admin
 * @auth admin
 * @method GET  按筛选条件分页获取文章（含草稿）
 * @method POST 创建草稿
 * @returns success<{ data: AdminPostListItem[]; total: number }> | success<Post> | fail
 */

import { NextResponse } from 'next/server';

import { BizCode, fail, success } from '@/lib/core/api-response';
import { withAdmin } from '@/lib/core/with-admin';
import { createPost, listAdminPosts } from '@/lib/domain/posts';

/*== 后台文章列表接口：GET 按筛选条件分页返回，POST 创建草稿。 ==*/
export const GET = withAdmin(async (request) => {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const posts = await listAdminPosts({
        keyword: searchParams.get('keyword') || undefined,
        page: Math.max(1, Number(searchParams.get('page')) || 1),
        pageSize: Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 10)),
        status: status === 'draft' || status === 'published' ? status : 'all',
    });
    return NextResponse.json(success(posts));
});

export const POST = withAdmin(async (request) => {
    let body: { title?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    /*-- 创建草稿时自动生成 slug 和默认标题 --*/
    const title = body.title?.trim() || '无标题草稿';
    const slug = `draft-${Date.now()}`;

    const post = await createPost({
        title,
        slug,
        summary: '',
        content: '',
    });

    if (!post) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '新建文章失败，请确认数据库已连接。'), { status: 400 });
    }

    return NextResponse.json(success(post, '新建文章成功。'));
});
