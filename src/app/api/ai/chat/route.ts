import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { withUser } from '@/lib/with-user';
import { BizCode, fail } from '@/lib/api-response';

/*== AI 对话（DeepSeek，OpenAI 兼容接口，SSE 流式转发）

  POST body: { messages: { role: 'user'|'assistant'|'system', content: string }[] }
  响应：text/event-stream，每条 data: {"content":"..."}，结束 data: [DONE]

  鉴权：需登录（withUser）。历史由前端 nav-storage 管理，此路由不持久化。
==*/

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
/*-- 默认模型：env 的 DEEPSEEK_MODEL 优先，未配则 deepseek-chat --*/
const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const MAX_MESSAGES = 50;
const MAX_CONTENT_LEN = 8000;
const MAX_MODEL_LEN = 64;

interface ChatMsg {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

function validateMessages(messages: unknown): ChatMsg[] | string {
    if (!Array.isArray(messages) || messages.length === 0) return '消息不能为空。';
    if (messages.length > MAX_MESSAGES) return `消息条数不能超过 ${MAX_MESSAGES}。`;
    const out: ChatMsg[] = [];
    for (const m of messages) {
        if (!m || typeof m !== 'object') return '消息格式不正确。';
        const role = (m as { role?: string }).role;
        const content = (m as { content?: string }).content;
        if (role !== 'user' && role !== 'assistant' && role !== 'system') return '消息角色不合法。';
        if (typeof content !== 'string' || !content) return '消息内容不能为空。';
        if (content.length > MAX_CONTENT_LEN) return `单条消息不能超过 ${MAX_CONTENT_LEN} 字符。`;
        out.push({ role, content });
    }
    return out;
}

/*-- 把一段文本编码成 SSE data 行 --*/
function sseData(payload: string): Uint8Array {
    return new TextEncoder().encode(`data: ${payload}\n\n`);
}

export const POST = withUser(async (request: NextRequest) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        return NextResponse.json(fail(BizCode.INTERNAL, 'AI 未配置。'), { status: 503 });
    }

    let body: { messages?: unknown; model?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const validated = validateMessages(body.messages);
    if (typeof validated === 'string') {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, validated), { status: 400 });
    }

    /*-- 模型：前端可选传入，覆盖 env 默认；校验为非空短字符串防注入 --*/
    let model = DEFAULT_MODEL;
    if (body.model !== undefined && body.model !== null && body.model !== '') {
        if (typeof body.model !== 'string' || body.model.length > MAX_MODEL_LEN) {
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '模型参数不合法。'), { status: 400 });
        }
        model = body.model;
    }

    /*-- 构造流式响应：把 DeepSeek 上游 SSE 透传为简化的 content 增量 --*/
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            let upstream: Response;
            try {
                upstream = await fetch(DEEPSEEK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model,
                        messages: validated,
                        stream: true,
                    }),
                    signal: request.signal,
                });
            } catch (e) {
                controller.enqueue(sseData(JSON.stringify({ error: 'AI 请求失败。' })));
                controller.enqueue(sseData('[DONE]'));
                controller.close();
                console.warn('[ai/chat] upstream fetch error:', e);
                return;
            }

            if (!upstream.ok || !upstream.body) {
                controller.enqueue(sseData(JSON.stringify({ error: `AI 服务异常（${upstream.status}）。` })));
                controller.enqueue(sseData('[DONE]'));
                controller.close();
                return;
            }

            const reader = upstream.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });

                    /*-- 按行解析上游 SSE：data: {...} 或 data: [DONE] --*/
                    let nl: number;
                    while ((nl = buffer.indexOf('\n')) !== -1) {
                        const line = buffer.slice(0, nl).trim();
                        buffer = buffer.slice(nl + 1);
                        if (!line || !line.startsWith('data:')) continue;

                        const payload = line.slice(5).trim();
                        if (payload === '[DONE]') {
                            controller.enqueue(sseData('[DONE]'));
                            continue;
                        }

                        try {
                            const json = JSON.parse(payload);
                            const delta = json?.choices?.[0]?.delta?.content;
                            if (typeof delta === 'string' && delta) {
                                controller.enqueue(sseData(JSON.stringify({ content: delta })));
                            }
                        } catch {
                            /*-- 跳过无法解析的 chunk --*/
                        }
                    }
                }
            } catch (e) {
                /*-- 客户端断开（AbortError）时流已被取消，不要再 enqueue，否则抛 TypeError --*/
                if ((e as Error).name === 'AbortError') {
                    controller.close();
                    return;
                }
                try {
                    controller.enqueue(sseData(JSON.stringify({ error: 'AI 响应中断。' })));
                } catch {
                    /* 流已关闭，忽略 */
                }
                console.warn('[ai/chat] stream read error:', e);
            } finally {
                try {
                    controller.enqueue(sseData('[DONE]'));
                    controller.close();
                } catch {
                    /* 流已取消/关闭，忽略 */
                }
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    });
});
