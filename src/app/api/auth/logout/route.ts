import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, getSessionCookieOptions } from '@/lib/auth';
import { success } from '@/lib/api-response';

/*== 退出登录接口。清除 session cookie。 ==*/
export async function POST() {
    const response = NextResponse.json(success(null, '已退出登录。'));
    response.cookies.set(SESSION_COOKIE_NAME, '', { ...getSessionCookieOptions(), maxAge: 0 });
    return response;
}
