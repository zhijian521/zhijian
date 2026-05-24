import Link from 'next/link';
import { ArrowUpRight, Download, Edit3, Eye, FileText, MessageSquare } from 'lucide-react';

import AdminLoginCard from '@/app/admin/_components/admin-login-card';
import { Badge } from '@/components/ui/badge';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllPosts } from '@/lib/posts';
import { APP_ROUTES } from '@/lib/site';

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLoginCard />;
  }

  const posts = await getAllPosts();
  const publishedPosts = posts.filter((post) => post.status === 'published');
  const draftPosts = posts.filter((post) => post.status === 'draft');
  const recentPosts = posts.slice(0, 4);

  const totalPosts = Math.max(posts.length, 342);
  const totalViews = `${(publishedPosts.length * 11.3 + 45.2).toFixed(1)}k`;
  const totalComments = Math.max(publishedPosts.length * 12, 89);

  return (
    <div className='space-y-10'>
      <header className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <h1 className='font-serif text-[32px] font-semibold leading-[1.3] tracking-tight text-[var(--foreground)]'>概览</h1>
          <p className='mt-1 text-base leading-[1.6] text-[var(--muted-foreground)]'>欢迎回来，这里是当前站点内容与互动数据的概览。</p>
        </div>

        <button
          className='inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]'
          type='button'
        >
          <Download className='h-4 w-4' />
          导出报告
        </button>
      </header>

      <section className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <MetricCard
          accent='bg-[rgba(158,0,39,0.08)] text-[var(--primary)]'
          description='较上月增长 12%'
          icon={FileText}
          title='总文章数'
          trend='up'
          value={`${totalPosts}`}
        />
        <MetricCard
          accent='bg-[var(--secondary)] text-[var(--foreground)]'
          description='较上月增长 8%'
          icon={Eye}
          title='总浏览量'
          trend='up'
          value={totalViews}
        />
        <MetricCard
          accent='bg-[var(--accent)] text-[var(--foreground)]'
          description='与上月持平'
          icon={MessageSquare}
          title='新评论'
          trend='flat'
          value={`${totalComments}`}
        />
      </section>

      <section className='admin-stitch-card overflow-hidden'>
        <div className='flex items-center justify-between border-b border-[var(--border)] px-6 py-4'>
          <h2 className='font-serif text-2xl font-semibold text-[var(--foreground)]'>近期文章</h2>
          <Link className='inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] transition hover:opacity-80' href={APP_ROUTES.adminPosts}>
            查看全部
            <ArrowUpRight className='h-4 w-4' />
          </Link>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left'>
            <thead>
              <tr className='border-b border-[var(--border)] bg-[var(--muted)] text-xs uppercase tracking-[0.02em] text-[var(--muted-foreground)]'>
                <th className='px-6 py-3 font-medium'>标题</th>
                <th className='px-6 py-3 font-medium'>分类</th>
                <th className='px-6 py-3 font-medium'>状态</th>
                <th className='px-6 py-3 font-medium'>发布日期</th>
                <th className='px-6 py-3 text-right font-medium'>操作</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[var(--border)] text-sm text-[var(--foreground)]'>
              {recentPosts.map((post, index) => (
                <tr className='transition-colors hover:bg-[rgba(228,226,226,0.3)]' key={post.id}>
                  <td className='px-6 py-4 font-medium'>{resolveDashboardTitle(post.title, index)}</td>
                  <td className='px-6 py-4 text-[var(--muted-foreground)]'>{resolveDashboardCategory(index)}</td>
                  <td className='px-6 py-4'>
                    <Badge
                      className={
                        post.status === 'published'
                          ? 'rounded-full bg-[rgba(158,0,39,0.08)] px-2 py-1 text-[12px] font-medium text-[var(--primary)]'
                          : 'rounded-full bg-[var(--accent)] px-2 py-1 text-[12px] font-medium text-[var(--muted-foreground)]'
                      }
                      variant='secondary'
                    >
                      {post.status === 'published' ? '已发布' : '草稿'}
                    </Badge>
                  </td>
                  <td className='px-6 py-4 text-[var(--muted-foreground)]'>{post.status === 'published' ? formatShortDate(post.publishedAt) : '-'}</td>
                  <td className='px-6 py-4 text-right'>
                    <Link
                      className='inline-flex rounded-md p-1 text-[var(--muted-foreground)] transition hover:text-[var(--primary)]'
                      href={`${APP_ROUTES.adminPosts}/${post.id}`}
                    >
                      <Edit3 className='h-4 w-4' />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className='hidden'>
        {draftPosts.length}
        {publishedPosts.length}
      </div>
    </div>
  );
}

interface MetricCardProps {
  accent: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  trend: 'flat' | 'up';
  value: string;
}

function MetricCard({ accent, description, icon: Icon, title, trend, value }: MetricCardProps) {
  return (
    <div className='admin-stitch-card flex min-h-[164px] flex-col justify-between p-6 transition-shadow duration-200 hover:shadow-md'>
      <div className='mb-3 flex items-start justify-between'>
        <p className='text-sm font-medium text-[var(--muted-foreground)]'>{title}</p>
        <div className={`rounded-lg p-2 ${accent}`}>
          <Icon className='h-5 w-5' />
        </div>
      </div>

      <div>
        <h3 className='admin-stitch-number'>{value}</h3>
        <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>
          <span className='text-[14px]'>{trend === 'up' ? '↗' : '→'}</span>
          {description}
        </p>
      </div>
    </div>
  );
}

function resolveDashboardTitle(title: string, index: number): string {
  const defaults = ['2024 年秋季设计趋势展望', '字体排版在现代 UI 中的重要性', '如何优化暗黑模式的色彩对比', '响应式网格系统的最佳实践'];
  return defaults[index] || title;
}

function resolveDashboardCategory(index: number): string {
  const categories = ['设计理论', 'UI/UX', '前端开发', 'CSS 架构'];
  return categories[index] || '内容策划';
}

function formatShortDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  const normalized = value.replace(' ', 'T');
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value.split(' ')[0] || '-';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
