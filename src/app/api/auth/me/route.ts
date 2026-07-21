/**
 * @api 当前用户信息
 * @group auth
 * @auth none
 * @method GET 从 cookie 解析当前登录用户信息
 * @returns success<{ user: { id, username, email, role } }> | fail
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getSessionFromRequest, getSessionUser } from '@/lib/core/auth';
import { BizCode, fail, success } from '@/lib/core/api-response';

/*== 获取当前登录用户信息。未登录返回 401；用户无效（禁用/删除）返回 401 USER_DISABLED。 ==*/
export async function GET(request: NextRequest) {
    const session = getSessionFromRequest(request);
    if (!session) {
        return NextResponse.json(fail(BizCode.UNAUTHORIZED, '未登录。'), { status: 401 });
    }

    /*== 与守卫共用同一条带缓存的会话回查路径（getSessionUser，60s 缓存 + 变更主动失效）。 ==*/
    const user = await getSessionUser(session);
    if (!user) {
        return NextResponse.json(fail(BizCode.USER_DISABLED, '用户不存在或已被禁用。'), { status: 401 });
    }

    return NextResponse.json(
        success({
            user: { id: user.id, username: user.username, email: user.email, role: user.role },
        })
    );
}
