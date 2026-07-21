import { createHmac, timingSafeEqual as cryptoTSR } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

import { getDb } from './db';
import { APP_ROUTES } from './site';

/*============================================================================
  常量
============================================================================*/

/*== 统一 session cookie 名称（admin + user 共用）。 ==*/
export const SESSION_COOKIE_NAME = 'zhijian_session';

/*== session 保留 7 天。 ==*/
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/*== bcrypt 哈希轮数。 ==*/
const BCRYPT_ROUNDS = 12;

/*============================================================================
  类型
============================================================================*/

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'disabled';

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    created_at: Date;
    updated_at: Date;
}

export interface SessionPayload {
    userId: number;
    username: string;
    role: UserRole;
}

/*============================================================================
  密码工具
============================================================================*/

/*== 哈希明文密码。 ==*/
export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/*== 验证明文密码与哈希是否匹配。 ==*/
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

/*============================================================================
  数据库操作
============================================================================*/

/*== 按用户名查询用户（含密码哈希，仅用于登录校验）。 ==*/
export async function getUserByUsername(username: string): Promise<(User & { password_hash: string }) | null> {
    const db = getDb();
    if (!db) return null;

    const [rows] = await db.execute(
        'SELECT id, username, email, password_hash, role, status, created_at, updated_at FROM zhijian_users WHERE username = ?',
        [username]
    );
    const list = rows as any[];
    if (list.length === 0) return null;
    const row = list[0];
    return { ...toUser(row), password_hash: row.password_hash as string };
}

/*== 按 ID 查询用户（不含密码哈希，用于展示和鉴权）。 ==*/
export async function getUserById(id: number): Promise<User | null> {
    const db = getDb();
    if (!db) return null;

    const [rows] = await db.execute(
        'SELECT id, username, email, role, status, created_at, updated_at FROM zhijian_users WHERE id = ?',
        [id]
    );
    const list = rows as any[];
    return list.length > 0 ? toUser(list[0]) : null;
}

/*== 用户字段校验，返回错误消息或 null。 ==*/
export function validateUserFields(
    username: string,
    email: string,
    password: string,
    requireEmailAt = true
): string | null {
    if (!username || username.length < 2 || username.length > 50) return '用户名需在 2-50 个字符之间。';
    if (username.includes(':')) return '用户名不能包含特殊字符。';
    if (!email || (requireEmailAt && !email.includes('@')) || email.length > 255) return '请输入有效的邮箱地址。';
    if (!password || password.length < 6) return '密码至少需要 6 个字符。';
    return null;
}

/*== 创建用户，返回新用户（不含密码哈希）。 调用方负责先 hash 密码。 ==*/
export async function createUser(params: {
    username: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
}): Promise<User> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const [result] = await db.execute(
        'INSERT INTO zhijian_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [params.username, params.email, params.passwordHash, params.role || 'user']
    );
    const insertResult = result as any;
    return (await getUserById(insertResult.insertId))!;
}

/*== 更新用户字段（传什么更新什么）。 ==*/
export async function updateUser(
    id: number,
    fields: {
        username?: string;
        email?: string;
        passwordHash?: string;
        role?: UserRole;
        status?: UserStatus;
    }
): Promise<User | null> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const sets: string[] = [];
    const values: any[] = [];

    if (fields.username !== undefined) {
        sets.push('username = ?');
        values.push(fields.username);
    }
    if (fields.email !== undefined) {
        sets.push('email = ?');
        values.push(fields.email);
    }
    if (fields.passwordHash !== undefined) {
        sets.push('password_hash = ?');
        values.push(fields.passwordHash);
    }
    if (fields.role !== undefined) {
        sets.push('role = ?');
        values.push(fields.role);
    }
    if (fields.status !== undefined) {
        sets.push('status = ?');
        values.push(fields.status);
    }

    if (sets.length === 0) return getUserById(id);

    values.push(id);
    await db.execute(`UPDATE zhijian_users SET ${sets.join(', ')} WHERE id = ?`, values);
    invalidateSessionUserCache(id);
    return getUserById(id);
}

/*== 删除用户。返回 true 表示确实删除了记录。 ==*/
export async function deleteUser(id: number): Promise<boolean> {
    const db = getDb();
    if (!db) throw new Error('数据库未配置');

    const [result] = await db.execute('DELETE FROM zhijian_users WHERE id = ?', [id]);
    const deleted = (result as any).affectedRows > 0;
    if (deleted) invalidateSessionUserCache(id);
    return deleted;
}

/*== 用户列表（分页 + 搜索）。 ==*/
export async function listUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
}): Promise<{ users: User[]; total: number }> {
    const db = getDb();
    if (!db) return { users: [], total: 0 };

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const offset = (page - 1) * pageSize;
    const search = params.search?.trim() || '';

    let where = '';
    const values: any[] = [];

    if (search) {
        where = 'WHERE username LIKE ? OR email LIKE ?';
        values.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM zhijian_users ${where}`, values);
    const total = (countRows as any[])[0].total as number;

    const [rows] = await db.execute(
        `SELECT id, username, email, role, status, created_at, updated_at FROM zhijian_users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...values, pageSize, offset]
    );

    return {
        users: (rows as any[]).map(toUser),
        total,
    };
}

/*== 统计各角色人数（用于 dashboard 概览）。 表不存在时优雅降级返回零。 ==*/
export async function countUsersByRole(): Promise<{ admin: number; user: number }> {
    const db = getDb();
    if (!db) return { admin: 0, user: 0 };

    try {
        const [rows] = await db.execute(
            `SELECT role, COUNT(*) AS cnt FROM zhijian_users WHERE status = 'active' GROUP BY role`
        );
        const counts: Record<string, number> = {};
        for (const row of rows as any[]) {
            counts[row.role] = row.cnt;
        }
        return { admin: counts['admin'] || 0, user: counts['user'] || 0 };
    } catch {
        // 表不存在时（如构建阶段）返回零
        return { admin: 0, user: 0 };
    }
}

/*============================================================================
  Session Token
  格式：userId:username:role:expiresAt.signature（HMAC-SHA256）
============================================================================*/

/*== 根据用户信息生成签名 session token。 ==*/
export function createSessionToken(user: { id: number; username: string; role: UserRole }): string {
    const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
    const payload = `${user.id}:${user.username}:${user.role}:${expiresAt}`;
    const signature = signPayload(payload);
    return `${payload}.${signature}`;
}

/*== 解析并校验 session token，返回 payload 或 null。 ==*/
export function parseSessionToken(token: string | undefined): SessionPayload | null {
    if (!token) return null;

    const separatorIndex = token.lastIndexOf('.');
    if (separatorIndex < 0) return null;

    const payload = token.slice(0, separatorIndex);
    const signature = token.slice(separatorIndex + 1);

    if (!safeEqual(signature, signPayload(payload))) return null;

    // payload: userId:username:role:expiresAt
    const parts = payload.split(':');
    if (parts.length !== 4) return null;

    const [userIdStr, username, role, expiresAtStr] = parts;
    const userId = Number(userIdStr);
    const expiresAt = Number(expiresAtStr);

    if (!Number.isFinite(userId) || !Number.isFinite(expiresAt)) return null;
    if (role !== 'admin' && role !== 'user') return null;
    if (expiresAt <= Date.now()) return null;

    return { userId, username, role: role as UserRole };
}

/*============================================================================
  Session 用户状态校验
  token 只证明身份来源可信；用户被禁用 / 降级 / 删除后必须能失效。
  以数据库为准校验 status 与 role，短 TTL 内存缓存避免每请求查库。
============================================================================*/

/*== 缓存有效期：吊销最长滞后 60 秒（updateUser/deleteUser 会主动失效缓存）。 ==*/
const SESSION_USER_CACHE_TTL = 60 * 1000;

const sessionUserCache = new Map<number, { user: User; expiresAt: number }>();

/*== 使用户状态缓存失效（用户被更新 / 删除时调用，吊销立即生效）。 ==*/
export function invalidateSessionUserCache(userId: number): void {
    sessionUserCache.delete(userId);
}

/*== 查询 session 对应的有效用户（存在且 active），带 60s 内存缓存；无效返回 null。
    供需要完整用户信息的场景（如 /api/auth/me）使用，与 validateSession 共享同一缓存。 ==*/
export async function getSessionUser(session: SessionPayload | null): Promise<User | null> {
    if (!session) return null;

    const cached = sessionUserCache.get(session.userId);
    let user = cached && cached.expiresAt > Date.now() ? cached.user : null;
    if (!user) {
        user = await getUserById(session.userId);
        /*-- 查不到（已删除或 DB 不可用）不写缓存，避免故障期结果被固化 --*/
        if (!user) return null;
        sessionUserCache.set(session.userId, { user, expiresAt: Date.now() + SESSION_USER_CACHE_TTL });
    }

    return user.status === 'active' ? user : null;
}

/*== 校验 session 对应用户仍有效（存在且 active），角色以数据库为准（降级立即生效）。 ==*/
export async function validateSession(session: SessionPayload | null): Promise<SessionPayload | null> {
    const user = await getSessionUser(session);
    if (!user) return null;
    return { userId: user.id, username: user.username, role: user.role };
}

/*============================================================================
  Cookie 工具
============================================================================*/

/*== 统一 session cookie 配置。 ==*/
export function getSessionCookieOptions() {
    return {
        httpOnly: true,
        maxAge: SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
    };
}

/*== 读 cookie → 解析 token → 返回 session payload 或 null。 ==*/
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return parseSessionToken(token);
}

/*== 从 NextRequest 读 cookie 并解析（用于 API Route）。 ==*/
export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    return parseSessionToken(token);
}

/*============================================================================
  鉴权守卫（服务端组件 / API Route 用）
============================================================================*/

/*== 要求已登录（任意角色）且账号仍有效。未通过 → 重定向到指定登录页。 ==*/
export async function requireAuth(redirectTo?: string): Promise<SessionPayload> {
    const session = await validateSession(await getSessionFromCookies());
    if (!session) {
        redirect(redirectTo || APP_ROUTES.adminLogin);
    }
    return session;
}

/*== 要求管理员角色。未登录 → 登录页；非 admin → 403。 ==*/
export async function requireAdmin(): Promise<SessionPayload> {
    const session = await requireAuth(APP_ROUTES.adminLogin);
    if (session.role !== 'admin') {
        redirect(APP_ROUTES.forbidden);
    }
    return session;
}

/*== API Route 版本：返回 session 或 null（不重定向，由调用方返回 JSON 错误）。 ==*/
export async function requireAdminFromRequest(request: NextRequest): Promise<SessionPayload | null> {
    const session = await validateSession(getSessionFromRequest(request));
    if (!session || session.role !== 'admin') return null;
    return session;
}

/*============================================================================
  签名辅助
============================================================================*/

/*== HMAC-SHA256 签名。 ==*/
function signPayload(payload: string): string {
    return createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
}

/*== 从环境变量读取签名密钥，未配置时抛错阻止启动。 ==*/
function getSessionSecret(): string {
    if (!process.env.ADMIN_SESSION_SECRET) {
        throw new Error('ADMIN_SESSION_SECRET 未设置，请在 .env.local 中配置一个随机长字符串。');
    }
    return process.env.ADMIN_SESSION_SECRET;
}

/*============================================================================
  工具
============================================================================*/

/*== 常量时间字符串比较，防时序攻击。 ==*/
function safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) return false;
    return cryptoTSR(leftBuffer, rightBuffer);
}

/*== 数据库行 → User 对象。 ==*/
function toUser(row: any): User & { password_hash?: string } {
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        password_hash: row.password_hash,
    };
}
