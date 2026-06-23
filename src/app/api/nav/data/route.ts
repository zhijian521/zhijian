import { NextResponse } from 'next/server';

import { withUser } from '@/lib/with-user';
import { getAllNavData } from '@/lib/nav-db';
import { success } from '@/lib/api-response';

/*== 获取当前用户全部 nav 数据 ==*/
export const GET = withUser(async (_request, user) => {
    const data = await getAllNavData(user.userId);
    return NextResponse.json(success(data));
});
