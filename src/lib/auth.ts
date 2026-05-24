import { createHmac, timingSafeEqual } from 'node:crypto';

import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE_NAME = 'zhijian_admin_session';

// 后台登录态保留 7 天，适合个人网站后台这种低频管理场景。
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * 读取后台管理员账号配置。
 */
export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'change-this-password',
  };
}

/**
 * 统一管理后台 session cookie 配置，避免登录和退出行为不一致。
 */
export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}

/**
 * 登录成功后生成一个可由服务端校验的轻量 token。
 */
export function createAdminSessionToken(username: string): string {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  const payload = `${username}:${expiresAt}`;
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function isAdminRequestAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return isAdminSessionTokenValid(token);
}

/**
 * 服务端页面读取 cookie 时复用同一套 token 校验逻辑。
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  return isAdminSessionTokenValid(token);
}

/**
 * 校验 token 时同时检查签名、用户名与过期时间，防止伪造或过期复用。
 */
function isAdminSessionTokenValid(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const separatorIndex = token.lastIndexOf('.');

  if (separatorIndex < 0) {
    return false;
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = signPayload(payload);

  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  const [username, expiresAtValue] = payload.split(':');
  const expiresAt = Number(expiresAtValue);
  const { username: expectedUsername } = getAdminCredentials();

  if (!username || !Number.isFinite(expiresAt)) {
    return false;
  }

  if (username !== expectedUsername) {
    return false;
  }

  return expiresAt > Date.now();
}

function signPayload(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

/**
 * 优先使用显式配置的签名密钥，本地未配置时退回到账号密码派生值。
 */
function getSessionSecret(): string {
  if (process.env.ADMIN_SESSION_SECRET) {
    return process.env.ADMIN_SESSION_SECRET;
  }

  const { username, password } = getAdminCredentials();
  return `${username}:${password}:zhijian-admin-session`;
}

/**
 * 使用 timingSafeEqual 避免直接字符串比较带来的时序侧信道问题。
 */
function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
