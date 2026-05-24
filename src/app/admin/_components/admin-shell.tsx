import Link from 'next/link';
import { LogOut, Plus, UserCircle2 } from 'lucide-react';

import { ADMIN_NAV_ITEMS, APP_ROUTES, SITE_METADATA } from '@/lib/site';
import { cn } from '@/lib/utils';

interface AdminShellProps {
  children: React.ReactNode;
  currentPath: string;
}

export default function AdminShell({ children, currentPath }: AdminShellProps) {
  return (
    <main className='relative min-h-screen'>
      <aside className='admin-stitch-sidebar fixed left-0 top-0 flex flex-col px-4 py-6'>
        <div className='mb-6 flex items-center gap-3 px-2'>
          <div className='h-10 w-10 overflow-hidden rounded-full border border-[var(--border)] bg-white shadow-sm'>
            <div className='flex h-full w-full items-center justify-center text-[11px] font-semibold text-[var(--primary)]'>知简</div>
          </div>
          <div>
            <h2 className='text-sm font-bold text-[var(--primary)]'>{SITE_METADATA.adminName}</h2>
            <p className='text-xs text-[var(--muted-foreground)]'>Content Management</p>
          </div>
        </div>

        <div className='mb-6 px-2'>
          <Link
            className='flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95'
            href={APP_ROUTES.adminPostCreate}
          >
            <Plus className='h-4 w-4' />
            撰写新文章
          </Link>
        </div>

        <nav aria-label='后台主导航' className='flex-1 space-y-1'>
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = item.match === 'exact' ? currentPath === item.href : currentPath.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive ? 'admin-stitch-nav-active' : 'admin-stitch-nav-item',
                )}
                href={item.href}
                key={item.label}
              >
                <Icon className='h-4 w-4' />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className='mt-auto space-y-1 border-t border-[var(--border)] pt-3'>
          <button className='admin-stitch-nav-item flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition' type='button'>
            <UserCircle2 className='h-4 w-4' />
            <span>个人资料</span>
          </button>
          <button
            className='admin-stitch-nav-item flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition hover:text-[var(--destructive)]'
            type='button'
          >
            <LogOut className='h-4 w-4' />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      <section className='admin-stitch-main'>{children}</section>
    </main>
  );
}
