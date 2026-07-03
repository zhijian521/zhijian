import { NextResponse } from 'next/server';

import { createUser, hashPassword, validateUserFields } from '@/lib/auth';
import { BizCode, fail, success } from '@/lib/api-response';

/*== 公开注册接口
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

    const fieldError = validateUserFields(username, email, password);
    if (fieldError) {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, fieldError), { status: 400 });
    }

    try {
        const passwordHash = await hashPassword(password);
        const user = await createUser({ username, email, passwordHash, role: 'user' });
        return NextResponse.json(
            success(
                {
                    user: { id: user.id, username: user.username, email: user.email, role: user.role },
                },
                '注册成功。'
            ),
            { status: 201 }
        );
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(fail(BizCode.USER_EXISTS, '用户名或邮箱已被占用。'), { status: 409 });
        }
        console.error('注册失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '注册失败，请稍后重试。'), { status: 500 });
    }
}
