import type { Metadata } from 'next';
import Image from 'next/image';

import { ContentImage } from '@/components/site/content-image';
import { PostCard } from '@/components/site/post-card';
import { ProjectCard, type ProjectAction } from '@/components/site/project-card';
import { GhostButton } from '@/components/ui/ghost-button';
import {
    ArrowDownIcon,
    ArrowRightIcon,
    BookIcon,
    CodeIcon,
    ExternalLinkIcon,
    GitHubIcon,
    MailIcon,
} from '@/components/ui/icons';
import { TextLink } from '@/components/ui/text-link';
import { getPublishedPosts } from '@/lib/posts';
import { formatPostDate } from '@/lib/post-shared';
import { SITE_METADATA } from '@/lib/site';

import { RssCopyButton } from './_components/rss-copy-button';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: SITE_METADATA.brandTitle,
    description: SITE_METADATA.blogDescription,
    keywords: [...SITE_METADATA.keywords],
    authors: [{ name: SITE_METADATA.author }],
    creator: SITE_METADATA.author,
    publisher: SITE_METADATA.author,
    alternates: {
        canonical: SITE_METADATA.siteUrl,
    },
    openGraph: {
        title: SITE_METADATA.brandTitle,
        description: SITE_METADATA.blogDescription,
        url: SITE_METADATA.siteUrl,
        images: [{ url: SITE_METADATA.ogImage, alt: SITE_METADATA.brandTitle }],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_METADATA.brandTitle,
        description: SITE_METADATA.blogDescription,
        images: [SITE_METADATA.ogImage],
    },
};

/*== 首页文章区依赖数据库最新内容，禁用 ISR，避免部署后先返回构建期博客数据。 ==*/
export const dynamic = 'force-dynamic';

/*== 项目数据 ==*/
const PROJECTS: { icon: React.ReactNode; title: string; description: string; tags: string[]; actions: ProjectAction[] }[] = [
    {
        icon: <CodeIcon />,
        title: 'simple-blog',
        description: '基于 Next.js 的极简个人博客，支持 Markdown 写作与后台管理。',
        tags: ['Next.js', 'TypeScript'],
        actions: [
            { label: '访问站点', href: 'https://www.yuwb.dev/', icon: <ExternalLinkIcon /> },
            { label: 'GitHub', href: 'https://github.com/zhijian521/simple-blog', icon: <GitHubIcon /> },
        ],
    },
    {
        icon: <BookIcon />,
        title: 'cesium-example',
        description: 'Cesium 三维地球示例集，涵盖地图加载、模型渲染与空间数据可视化。',
        tags: ['Cesium', 'GIS'],
        actions: [
            { label: '访问站点', href: 'https://cesium.yuwb.dev/', icon: <ExternalLinkIcon /> },
            { label: 'GitHub', href: 'https://github.com/zhijian521/cesium-example', icon: <GitHubIcon /> },
        ],
    },
];

/*== 首页：从数据库读取最新文章 + 静态项目信息展示。 ==*/
export default async function HomePage() {
    const posts = await getPublishedPosts({ limit: 3 });
    const homeJsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${SITE_METADATA.siteUrl}#website`,
                url: SITE_METADATA.siteUrl,
                name: SITE_METADATA.title,
                description: SITE_METADATA.blogDescription,
                inLanguage: 'zh-CN',
            },
            {
                '@type': 'Person',
                '@id': `${SITE_METADATA.siteUrl}#author`,
                name: SITE_METADATA.author,
                url: SITE_METADATA.siteUrl,
            },
            {
                '@type': 'CollectionPage',
                '@id': `${SITE_METADATA.siteUrl}#home`,
                url: SITE_METADATA.siteUrl,
                name: SITE_METADATA.brandTitle,
                description: SITE_METADATA.blogDescription,
                isPartOf: { '@id': `${SITE_METADATA.siteUrl}#website` },
                about: { '@id': `${SITE_METADATA.siteUrl}#author` },
            },
            {
                '@type': 'ItemList',
                '@id': `${SITE_METADATA.siteUrl}#latest-posts`,
                name: `${SITE_METADATA.title}最新文章`,
                itemListOrder: 'https://schema.org/ItemListOrderDescending',
                numberOfItems: posts.length,
                itemListElement: posts.map((post, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
                    name: post.title,
                    description: post.summary,
                })),
            },
        ],
    };

    return (
        <main className={styles.page}>
            <script
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
            />
            <section className={styles.hero}>
                <Image
                    alt='山水留白背景'
                    className={styles.heroBackground}
                    fill
                    priority
                    sizes='100vw'
                    src='/images/home-hero-bg.png'
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Zhi Jian</h1>
                    <p className={styles.heroSub}>前端开发 · 全栈 · 简约设计 · 造物</p>
                    <p className={styles.heroCopy}>
                        写代码，也写文字；喜欢简洁的设计，追求美好的事物；一切在这里记录。
                    </p>
                    <a className={styles.heroButton} href='#about-me'>
                        开始探索
                        <ArrowDownIcon className={styles.iconSmall} />
                    </a>
                </div>
            </section>

            <div className={styles.content}>
                <section className={styles.section} id='about-me'>
                    <div className={styles.sectionHeading}>
                        <h2 className={styles.sectionTitle}>个人信息</h2>
                        <div className={styles.sectionLine} />
                    </div>

                    <div className={styles.profileCard}>
                        <div className={styles.avatarWrap}>
                            <div className={styles.avatarFrame}>
                                <Image alt='Lin Zhi' className={styles.avatar} fill sizes='160px' src='/images/logo.png' />
                            </div>
                        </div>

                        <div className={styles.profileBody}>
                            <h3 className={styles.profileName}>Zhi Jian</h3>
                            <p className={styles.profileMeta}>前端开发 · 全栈 · 简约设计 · 造物</p>
                            <p className={styles.profileCopy}>
                                喜欢简洁的设计，也喜欢安静地写点代码。偶尔捣鼓些小工具，把一闪而过的想法变成看得见的东西。
                                这里没有宏大的叙事，只有一些零散的记录和简单的快乐。
                            </p>
                            <div className={styles.profileLinks}>
                                <GhostButton
                                    href='mailto:yuwb0521@yeah.net'
                                    icon={<MailIcon />}
                                    size='small'
                                >
                                    联系我
                                </GhostButton>
                                <GhostButton
                                    href='https://github.com/zhijian521'
                                    icon={<ArrowRightIcon />}
                                    rel='noreferrer'
                                    size='small'
                                    target='_blank'
                                >
                                    GitHub
                                </GhostButton>
                                <RssCopyButton />
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeading}>
                        <h2 className={styles.sectionTitle}>最新文章</h2>
                        <div className={styles.sectionLine} />
                        <TextLink href='/blog'>查看全部</TextLink>
                    </div>

                    <div className={styles.postsGrid}>
                        {posts.length > 0 ? posts.map((post) => (
                            <PostCard
                                key={post.id}
                                tag={post.categoryName ?? undefined}
                                tagVariant='primary'
                                date={formatPostDate(post.publishedAt)}
                                title={post.title}
                                summary={post.summary}
                                href={`/blog/${post.slug}`}
                                visual={post.coverImage ? (
                                    <ContentImage
                                        alt={post.altText || post.title}
                                        sizes='(min-width: 1024px) 22rem, 100vw'
                                        src={post.coverImage}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : undefined}
                            />
                        )) : (
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem' }}>
                                暂无文章。
                            </p>
                        )}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeading}>
                        <h2 className={styles.sectionTitle}>开源项目</h2>
                        <div className={styles.sectionLine} />
                    </div>

                    <div className={styles.projectsGrid}>
                        {PROJECTS.map((project) => (
                            <ProjectCard key={project.title} {...project} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
