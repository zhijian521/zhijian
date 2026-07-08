import type { Metadata } from 'next';

/*== 组件导入 ==*/
import { HeroSection } from '@/components/modules/home/hero-section';
import { ProfileSection } from '@/components/modules/home/profile-section';
import { PostsSection } from '@/components/modules/home/posts-section';
import { ProjectsSection } from '@/components/modules/home/projects-section';
import { BookIcon, CodeIcon, ExternalLinkIcon, GitHubIcon } from '@/components/ui/icons';

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';
import { getPublishedPosts } from '@/lib/domain/posts';
import { fetchCommitHistory } from '@/lib/domain/github';

/*== 服务端渲染 ==*/
export const dynamic = 'force-dynamic';

/*== 页面元数据 ==*/
export const metadata: Metadata = {
    title: SITE_METADATA.brandTitle,
    description: SITE_METADATA.description,
    keywords: [...SITE_METADATA.keywords],
    authors: [{ name: SITE_METADATA.author }],
    creator: SITE_METADATA.author,
    publisher: SITE_METADATA.author,
    alternates: { canonical: SITE_METADATA.siteUrl },
    openGraph: {
        title: SITE_METADATA.brandTitle,
        description: SITE_METADATA.description,
        url: SITE_METADATA.siteUrl,
        images: [{ url: SITE_METADATA.ogImage, alt: SITE_METADATA.brandTitle }],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_METADATA.brandTitle,
        description: SITE_METADATA.description,
        images: [SITE_METADATA.ogImage],
    },
};

/*== 开源项目信息 ==*/
const PROJECTS = [
    {
        icon: <CodeIcon />,
        title: 'zhijian',
        description: '知简 — 极简个人站点，博客写作、导航书签与后台管理，追求简洁与实用。',
        tags: ['Next.js', 'TypeScript'],
        actions: [
            { label: '访问站点', href: 'https://yuwb.dev/', icon: <ExternalLinkIcon /> },
            { label: 'GitHub', href: 'https://github.com/zhijian521/zhijian', icon: <GitHubIcon /> },
        ],
    },
    {
        icon: <BookIcon />,
        title: 'cesium-example',
        description: 'Cesium 三维地球示例集，涵盖地图加载、模型渲染与空间数据可视化。',
        tags: ['Cesium', 'GIS'],
        actions: [
            { label: '访问站点', href: 'https://yuwb.dev/cesium', icon: <ExternalLinkIcon /> },
            { label: 'GitHub', href: 'https://github.com/zhijian521/cesium-example', icon: <GitHubIcon /> },
        ],
    },
];

export default async function HomePage() {
    /*-- 获取文章与提交记录（互不依赖，并行请求） --*/
    const [posts, commitData] = await Promise.all([
        getPublishedPosts({ limit: 3 }),
        fetchCommitHistory(),
    ]);

    /*-- 结构化数据 --*/
    const homeJsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${SITE_METADATA.siteUrl}#website`,
                url: SITE_METADATA.siteUrl,
                name: SITE_METADATA.title,
                description: SITE_METADATA.description,
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
                description: SITE_METADATA.description,
                isPartOf: { '@id': `${SITE_METADATA.siteUrl}#website` },
                about: { '@id': `${SITE_METADATA.siteUrl}#author` },
            },
            {
                '@type': 'ItemList',
                '@id': `${SITE_METADATA.siteUrl}#latest-posts`,
                name: `${SITE_METADATA.title}最新文章`,
                itemListOrder: 'https://schema.org/ItemListOrderDescending',
                numberOfItems: posts.length,
                itemListElement: posts.map((post, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    url: `${SITE_METADATA.siteUrl}/blog/${post.slug}`,
                    name: post.title,
                    description: post.summary,
                })),
            },
        ],
    };

    /*-- 首页页面 --*/
    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
            <HeroSection />
            <div className="page-content">
                <ProfileSection commitData={commitData} />
                <PostsSection posts={posts} />
                <ProjectsSection projects={PROJECTS} />
            </div>
        </main>
    );
}
