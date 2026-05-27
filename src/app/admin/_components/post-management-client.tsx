'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPostDateTime, type Post, type PostStatus } from '@/lib/post-shared';
import { APP_ROUTES } from '@/lib/site';

interface PostManagementClientProps {
    initialPosts: Post[];
}

/*== 后台文章管理：客户端搜索 + 状态筛选，退出登录由侧边栏统一提供。 ==*/
export default function PostManagementClient({ initialPosts }: PostManagementClientProps) {
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<'all' | PostStatus>('all');

    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            const normalizedKeyword = keyword.trim().toLowerCase();
            const matchesKeyword =
                !normalizedKeyword || [post.title, post.slug, post.summary].some((field) => field.toLowerCase().includes(normalizedKeyword));
            const matchesStatus = status === 'all' || post.status === status;
            return matchesKeyword && matchesStatus;
        });
    }, [initialPosts, keyword, status]);

    return (
        <>
            <AdminPageHeader
                action={
                    <Link
                        className='inline-flex items-center gap-2 border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors h-9 px-3 text-sm font-medium'
                        href={APP_ROUTES.adminPostCreate}
                    >
                        <Plus className='h-4 w-4' />
                        新建文章
                    </Link>
                }
                description='集中查看全部文章，支持关键词搜索、状态筛选和快速进入编辑页。'
                eyebrow='Posts'
                tag={`${initialPosts.length} 篇文章`}
                title='文章管理'
            />

            {/* 搜索 + 筛选 */}
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5'>
                <div className='relative w-full lg:max-w-sm'>
                    <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]' />
                    <Input
                        className='pl-9 border border-[var(--border)] bg-[#fbf9f9] focus:border-[var(--primary)] focus:outline-none'
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder='搜索标题、Slug 或摘要'
                        value={keyword}
                    />
                </div>

                <Tabs defaultValue='all' onValueChange={(value) => setStatus(value as 'all' | PostStatus)} value={status}>
                    <TabsList className='bg-[#f5f3f3] rounded-none'>
                        <TabsTrigger value='all' className='rounded-none'>全部</TabsTrigger>
                        <TabsTrigger value='published' className='rounded-none'>已发布</TabsTrigger>
                        <TabsTrigger value='draft' className='rounded-none'>草稿</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* 表格 */}
            <div className='border border-[var(--primary)] overflow-x-auto'>
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='border-b border-[var(--primary)] bg-[#f5f3f3] text-xs uppercase tracking-[0.05em] text-[var(--muted-foreground)]'>
                            <th className='text-left px-4 py-3 font-medium'>文章</th>
                            <th className='text-left px-4 py-3 font-medium'>状态</th>
                            <th className='text-left px-4 py-3 font-medium hidden md:table-cell'>发布时间</th>
                            <th className='text-left px-4 py-3 font-medium hidden lg:table-cell'>更新时间</th>
                            <th className='text-right px-4 py-3 font-medium w-24'>操作</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-[var(--border)]'>
                        {filteredPosts.map((post) => (
                            <tr className='hover:bg-[#f5f3f3] transition-colors' key={post.id}>
                                <td className='px-4 py-3'>
                                    <p className='font-medium'>{post.title}</p>
                                    <p className='text-xs text-[var(--muted-foreground)] mt-0.5'>{post.slug}</p>
                                </td>
                                <td className='px-4 py-3'>
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
                                <td className='px-4 py-3 text-[var(--muted-foreground)] hidden md:table-cell'>
                                    {formatPostDateTime(post.publishedAt)}
                                </td>
                                <td className='px-4 py-3 text-[var(--muted-foreground)] hidden lg:table-cell'>
                                    {formatPostDateTime(post.updatedAt)}
                                </td>
                                <td className='px-4 py-3 text-right'>
                                    <Link
                                        className='inline-flex items-center justify-center border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors h-8 px-3 text-xs font-medium'
                                        href={`${APP_ROUTES.adminPosts}/${post.id}`}
                                    >
                                        编辑
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
