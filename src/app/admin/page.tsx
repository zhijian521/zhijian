import type { Metadata } from 'next';
import Link from 'next/link';

import { ArrowRightIcon, Edit3Icon, FileTextIcon, UsersIcon } from '@/components/ui/icons';
import { MOCK_POSTS, MOCK_USERS } from '@/lib/mock-data';
import { APP_ROUTES } from '@/lib/site';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Admin - Zhijian',
};

/*== 后台概览页：静态展示统计指标和近期文章（数据待接入 API 后改为动态）。 ==*/
export default function AdminPage() {
    const posts = MOCK_POSTS;
    const publishedPosts = posts.filter((post) => post.status === 'published');
    const recentPosts = posts.slice(0, 5);
    const totalUsers = MOCK_USERS.length;
    const adminCount = MOCK_USERS.filter((u) => u.role === 'admin').length;
    const userCount = MOCK_USERS.filter((u) => u.role === 'user').length;

    return (
        <div className={styles.page}>
            {/* 头部 */}
            <header>
                <h1 className='admin-title'>概览</h1>
                <p className={`${styles.copy} admin-copy`}>欢迎回来，这里是当前站点内容与数据的概览。</p>
            </header>

            {/* 指标卡片 */}
            <section className={styles.metrics}>
                <MetricCard
                    description={`${publishedPosts.length} 篇已发布`}
                    icon={<FileTextIcon className={styles.metricIcon} />}
                    title='文章'
                    value={`${posts.length}`}
                />
                <MetricCard
                    description={`${adminCount} 管理员 · ${userCount} 用户`}
                    icon={<UsersIcon className={styles.metricIcon} />}
                    title='用户'
                    value={`${totalUsers}`}
                />
                <MetricCard
                    description='草稿与已发布'
                    icon={<Edit3Icon className={styles.metricIcon} />}
                    title='状态'
                    value={`${posts.length - publishedPosts.length} / ${publishedPosts.length}`}
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

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr className={styles.thead}>
                                <th className={styles.th}>标题</th>
                                <th className={`${styles.th} ${styles.hideSm}`}>状态</th>
                                <th className={`${styles.th} ${styles.hideMd}`}>日期</th>
                                <th className={styles.thAction}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPosts.map((post) => (
                                <tr className={styles.row} key={post.id}>
                                    <td className={styles.tdTitle}>
                                        {post.title}
                                    </td>
                                    <td className={`${styles.td} ${styles.hideSm}`}>
                                        <span className={post.status === 'published' ? styles.badgePrimary : styles.badgeMuted}>
                                            {post.status === 'published' ? '已发布' : '草稿'}
                                        </span>
                                    </td>
                                    <td className={`${styles.tdMuted} ${styles.hideMd}`}>
                                        {post.publishedAt ?? '-'}
                                    </td>
                                    <td className={styles.tdAction}>
                                        <Link className={styles.editLink} href={`${APP_ROUTES.adminPosts}/${post.id}`}>
                                            <Edit3Icon className={styles.iconSmall} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                <div className={styles.metricIconWrap}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 className='admin-stitch-number'>{value}</h3>
                <p className={styles.metricDesc}>
                    {description}
                </p>
            </div>
        </div>
    );
}