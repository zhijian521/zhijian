/**
 * @api 导航站数据同步
 * @group nav
 * @auth user
 * @method POST 批量覆盖同步导航数据（localStorage → 服务端）
 * @returns success | fail
 */

import { NextResponse } from 'next/server';

import { withUser } from '@/lib/core/with-user';
import { hasNavData, saveBookmarksDb, saveTodosDb, saveNotesDb, saveChatDb } from '@/lib/domain/nav-db';
import { BizCode, fail, success } from '@/lib/core/api-response';
import { isJsonArrayWithinLimit } from '@/lib/core/json-body';

/*== 首次登录同步：把本地数据推到数据库
  数据库已有数据则拒绝（以数据库为准）。
  POST body: { bookmarks?, todos?, notes?, chat? }
==*/
export const POST = withUser(async (request, user) => {
    const exists = await hasNavData(user.userId);
    if (exists) {
        return NextResponse.json(fail(BizCode.CONFLICT, '数据已存在，以数据库为准。'), { status: 409 });
    }

    let body: { bookmarks?: unknown; todos?: unknown; notes?: unknown; chat?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    /*-- JSON 解析成功但结果为 null/非对象（如 "null"、字符串）时，同样视为格式不正确 --*/
    if (body === null || typeof body !== 'object') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    /*-- 校验：每项必须是数组，单条 JSON 不超过 1MB --*/
    const fields: [string, unknown, (userId: number, data: any[]) => Promise<void>][] = [
        ['bookmarks', body.bookmarks, saveBookmarksDb],
        ['todos', body.todos, saveTodosDb],
        ['notes', body.notes, saveNotesDb],
        ['chat', body.chat, saveChatDb],
    ];

    const tasks: Promise<void>[] = [];
    for (const [name, value, saveFn] of fields) {
        if (value == null) continue;
        if (!Array.isArray(value)) {
            return NextResponse.json(fail(BizCode.BAD_REQUEST, `${name} 必须是数组。`), { status: 400 });
        }
        if (!isJsonArrayWithinLimit(value)) {
            return NextResponse.json(fail(BizCode.BAD_REQUEST, `${name} 数据过大（上限 1MB）。`), { status: 400 });
        }
        tasks.push(saveFn(user.userId, value as any[]));
    }
    await Promise.all(tasks);

    return NextResponse.json(success(null, '同步成功。'));
});
