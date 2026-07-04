/**
 * @api 导航站全量数据
 * @group nav
 * @auth user
 * @method GET 获取当前用户所有导航数据（书签/todo/笔记/聊天）
 * @returns success<NavData> | fail
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
