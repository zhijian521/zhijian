/**
 * @api 用户登出
 * @group auth
 * @auth none
 * @method POST 清除 session cookie
 * @returns success
 */

import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, getSessionCookieOptions } from '@/lib/core/auth';
import { success } from '@/lib/core/api-response';

/*== 退出登录接口。清除 session cookie。 ==*/
export async function POST() {
    const response = NextResponse.json(success(null, '已退出登录。'));
    response.cookies.set(SESSION_COOKIE_NAME, '', { ...getSessionCookieOptions(), maxAge: 0 });
    return response;
}
