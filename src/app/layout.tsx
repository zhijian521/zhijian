/*============================================================================
  layout — 项目根布局

  Next.js App Router 根布局，设置全局 <html>/<body>、元数据
  （title 模板、OG、Twitter、favicon、manifest、RSS alternate），
  交由 AppFrame 客户端壳层根据路由分发前台与后台视觉结构。
============================================================================*/

import AppFrame from '@/components/site/app-frame';
import { ROOT_METADATA } from '@/lib/core/metadata';
import type { RootLayoutProps } from '@/types/app';
import './globals.css';

/*== 页面元数据 ==*/
export const metadata = ROOT_METADATA;

/*== 项目根布局 ==*/
export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="zh-CN">
            <body>
                <AppFrame>{children}</AppFrame>
            </body>
        </html>
    );
}
