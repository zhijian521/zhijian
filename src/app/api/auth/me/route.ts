/**
 * @api 当前用户信息
 * @group auth
 * @auth none
 * @method GET 从 cookie 解析当前登录用户信息
 * @returns success<User> | fail
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getSessionFromRequest, getUserById } from '@/lib/core/auth';
import { BizCode, fail, success } from '@/lib/core/api-response';

/*== 获取当前登录用户信息。未登录返回 401。 ==*/
export async function GET(request: NextRequest) {
    const session = getSessionFromRequest(request);
    if (!session) {
        return NextResponse.json(fail(BizCode.UNAUTHORIZED, '未登录。'), { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user || user.status === 'disabled') {
        return NextResponse.json(fail(BizCode.USER_DISABLED, '用户不存在或已被禁用。'), { status: 401 });
    }

    return NextResponse.json(
        success({
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
        })
    );
}
