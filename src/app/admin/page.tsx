import type { Metadata } from "next";
import Link from 'next/link';
import { ArrowRight, Edit3, FileText, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { countUsersByRole } from '@/lib/auth';
import { getAllPosts } from '@/lib/posts';
import { APP_ROUTES } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Admin - Zhijian",
};

/*== 后台概览页：匹配博客的衬线标题 + 扁平矩形卡片风格。 ==*/
export default async function AdminPage() {
    const posts = await getAllPosts();
    const publishedPosts = posts.filter((post) => post.status === 'published');
    const recentPosts = posts.slice(0, 5);
    const userCounts = await countUsersByRole();

    return (
        <div className='space-y-10'>
            {/* 头部 */}
            <header>
                <h1 className='admin-title'>概览</h1>
                <p className='admin-copy mt-1'>欢迎回来，这里是当前站点内容与数据的概览。</p>
            </header>

            {/* 指标卡片 */}
            <section className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                <MetricCard
                    accent='bg-[rgba(158,0,39,0.08)] text-[var(--primary)]'
                    description={`${publishedPosts.length} 篇已发布`}
                    icon={FileText}
                    title='文章'
                    value={`${posts.length}`}
                />
                <MetricCard
                    accent='bg-[rgba(158,0,39,0.08)] text-[var(--primary)]'
                    description={`${userCounts.admin} 管理员 · ${userCounts.user} 用户`}
                    icon={Users}
                    title='用户'
                    value={`${userCounts.admin + userCounts.user}`}
                />
                <MetricCard
                    accent='bg-[rgba(158,0,39,0.08)] text-[var(--primary)]'
                    description='草稿与已发布'
                    icon={Edit3}
                    title='状态'
                    value={`${posts.length - publishedPosts.length} / ${publishedPosts.length}`}
                />
            </section>

            {/* 近期文章 */}
            <section>
                <div className='flex items-center justify-between mb-4'>
                    <h2 className='font-serif text-xl font-semibold text-[var(--foreground)]'>近期文章</h2>
                    <Link
                        className='inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:opacity-80 transition-opacity'
                        href={APP_ROUTES.adminPosts}
                    >
                        查看全部
                        <ArrowRight className='h-4 w-4' />
                    </Link>
                </div>

                <div className='overflow-x-auto border border-[var(--primary)]'>
                    <table className='w-full border-collapse text-left'>
                        <thead>
                            <tr className='border-b border-[var(--primary)] bg-[#f5f3f3] text-xs uppercase tracking-[0.05em] text-[var(--muted-foreground)]'>
                                <th className='px-5 py-3 font-medium'>标题</th>
                                <th className='px-5 py-3 font-medium hidden sm:table-cell'>状态</th>
                                <th className='px-5 py-3 font-medium hidden md:table-cell'>日期</th>
                                <th className='px-5 py-3 text-right font-medium w-16'>操作</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-[var(--border)] text-sm text-[var(--foreground)]'>
                            {recentPosts.length === 0 ? (
                                <tr>
                                    <td className='px-5 py-8 text-center text-[var(--muted-foreground)]' colSpan={4}>
                                        暂无文章，去写第一篇吧。
                                    </td>
                                </tr>
                            ) : (
                                recentPosts.map((post) => (
                                    <tr className='transition-colors hover:bg-[#f5f3f3]' key={post.id}>
                                        <td className='px-5 py-3.5 font-medium truncate max-w-[300px]'>
                                            {post.title}
                                        </td>
                                        <td className='px-5 py-3.5 hidden sm:table-cell'>
                                            <Badge
                                                className={
                                                    post.status === 'published'
                                                        ? 'rounded-none border border-[var(--primary)] bg-[rgba(158,0,39,0.06)] px-2 py-0.5 text-[11px] font-medium text-[var(--primary)]'
                                                        : 'rounded-none border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]'
                                                }
                                                variant='secondary'
                                            >
                                                {post.status === 'published' ? '已发布' : '草稿'}
                                            </Badge>
                                        </td>
                                        <td className='px-5 py-3.5 hidden md:table-cell text-[var(--muted-foreground)]'>
                                            {post.status === 'published' ? formatShortDate(post.publishedAt) : '-'}
                                        </td>
                                        <td className='px-5 py-3.5 text-right'>
                                            <Link
                                                className='inline-flex p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors'
                                                href={`${APP_ROUTES.adminPosts}/${post.id}`}
                                            >
                                                <Edit3 className='h-4 w-4' />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

interface MetricCardProps {
    accent: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string;
}

/*== 指标卡片：匹配博客 projectCard 风格。 ==*/
function MetricCard({ accent, description, icon: Icon, title, value }: MetricCardProps) {
    return (
        <div className='admin-stitch-card flex flex-col justify-between p-5 min-h-[140px]'>
            <div className='flex items-start justify-between mb-4'>
                <p className='text-xs font-medium tracking-[0.15em] uppercase text-[var(--muted-foreground)]'>{title}</p>
                <div className={`p-2 ${accent}`}>
                    <Icon className='h-4 w-4' />
                </div>
            </div>
            <div>
                <h3 className='admin-stitch-number'>{value}</h3>
                <p className='mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed'>
                    {description}
                </p>
            </div>
        </div>
    );
}

/*== 概览页日期格式化。 ==*/
function formatShortDate(value: string | null): string {
    if (!value) return '-';
    const normalized = value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value.split(' ')[0] || '-';
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}
