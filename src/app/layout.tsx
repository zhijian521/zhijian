import type { Metadata } from 'next';
import { headers } from 'next/headers';

import PublicChrome from '@/components/site/public-chrome';
import { SITE_METADATA } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const headersList = await headers();
  const currentPath = headersList.get('x-current-path') || '/';
  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <html lang='zh-CN'>
      <body data-app={isAdminRoute ? 'admin' : 'public'}>
        {isAdminRoute ? children : <PublicChrome currentPath={currentPath}>{children}</PublicChrome>}
      </body>
    </html>
  );
}
