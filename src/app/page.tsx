import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'Home - Zhijian',
};

/*== 首页：纯静态展示，布局不变，使用 theme.css 统一变量。 ==*/
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
                        <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M19 14l-7 7m0 0l-7-7m7 7V3' strokeLinecap='round' strokeLinejoin='round' /></svg>
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
                                    <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' strokeLinecap='round' strokeLinejoin='round' /></svg>
                                    联系我
                                </a>
                                <a className={styles.inlineLink} href='https://github.com/zhijian521' rel='noreferrer' target='_blank'>
                                    <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M5 12h14m0 0l-7-7m7 7l-7 7' strokeLinecap='round' strokeLinejoin='round' /></svg>
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
                        <Link className={styles.sectionMore} href='/blog'>
                            查看全部
                            <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M5 12h14m0 0l-7-7m7 7l-7 7' strokeLinecap='round' strokeLinejoin='round' /></svg>
                        </Link>
                    </div>

                    <div className={styles.postsGrid}>
                        {/* 文章 1：茶道与留白 */}
                        <article className={styles.postCard}>
                            <div className={styles.postMedia}>
                                <div className={styles.postVisualTea} />
                            </div>
                            <div className={styles.postBody}>
                                <div className={styles.postMetaRow}>
                                    <span className={styles.postMetaAccent}>生活方式</span>
                                    <span className={styles.postDate}>2026年5月20日</span>
                                </div>
                                <h3 className={styles.postTitle}>茶道与留白的美学</h3>
                                <p className={styles.postSummary}>在喧嚣的现代生活中，泡一壶清茶，体会杯盏间的留白。这不仅仅是一种饮品，更是一种减法生活的哲学实践。</p>
                                <Link className={styles.readMore} href='/blog/tea-ceremony'>
                                    阅读更多
                                    <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M5 12h14m0 0l-7-7m7 7l-7 7' strokeLinecap='round' strokeLinejoin='round' /></svg>
                                </Link>
                            </div>
                        </article>

                        {/* 文章 2：秩序之美 */}
                        <article className={styles.postCard}>
                            <div className={styles.postMedia}>
                                <div className={styles.postVisualArchitecture} />
                            </div>
                            <div className={styles.postBody}>
                                <div className={styles.postMetaRow}>
                                    <span className={styles.postTag}>设计札记</span>
                                    <span className={styles.postDate}>2026年5月15日</span>
                                </div>
                                <h3 className={styles.postTitle}>秩序之美：网格系统的力量</h3>
                                <p className={styles.postSummary}>探讨如何通过严谨的网格系统在数字设计中建立秩序感。和谐的视觉比例能够引导用户的视线，传递品牌的沉稳与专业。</p>
                                <Link className={styles.readMore} href='/blog/grid-system-order'>
                                    阅读更多
                                    <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M5 12h14m0 0l-7-7m7 7l-7 7' strokeLinecap='round' strokeLinejoin='round' /></svg>
                                </Link>
                            </div>
                        </article>

                        {/* 文章 3：《考工记》 */}
                        <article className={styles.textPostCard}>
                            <div className={styles.postBody}>
                                <div className={styles.postMetaRow}>
                                    <span className={styles.postMetaAccent}>文化随笔</span>
                                    <span className={styles.postDate}>2026年5月1日</span>
                                </div>
                                <h3 className={styles.postTitle}>《考工记》与现代工艺精神</h3>
                                <p className={styles.postSummary}>"天有时，地有气，材有美，工有巧，合此四者，然后可以为良。"重读古代造物典籍，寻找属于这个时代的工匠精神回归之路。</p>
                                <Link className={styles.readMore} href='/blog/craftsmanship'>
                                    阅读更多
                                    <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M5 12h14m0 0l-7-7m7 7l-7 7' strokeLinecap='round' strokeLinejoin='round' /></svg>
                                </Link>
                            </div>
                        </article>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeading}>
                        <h2 className={styles.sectionTitle}>开源项目</h2>
                        <div className={styles.sectionLine} />
                    </div>

                    <div className={styles.projectsGrid}>
                        <div className={styles.projectCard}>
                            <div className={styles.projectHeader}>
                                <div className={styles.projectTitleRow}>
                                    <svg className={styles.projectIcon} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M16 18l6-6-6-6M8 6l-6 6 6 6' strokeLinecap='round' strokeLinejoin='round' /></svg>
                                    <h3 className={styles.projectTitle}>simple-blog</h3>
                                </div>
                            </div>
                            <p className={styles.projectCopy}>基于 Next.js 的极简个人博客，中国风设计，支持 Markdown 写作与后台管理。</p>
                            <div className={styles.projectTags}>
                                <span className={styles.projectTag}>Next.js</span>
                                <span className={styles.projectTag}>TypeScript</span>
                            </div>
                            <div className={styles.projectActions}>
                                <a className={styles.projectAction} href='https://www.yuwb.dev/' rel='noreferrer' target='_blank'>
                                    <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' strokeLinecap='round' strokeLinejoin='round' /></svg>
                                    访问站点
                                </a>
                                <a className={styles.projectAction} href='https://github.com/zhijian521/simple-blog' rel='noreferrer' target='_blank'>
                                    <svg className={styles.iconSmall} fill='currentColor' viewBox='0 0 24 24'><path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' /></svg>
                                    GitHub
                                </a>
                            </div>
                        </div>

                        <div className={styles.projectCard}>
                            <div className={styles.projectHeader}>
                                <div className={styles.projectTitleRow}>
                                    <svg className={styles.projectIcon} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' strokeLinecap='round' strokeLinejoin='round' /></svg>
                                    <h3 className={styles.projectTitle}>cesium-example</h3>
                                </div>
                            </div>
                            <p className={styles.projectCopy}>Cesium 三维地球示例集，涵盖地图加载、模型渲染与空间数据可视化。</p>
                            <div className={styles.projectTags}>
                                <span className={styles.projectTag}>Cesium</span>
                                <span className={styles.projectTag}>GIS</span>
                            </div>
                            <div className={styles.projectActions}>
                                <a className={styles.projectAction} href='https://cesium.yuwb.dev/' rel='noreferrer' target='_blank'>
                                    <svg className={styles.iconSmall} fill='none' stroke='currentColor' strokeWidth={2} viewBox='0 0 24 24'><path d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' strokeLinecap='round' strokeLinejoin='round' /></svg>
                                    访问站点
                                </a>
                                <a className={styles.projectAction} href='https://github.com/zhijian521/cesium-example' rel='noreferrer' target='_blank'>
                                    <svg className={styles.iconSmall} fill='currentColor' viewBox='0 0 24 24'><path d='M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' /></svg>
                                    GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
