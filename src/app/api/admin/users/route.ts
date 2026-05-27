import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createUser, hashPassword, listUsers, requireAdminFromRequest } from '@/lib/auth';
import { BizCode, fail, success } from '@/lib/api-response';

/*==
  用户列表（GET） / 创建用户（POST）
  均需管理员权限。
==*/

/*-- GET: 分页用户列表 --*/
export async function GET(request: NextRequest) {
    const admin = requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 20));
    const search = searchParams.get('search') || '';

    try {
        const result = await listUsers({ page, pageSize, search });
        return NextResponse.json(success(result));
    } catch (err) {
        console.error('获取用户列表失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '获取用户列表失败。'), { status: 500 });
    }
}

/*-- POST: 创建用户 --*/
export async function POST(request: NextRequest) {
    const admin = requireAdminFromRequest(request);
    if (!admin) {
        return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
    }

    let body: { username?: string; email?: string; password?: string; role?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const username = body.username?.trim() || '';
    const email = body.email?.trim() || '';
    const password = body.password?.trim() || '';
    const role = body.role === 'admin' ? 'admin' : 'user';

    if (!username || username.length < 2 || username.length > 50) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '用户名需在 2-50 个字符之间。'), { status: 400 });
    }
    if (username.includes(':')) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '用户名不能包含特殊字符。'), { status: 400 });
    }
    if (!email || !email.includes('@')) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请输入有效的邮箱地址。'), { status: 400 });
    }
    if (!password || password.length < 6) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '密码至少需要 6 个字符。'), { status: 400 });
    }

    try {
        const passwordHash = await hashPassword(password);
        const user = await createUser({ username, email, passwordHash, role });

        return NextResponse.json(success({
            user: {
                id: user.id, username: user.username, email: user.email,
                role: user.role, status: user.status, created_at: user.created_at,
            },
        }, '用户创建成功。'), { status: 201 });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(fail(BizCode.USER_EXISTS, '用户名或邮箱已被占用。'), { status: 409 });
        }
        console.error('创建用户失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '创建用户失败。'), { status: 500 });
    }
}
