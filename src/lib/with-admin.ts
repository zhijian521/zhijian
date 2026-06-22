/*============================================================================
  withAdmin — API Route 鉴权包装

  消除每个 route 里重复的 requireAdminFromRequest + 403 返回样板。
  用法：
    export const GET = withAdmin(async (request, admin) => {
        const data = await listSomething();
        return NextResponse.json(success(data));
    });
============================================================================*/

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { requireAdminFromRequest, type SessionPayload } from '@/lib/auth';
import { BizCode, fail } from '@/lib/api-response';

type AdminHandler = (
    request: NextRequest,
    admin: SessionPayload,
    context: { params: Promise<Record<string, string | string[]>> },
) => Promise<Response | NextResponse> | Response | NextResponse;

export function withAdmin(handler: AdminHandler) {
    return async (
        request: NextRequest,
        context: { params: Promise<Record<string, string | string[]>> },
    ): Promise<Response | NextResponse> => {
        const admin = requireAdminFromRequest(request);
        if (!admin) {
            return NextResponse.json(fail(BizCode.FORBIDDEN, '需要管理员权限。'), { status: 403 });
        }
        return handler(request, admin, context);
    };
}
