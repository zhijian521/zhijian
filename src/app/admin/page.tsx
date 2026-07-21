/*============================================================================
  page — 后台概览页

  服务端获取文章统计与用户数据，渲染指标卡片 + 近期文章表格。
============================================================================*/

import type { Metadata } from 'next';
import Link from 'next/link';

/*== 组件导入 ==*/
import { ArrowRightIcon, Edit3Icon, FileTextIcon, UsersIcon } from '@/components/ui/icons';
import { DataTable, type DataColumn } from '@/components/ui/data-table';
import { IconButton } from '@/components/ui/icon-button';
import { Tag } from '@/components/ui/tag';
import AdminPageHeader from '@/components/modules/admin/page-header';

/*== 数据与配置 ==*/
import { countUsersByRole } from '@/lib/core/auth';
import type { AdminPostListItem } from '@/lib/domain/posts';
import { formatPostDate, listAdminPosts } from '@/lib/domain/posts';
import { APP_ROUTES } from '@/lib/core/site';

/*== 样式导入 ==*/
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Admin',
};

/*== 后台概览页：从数据库读取真实文章与用户统计。 ==*/
export default async function AdminPage() {
    /* 近期文章按 pageSize 精确取 5 条；发布数用 status 筛选的 total 计数，避免全量拉取 */
    const [recentResult, publishedResult, userCounts] = await Promise.all([
        listAdminPosts({ page: 1, pageSize: 5 }),
        listAdminPosts({ page: 1, pageSize: 1, status: 'published' }),
        countUsersByRole(),
    ]);

    const totalPosts = recentResult.total;
    const publishedCount = publishedResult.total;
    const draftCount = totalPosts - publishedCount;
    const totalUsers = userCounts.admin + userCounts.user;
    const recentPosts = recentResult.data;

    const columns: DataColumn<AdminPostListItem>[] = [
        {
            header: '标题',
            render: (post) => <span className={styles.tdTitle}>{post.title}</span>,
        },
        {
            header: '状态',
            hideBelow: 'sm',
            render: (post) => (
                <Tag size="mini" variant={post.status === 'published' ? 'primary' : 'default'}>
                    {post.status === 'published' ? '已发布' : '草稿'}
                </Tag>
            ),
        },
        {
            header: '日期',
            hideBelow: 'md',
            render: (post) => <span className={styles.tdMuted}>{formatPostDate(post.publishedAt)}</span>,
        },
        {
            header: '操作',
            width: '4rem',
            render: (post) => (
                <IconButton
                    href={`${APP_ROUTES.adminPosts}/${post.id}`}
                    icon={<Edit3Icon />}
                    target="_blank"
                    title="编辑"
                />
            ),
        },
    ];

    return (
        <div className={styles.page}>
            <AdminPageHeader
                description="欢迎回来，这里是当前站点内容与数据的概览。"
                eyebrow="Overview"
                tag={`${totalPosts} 篇文章 · ${totalUsers} 个用户`}
                title="概览"
            />

            {/* 指标卡片 */}
            <section className={styles.metrics}>
                <MetricCard
                    description={`${publishedCount} 篇已发布`}
                    icon={<FileTextIcon className={styles.metricIcon} />}
                    title="文章"
                    value={`${totalPosts}`}
                />
                <MetricCard
                    description={`${userCounts.admin} 管理员 · ${userCounts.user} 用户`}
                    icon={<UsersIcon className={styles.metricIcon} />}
                    title="用户"
                    value={`${totalUsers}`}
                />
                <MetricCard
                    description="草稿与已发布"
                    icon={<Edit3Icon className={styles.metricIcon} />}
                    title="状态"
                    value={`${draftCount} / ${publishedCount}`}
                />
            </section>

            {/* 近期文章 */}
            <section>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>近期文章</h2>
                    <Link className={styles.viewAllLink} href={APP_ROUTES.adminPosts}>
                        查看全部
                        <ArrowRightIcon className={styles.viewAllIcon} />
                    </Link>
                </div>

                <DataTable columns={columns} emptyText="暂无文章" rowKey={(post) => post.id} rows={recentPosts} />
            </section>
        </div>
    );
}

interface MetricCardProps {
    description: string;
    icon: React.ReactNode;
    title: string;
    value: string;
}

/*== 指标卡片：匹配博客 projectCard 风格。 ==*/
function MetricCard({ description, icon, title, value }: MetricCardProps) {
    return (
        <div className={`${styles.metricCard} admin-stitch-card`}>
            <div className={styles.metricHeader}>
                <p className={styles.metricLabel}>{title}</p>
                <div className={styles.metricIconWrap}>{icon}</div>
            </div>
            <div>
                <h3 className="admin-stitch-number">{value}</h3>
                <p className={styles.metricDesc}>{description}</p>
            </div>
        </div>
    );
}
