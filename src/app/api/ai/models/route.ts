/**
 * @api AI 模型列表
 * @group ai
 * @auth user
 * @method GET 返回可用 AI 模型 ID
 * @returns success<string[]> | fail
 */

import { NextResponse } from 'next/server';

import { withUser } from '@/lib/core/with-user';
import { BizCode, fail, success } from '@/lib/core/api-response';

/*== AI 模型列表
  GET → 转发 DeepSeek /models，返回可用模型 id 列表
  鉴权：需登录。不暴露 API Key，仅转发 { id } 数组。
==*/
const DEEPSEEK_MODELS_URL = 'https://api.deepseek.com/models';

export const GET = withUser(async () => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        return NextResponse.json(fail(BizCode.INTERNAL, 'AI 未配置。'), { status: 503 });
    }

    try {
        const res = await fetch(DEEPSEEK_MODELS_URL, {
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
            return NextResponse.json(fail(BizCode.INTERNAL, '获取模型列表失败。'), { status: 502 });
        }

        const json = await res.json();
        const list: unknown = json?.data;
        if (!Array.isArray(list)) {
            return NextResponse.json(fail(BizCode.INTERNAL, '模型列表格式异常。'), { status: 502 });
        }

        /*-- 只透传 id，丢弃其余字段 --*/
        const models = list
            .map((m: any) => (typeof m?.id === 'string' ? m.id : null))
            .filter((id: string | null): id is string => Boolean(id));

        return NextResponse.json(success(models));
    } catch (e) {
        console.warn('[ai/models] fetch error:', e);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取模型列表失败。'), { status: 502 });
    }
});
