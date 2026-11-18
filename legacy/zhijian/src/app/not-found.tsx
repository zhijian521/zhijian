/*============================================================================
  not-found — 404 页面

  Next.js 文件约定，路由未匹配时自动展示。
  复用 StatusPage 组件，水墨背景 + 毛玻璃卡片 + 诗意文案。
============================================================================*/

import { StatusPage } from '@/components/ui/status-page';

export default function NotFound() {
    return <StatusPage code={404} title="页面已随风而逝，了无踪迹" subtitle="云深不知处，归径在心间。" />;
}
