import { NextResponse } from 'next/server';

import { withUser } from '@/lib/with-user';
import { saveTodosDb } from '@/lib/nav-db';
import { BizCode, fail, success } from '@/lib/api-response';
import type { TodoItem } from '@/lib/nav-storage';

/*== 保存备忘
  PUT body: { data: TodoItem[] }
==*/
export const PUT = withUser(async (request, user) => {
    let body: { data?: TodoItem[] };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    if (!body.data) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少 data 字段。'), { status: 400 });
    }

    await saveTodosDb(user.userId, body.data);
    return NextResponse.json(success(null, '保存成功。'));
});
