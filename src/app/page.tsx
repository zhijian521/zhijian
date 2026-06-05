import type { Metadata } from 'next';
import Image from 'next/image';

import { PostCard } from '@/components/site/post-card';
import { ProjectCard, type ProjectAction } from '@/components/site/project-card';
import { ArrowDownIcon, ArrowRightIcon, BookIcon, CodeIcon, ExternalLinkIcon, GitHubIcon, MailIcon } from '@/components/ui/icons';
import { TextLink } from '@/components/ui/text-link';

import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Home - Zhijian',
};

/*== 项目数据 ==*/
const PROJECTS: { icon: React.ReactNode; title: string; description: string; tags: string[]; actions: ProjectAction[] }[] = [
    {
        icon: <CodeIcon />,
        title: 'simple-blog',
        description: '基于 Next.js 的极简个人博客，中国风设计，支持 Markdown 写作与后台管理。',
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

/*== 首页：纯静态展示，使用 theme.css 统一变量。 ==*/
export default function HomePage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <Image alt='山水留白背景' className={styles.heroBackground} fill priority sizes='100vw' src='/images/home-hero-bg.png' />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Zhi Jian</h1>
                    <p className={styles.heroSub}>前端开发 · 全栈 · 简约设计 · 造物</p>
                    <p className={styles.heroCopy}>写代码，也写文字；喜欢简洁的设计，追求美好的事物；一切在这里记录。</p>
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
                                喜欢简洁的设计，也喜欢安静地写点代码。偶尔捣鼓些小工具，把一闪而过的想法变成看得见的东西。这里没有宏大的叙事，只有一些零散的记录和简单的快乐。
                            </p>
                            <div className={styles.profileLinks}>
                                <a className={styles.inlineLink} href='mailto:yuwb0521@yeah.net'>
                                    <MailIcon className={styles.iconSmall} />
                                    联系我
                                </a>
                                <a className={styles.inlineLink} href='https://github.com/zhijian521' rel='noreferrer' target='_blank'>
                                    <ArrowRightIcon className={styles.iconSmall} />
                                    GitHub
                                </a>
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
                        <PostCard
                            tag='生活方式'
                            tagVariant='accent'
                            date='2026年5月20日'
                            title='茶道与留白的美学'
                            summary='在喧嚣的现代生活中，泡一壶清茶，体会杯盏间的留白。这不仅仅是一种饮品，更是一种减法生活的哲学实践。'
                            href='/blog/tea-ceremony'
                            visual={<div className={styles.postVisualTea} />}
                        />

                        <PostCard
                            tag='设计札记'
                            date='2026年5月15日'
                            title='秩序之美：网格系统的力量'
                            summary='探讨如何通过严谨的网格系统在数字设计中建立秩序感。和谐的视觉比例能够引导用户的视线，传递品牌的沉稳与专业。'
                            href='/blog/grid-system-order'
                            visual={<div className={styles.postVisualArchitecture} />}
                        />

                        <PostCard
                            tag='文化随笔'
                            tagVariant='accent'
                            date='2026年5月1日'
                            title='《考工记》与现代工艺精神'
                            summary='"天有时，地有气，材有美，工有巧，合此四者，然后可以为良。"重读古代造物典籍，寻找属于这个时代的工匠精神回归之路。'
                            href='/blog/craftsmanship'
                        />
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
