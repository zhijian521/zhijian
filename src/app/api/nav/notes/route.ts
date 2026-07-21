/**
 * @api 笔记保存
 * @group nav
 * @auth user
 * @method PUT 保存当前用户笔记数据
 * @returns success | fail
 */

import { NextResponse } from 'next/server';

import { withUser } from '@/lib/core/with-user';
import { saveNotesDb } from '@/lib/domain/nav-db';
import { BizCode, fail, success } from '@/lib/core/api-response';
import { isJsonArrayWithinLimit } from '@/lib/core/json-body';
import type { NoteItem } from '@/lib/domain/nav-storage';

/*== 保存笔记
  PUT body: { data: NoteItem[] }
==*/
export const PUT = withUser(async (request, user) => {
    let body: { data?: NoteItem[] };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    /*-- JSON 解析成功但结果为 null/非对象（如 "null"、字符串）时，同样视为缺少 data --*/
    if (body === null || typeof body !== 'object' || !body.data) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '缺少 data 字段。'), { status: 400 });
    }

    if (!Array.isArray(body.data)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, 'data 必须是数组。'), { status: 400 });
    }

    /*-- 单条 JSON 上限 1MB，防止过大写入 --*/
    if (!isJsonArrayWithinLimit(body.data)) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '笔记数据过大（上限 1MB）。'), { status: 400 });
    }

    await saveNotesDb(user.userId, body.data);
    return NextResponse.json(success(null, '保存成功。'));
});
