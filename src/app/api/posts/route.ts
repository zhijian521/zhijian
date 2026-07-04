/**
 * @api 公开文章列表
 * @group posts
 * @auth none
 * @method GET 返回全部已发布文章
 * @returns success<Post[]> | fail
 */

import { NextResponse } from 'next/server';

import { success } from '@/lib/api-response';
import { getPublishedPosts } from '@/lib/posts';

/*== 公开文章接口返回数据库最新内容，不参与静态缓存。 ==*/
export const dynamic = 'force-dynamic';

/*== 前台公开接口：返回全部已发布文章，无需登录。 ==*/
export async function GET() {
    const posts = await getPublishedPosts();
    return NextResponse.json(success(posts));
}
