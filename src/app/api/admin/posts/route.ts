import { NextResponse } from 'next/server';

import { BizCode, fail, success } from '@/lib/api-response'
import { withAdmin } from '@/lib/with-admin';
import { createPost, getAllPosts } from '@/lib/posts';

/*== 后台文章列表接口：GET 返回全部文章，POST 创建草稿。 ==*/
export const GET = withAdmin(async () => {
    const posts = await getAllPosts();
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
