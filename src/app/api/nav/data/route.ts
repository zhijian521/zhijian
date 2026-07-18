/**
 * @api 导航站全量数据
 * @group nav
 * @auth user
 * @method GET 获取当前用户的书签、待办和笔记
 * @returns success<{ bookmarks, todos, notes }> | fail
 */

import { NextResponse } from 'next/server';

import { withUser } from '@/lib/core/with-user';
import { getAllNavData } from '@/lib/domain/nav-db';
import { success } from '@/lib/core/api-response';

/*== 获取当前用户全部 nav 数据 ==*/
export const GET = withUser(async (_request, user) => {
    const data = await getAllNavData(user.userId);
    return NextResponse.json(success(data));
});
