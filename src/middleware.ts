import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * 给服务端布局和页面补充当前路径，便于区分前台与后台壳层。
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-path', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
