'use client';

import Link from 'next/link';
import { LogOut, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPostDateTime, type Post, type PostStatus } from '@/lib/post-shared';
import { APP_ROUTES } from '@/lib/site';
import { api } from '@/lib/http-client';

interface PostManagementClientProps {
    initialPosts: Post[];
}

/*== 后台文章管理客户端组件：在客户端完成关键词搜索与状态筛选，避免不必要的服务端请求。 ==*/
export default function PostManagementClient({ initialPosts }: PostManagementClientProps) {
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<'all' | PostStatus>('all');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    /*== 列表筛选保持在客户端完成，避免后台管理页做不必要的额外请求。 ==*/
    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post) => {
            const normalizedKeyword = keyword.trim().toLowerCase();
            const matchesKeyword =
                !normalizedKeyword || [post.title, post.slug, post.summary].some((field) => field.toLowerCase().includes(normalizedKeyword));
            const matchesStatus = status === 'all' || post.status === status;

            return matchesKeyword && matchesStatus;
        });
    }, [initialPosts, keyword, status]);

    function handleLogout() {
        setIsLoggingOut(true);
        api.post('/auth/logout').finally(() => {
            window.location.href = APP_ROUTES.adminLogin;
        });
    }

    return (
        <>
            <AdminPageHeader
                action={
                    <div className='flex flex-wrap gap-2'>
                        <Link className='inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-3 text-sm font-medium' href={APP_ROUTES.adminPostCreate}>
                            <Plus className='h-4 w-4' />
                            新建文章
                        </Link>
                        <Button className='rounded-xl' disabled={isLoggingOut} onClick={handleLogout} type='button' variant='outline'>
                            <LogOut className='h-4 w-4' />
                            退出
                        </Button>
                    </div>
                }
                description='集中查看全部文章，支持关键词搜索、状态筛选和快速进入编辑页。'
                eyebrow='Posts'
                tag={`${initialPosts.length} 篇文章`}
                title='文章管理'
            />

            <Card className='admin-panel border-slate-200 bg-white/92 shadow-sm'>
                <CardContent className='space-y-6 p-6'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                        <div className='relative w-full lg:max-w-sm'>
                            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                            <Input
                                className='admin-input pl-9'
                                onChange={(event) => {
                                    setKeyword(event.target.value);
                                }}
                                placeholder='搜索标题、Slug 或摘要'
                                value={keyword}
                            />
                        </div>

                        <Tabs defaultValue='all' onValueChange={(value) => setStatus(value as 'all' | PostStatus)} value={status}>
                            <TabsList className='bg-slate-100'>
                                <TabsTrigger value='all'>全部</TabsTrigger>
                                <TabsTrigger value='published'>已发布</TabsTrigger>
                                <TabsTrigger value='draft'>草稿</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className='max-h-[70vh] overflow-auto'>
                        <Table className='admin-table'>
                            <TableHeader>
                                <TableRow className='hover:bg-transparent'>
                                    <TableHead>文章</TableHead>
                                    <TableHead>状态</TableHead>
                                    <TableHead>发布时间</TableHead>
                                    <TableHead>更新时间</TableHead>
                                    <TableHead className='text-right'>操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPosts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            <div className='space-y-1'>
                                                <p className='font-medium text-slate-900'>{post.title}</p>
                                                <p className='text-xs text-slate-500'>{post.slug}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                                {post.status === 'published' ? '已发布' : '草稿'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-sm text-slate-500'>{formatPostDateTime(post.publishedAt)}</TableCell>
                                        <TableCell className='text-sm text-slate-500'>{formatPostDateTime(post.updatedAt)}</TableCell>
                                        <TableCell className='text-right'>
                                            <Link className='inline-flex items-center justify-center rounded-xl border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-3 text-sm font-medium' href={`${APP_ROUTES.adminPosts}/${post.id}`}>进入编辑</Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
