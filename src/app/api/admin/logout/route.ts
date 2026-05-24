import { NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE_NAME, getAdminSessionCookieOptions } from '@/lib/auth';

/**
 * 后台退出接口，清空当前登录态 cookie。
 */
export async function POST() {
  const response = NextResponse.json({
    message: '已退出登录。',
  });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
