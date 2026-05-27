import { NextResponse } from 'next/server';

import { createUser, getUserByUsername, hashPassword } from '@/lib/auth';
import { BizCode, fail, success } from '@/lib/api-response';

/*==
  公开注册接口。仅允许注册 user 角色。
  POST body: { username, email, password }
==*/
export async function POST(request: Request) {
    let body: { username?: string; email?: string; password?: string };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const username = body.username?.trim() || '';
    const email = body.email?.trim() || '';
    const password = body.password?.trim() || '';

    if (!username || username.length < 2 || username.length > 50) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '用户名需在 2-50 个字符之间。'), { status: 400 });
    }
    if (username.includes(':')) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '用户名不能包含特殊字符。'), { status: 400 });
    }
    if (!email || !email.includes('@') || email.length > 255) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请输入有效的邮箱地址。'), { status: 400 });
    }
    if (!password || password.length < 6) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '密码至少需要 6 个字符。'), { status: 400 });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
        return NextResponse.json(fail(BizCode.USER_EXISTS, '用户名已被注册。'), { status: 409 });
    }

    try {
        const passwordHash = await hashPassword(password);
        const user = await createUser({ username, email, passwordHash, role: 'user' });

        return NextResponse.json(success({
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
        }, '注册成功。'), { status: 201 });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(fail(BizCode.USER_EXISTS, '用户名或邮箱已被注册。'), { status: 409 });
        }
        console.error('注册失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '注册失败，请稍后重试。'), { status: 500 });
    }
}
