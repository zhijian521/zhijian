import { NextResponse } from 'next/server';

import { success } from '@/lib/api-response';
import { getPublishedPosts } from '@/lib/posts';

/*== 前台公开接口：返回全部已发布文章，无需登录。 ==*/
export async function GET() {
    const posts = await getPublishedPosts();
    return NextResponse.json(success(posts));
}
