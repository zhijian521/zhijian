import { NextResponse } from 'next/server';

import { withUser } from '@/lib/with-user';
import { hasNavData, saveBookmarksDb, saveTodosDb, saveNotesDb } from '@/lib/nav-db';
import { BizCode, fail, success } from '@/lib/api-response';
import type { Bookmark } from '@/lib/nav-config';
import type { TodoItem, NoteItem } from '@/lib/nav-storage';

/*== 首次登录同步：把本地数据推到数据库
  数据库已有数据则拒绝（以数据库为准）。
  POST body: { bookmarks?, todos?, notes? }
==*/
export const POST = withUser(async (request, user) => {
    const exists = await hasNavData(user.userId);
    if (exists) {
        return NextResponse.json(fail(BizCode.CONFLICT, '数据已存在，以数据库为准。'), { status: 409 });
    }

    let body: { bookmarks?: Bookmark[]; todos?: TodoItem[]; notes?: NoteItem[] };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const tasks: Promise<void>[] = [];
    if (body.bookmarks) tasks.push(saveBookmarksDb(user.userId, body.bookmarks));
    if (body.todos) tasks.push(saveTodosDb(user.userId, body.todos));
    if (body.notes) tasks.push(saveNotesDb(user.userId, body.notes));
    await Promise.all(tasks);

    return NextResponse.json(success(null, '同步成功。'));
});
