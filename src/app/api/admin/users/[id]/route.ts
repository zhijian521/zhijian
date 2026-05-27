import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getUserById, hashPassword, requireAdminFromRequest, updateUser, deleteUser } from '@/lib/auth';
import { BizCode, fail, success } from '@/lib/api-response';

/*==
  单个用户操作：GET / PUT / DELETE。均需管理员权限。
==*/

/*-- GET: 用户详情 --*/
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const admin = requireAdminFromRequest(request);
    if (!admin) return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的用户 ID。'), { status: 400 });

    const user = await getUserById(userId);
    if (!user) return NextResponse.json(fail(BizCode.USER_NOT_FOUND, '用户不存在。'), { status: 404 });

    return NextResponse.json(success({ user }));
}

/*-- PUT: 编辑用户 --*/
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const admin = requireAdminFromRequest(request);
    if (!admin) return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的用户 ID。'), { status: 400 });

    const existing = await getUserById(userId);
    if (!existing) return NextResponse.json(fail(BizCode.USER_NOT_FOUND, '用户不存在。'), { status: 404 });

    let body: { username?: string; email?: string; password?: string; role?: string; status?: string };
    try { body = await request.json(); } catch {
        return NextResponse.json(fail(BizCode.BAD_REQUEST, '请求体格式不正确。'), { status: 400 });
    }

    const fields: Parameters<typeof updateUser>[1] = {};

    if (body.username !== undefined) {
        const username = body.username.trim();
        if (!username || username.length < 2 || username.length > 50)
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '用户名需在 2-50 个字符之间。'), { status: 400 });
        if (username.includes(':'))
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '用户名不能包含特殊字符。'), { status: 400 });
        fields.username = username;
    }
    if (body.email !== undefined) {
        const email = body.email.trim();
        if (!email || !email.includes('@'))
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '请输入有效的邮箱地址。'), { status: 400 });
        fields.email = email;
    }
    if (body.password !== undefined && body.password.trim() !== '') {
        const password = body.password.trim();
        if (password.length < 6)
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '密码至少需要 6 个字符。'), { status: 400 });
        fields.passwordHash = await hashPassword(password);
    }
    if (body.role !== undefined) {
        if (body.role !== 'admin' && body.role !== 'user')
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的角色。'), { status: 400 });
        fields.role = body.role;
    }
    if (body.status !== undefined) {
        if (body.status !== 'active' && body.status !== 'disabled')
            return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的状态。'), { status: 400 });
        fields.status = body.status;
    }

    try {
        const updated = await updateUser(userId, fields);
        return NextResponse.json(success({ user: updated }, '用户更新成功。'));
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY')
            return NextResponse.json(fail(BizCode.USER_EXISTS, '用户名或邮箱已被占用。'), { status: 409 });
        console.error('更新用户失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '更新用户失败。'), { status: 500 });
    }
}

/*-- DELETE: 删除用户 --*/
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const admin = requireAdminFromRequest(request);
    if (!admin) return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) return NextResponse.json(fail(BizCode.BAD_REQUEST, '无效的用户 ID。'), { status: 400 });
    if (admin.userId === userId) return NextResponse.json(fail(BizCode.USER_SELF_DELETE, '不能删除自己的账号。'), { status: 400 });

    try {
        const deleted = await deleteUser(userId);
        if (!deleted) return NextResponse.json(fail(BizCode.USER_NOT_FOUND, '用户不存在。'), { status: 404 });
        return NextResponse.json(success(null, '用户已删除。'));
    } catch (err) {
        console.error('删除用户失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '删除用户失败。'), { status: 500 });
    }
}
