/**
 * @api 用户登录
 * @group auth
 * @auth none
 * @method POST 用户名/密码登录，成功返回 session cookie
 * @returns success<{ user: { id, username, email, role } }> | fail（429 = 频率超限）
 */

import { NextResponse } from 'next/server';

import {
    createSessionToken,
    getUserByUsername,
    getSessionCookieOptions,
    SESSION_COOKIE_NAME,
    verifyPassword,
} from '@/lib/core/auth';
import { BizCode, fail, success } from '@/lib/core/api-response';
import { checkRateLimit } from '@/lib/core/rate-limit';

/*==
  公开登录接口。
  POST body: { username, password }
==*/
export async function POST(request: Request) {
    let body: { username?: string; password?: string };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const username = body.username?.trim() || '';
    const password = body.password?.trim() || '';

    if (!username || !password) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请输入用户名和密码。'), { status: 400 });
    }

    /*-- 限流：同一 IP + 用户名 5 次/分钟，防在线爆破 --*/
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (!checkRateLimit(`${ip}:${username}`, 5, 60_000)) {
        return NextResponse.json(fail(BizCode.RATE_LIMITED, '尝试过于频繁，请稍后再试。'), { status: 429 });
    }

    const user = await getUserByUsername(username);
    if (!user) {
        return NextResponse.json(fail(BizCode.UNAUTHORIZED, '账号或密码错误。'), { status: 401 });
    }
    if (user.status === 'disabled') {
        return NextResponse.json(fail(BizCode.USER_DISABLED, '该账号已被禁用，请联系管理员。'), { status: 403 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
        return NextResponse.json(fail(BizCode.UNAUTHORIZED, '账号或密码错误。'), { status: 401 });
    }

    const token = createSessionToken({ id: user.id, username: user.username, role: user.role });

    const response = NextResponse.json(
        success(
            {
                user: { id: user.id, username: user.username, email: user.email, role: user.role },
            },
            '登录成功。'
        )
    );

    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
}
