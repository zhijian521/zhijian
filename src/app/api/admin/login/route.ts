import { NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE_NAME, createAdminSessionToken, getAdminCredentials, getAdminSessionCookieOptions } from '@/lib/auth';

/**
 * 后台登录接口，校验账号密码后写入 session cookie。
 */
export async function POST(request: Request) {
  let body: { username?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: '请求体格式不正确。',
      },
      {
        status: 400,
      },
    );
  }

  const username = body.username?.trim() || '';
  const password = body.password?.trim() || '';
  const credentials = getAdminCredentials();

  if (username !== credentials.username || password !== credentials.password) {
    return NextResponse.json(
      {
        message: '账号或密码错误。',
      },
      {
        status: 401,
      },
    );
  }

  const response = NextResponse.json({
    message: '登录成功。',
  });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, createAdminSessionToken(credentials.username), getAdminSessionCookieOptions());

  return response;
}
