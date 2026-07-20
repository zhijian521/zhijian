/**
 * @api 公开文章列表
 * @group posts
 * @auth none
 * @method GET 分页返回已发布文章（不含正文）
 * @returns success<{ data: Post[]; total: number }> | fail
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { success } from '@/lib/core/api-response';
import { resolvePageParams } from '@/lib/core/pagination';
import { listPublishedPostsPage } from '@/lib/domain/posts';

/*== 公开文章接口返回数据库最新内容，不参与静态缓存。 ==*/
export const dynamic = 'force-dynamic';

/*== 前台公开接口：分页返回已发布文章，无需登录。列表项不含正文，content 恒为空字符串。 ==*/
export async function GET(request: NextRequest) {
    const { page, pageSize } = resolvePageParams(request.nextUrl.searchParams);
    const { posts, total } = await listPublishedPostsPage({ page, pageSize });
    return NextResponse.json(success({ data: posts, total }));
}
