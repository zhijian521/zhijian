/*============================================================================
  middleware — 请求中间件

  为服务端布局和页面补充 x-current-path 请求头，
  便于在服务端区分前台与后台路由，跳过静态资源和 favicon。
============================================================================*/

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/*== 补充当前路径 ==*/
export function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-current-path', request.nextUrl.pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

/*== 中间件匹配规则 ==*/
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
