/**
 * @api 聊天记录
 * @group nav
 * @auth user
 * @method GET 获取聊天历史
 * @method PUT 保存聊天记录
 * @returns success<ChatData> | fail
 */

import { NextResponse } from 'next/server';

import { withUser } from '@/lib/core/with-user';
import { getChatDb, saveChatDb } from '@/lib/domain/nav-db';
import { BizCode, fail, success } from '@/lib/core/api-response';
import { isJsonArrayWithinLimit } from '@/lib/core/json-body';
import type { ChatConversation } from '@/lib/domain/nav-storage';

/*== AI 对话历史
  GET  → 取当前用户全部会话
  PUT  → 保存会话数组（整存整取）
==*/

export const GET = withUser(async (_request, user) => {
    const data = await getChatDb(user.userId);
    return NextResponse.json(success(data ?? []));
});

/*== 保存会话
  PUT body: { data: ChatConversation[] }
==*/
export const PUT = withUser(async (request, user) => {
    let body: { data?: ChatConversation[] };
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
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '对话数据过大（上限 1MB）。'), { status: 400 });
    }

    await saveChatDb(user.userId, body.data);
    return NextResponse.json(success(null, '保存成功。'));
});
