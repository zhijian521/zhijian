/**
 * @api 书签保存
 * @group nav
 * @auth user
 * @method PUT 保存当前用户书签数据
 * @returns success | fail
 */

import { NextResponse } from 'next/server';

import { withUser } from '@/lib/core/with-user';
import { saveBookmarksDb } from '@/lib/domain/nav-db';
import { BizCode, fail, success } from '@/lib/core/api-response';
import type { Bookmark } from '@/lib/domain/nav-config';

/*== 保存书签
  PUT body: { data: Bookmark[] }
==*/
export const PUT = withUser(async (request, user) => {
    let body: { data?: Bookmark[] };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    if (!body.data) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少 data 字段。'), { status: 400 });
    }

    await saveBookmarksDb(user.userId, body.data);
    return NextResponse.json(success(null, '保存成功。'));
});
