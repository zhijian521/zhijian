'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

import styles from '../page.module.css';

/*== 文章数据（暂写死） ==*/
const ALL_POSTS = [
    { id: 1, slug: 'white-space-design', title: '留白的力量：在界面设计中寻找呼吸感', cover: '/images/home-hero-bg.png', summary: '探讨如何在现代数字产品中运用中国传统水墨画中的留白哲学，通过减少视觉噪音来增强用户的专注力。', category: '设计思考', tags: ['UI/UX', '极简主义'], date: '2026-05-20' },
    { id: 2, slug: 'grid-system-order', title: '秩序之美：网格系统的力量', summary: '探讨如何通过严谨的网格系统在数字设计中建立秩序感，和谐的视觉比例引导用户的视线。', category: '设计札记', tags: ['UI/UX', 'CSS'], date: '2026-05-15' },
    { id: 3, slug: 'material-subtraction', title: '物质的减法与精神的加法', summary: '在消费主义盛行的时代，尝试通过减少物质负担来获得精神上的自由与宁静。', category: '生活方式', tags: ['极简主义', '哲学'], date: '2026-05-10' },
    { id: 4, slug: 'zhuangzi-wisdom', title: '无用之用：庄子思想在现代生活中的映射', summary: '庄子说"人皆知有用之用，而莫知无用之用也"，探讨这句话在快节奏现代生活中的深刻启示。', category: '文化随笔', tags: ['哲学', '东方智慧'], date: '2026-05-05' },
    { id: 5, slug: 'tea-ceremony', title: '茶道与留白的美学', cover: '/images/logo.png', summary: '泡一壶清茶，体会杯盏间的留白。这不仅是饮品，更是一种减法生活的哲学实践。', category: '生活方式', tags: ['茶道', '极简主义'], date: '2026-04-28' },
    { id: 6, slug: 'craftsmanship', title: '《考工记》与现代工艺精神', summary: '重读古代造物典籍，寻找属于这个时代的工匠精神回归之路。', category: '文化随笔', tags: ['东方智慧', '设计'], date: '2026-04-20' },
    { id: 7, slug: 'nextjs-blog', title: '用 Next.js 搭建个人博客的实践笔记', summary: '从零开始记录搭建过程，包括路由、数据层、样式方案的选择思路与踩坑经验。', category: '前端开发', tags: ['Next.js', 'TypeScript'], date: '2026-04-12' },
    { id: 8, slug: 'css-modules', title: '为什么我选择 CSS Modules 而不是 Tailwind', cover: '/images/home-hero-bg.png', summary: '关于样式方案选型的个人思考：可读性、可维护性与团队协作的权衡。', category: '前端开发', tags: ['CSS', '工具链'], date: '2026-04-05' },
    { id: 9, slug: 'four-seasons', title: '四季的韵律：观察一棵树的生长历程', summary: '通过长达一年的定点观察，记录银杏树从抽芽到落叶的全过程，体悟时间的流转。', category: '自然', tags: ['自然观察', '随笔'], date: '2026-03-28' },
    { id: 10, slug: 'silence-in-noise', title: '动中求静：在喧嚣世界中寻找宁静', summary: '如何在信息爆炸的时代保持内心的平和与专注？一些日常实践分享。', category: '生活方式', tags: ['正念', '哲学'], date: '2026-03-20' },
    { id: 11, slug: 'cesium-intro', title: 'Cesium 入门：从零搭建三维地球应用', summary: '记录学习 Cesium.js 的过程，包括环境搭建、基础配置与第一个示例。', category: '前端开发', tags: ['Cesium', 'GIS'], date: '2026-03-12' },
    { id: 12, slug: 'color-theory', title: '色彩的情绪：浅谈网页配色中的东方美学', summary: '从传统中国画中提取配色灵感，应用到现代网页设计中。', category: '设计思考', tags: ['UI/UX', '东方美学'], date: '2026-03-05' },
];

const ALL_CATEGORIES = ['全部', '前端开发', '设计思考', '设计札记', '生活方式', '文化随笔', '自然'];
const ALL_TAGS = ['UI/UX', '极简主义', 'CSS', '哲学', '东方智慧', '茶道', '东方美学', 'Cesium', 'GIS', 'Next.js', 'TypeScript', '工具链', '正念', '自然观察', '随笔', '设计'];

const PAGE_SIZE = 6;

/*== 博客列表客户端组件 ==*/
export default function BlogListClient() {
    const [category, setCategory] = useState('全部');
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        let result = ALL_POSTS;

        if (category !== '全部') {
            result = result.filter((p) => p.category === category);
        }

        if (activeTags.length > 0) {
            result = result.filter((p) => activeTags.some((t) => p.tags.includes(t)));
        }

        return result;
    }, [category, activeTags]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function toggleTag(tag: string) {
        setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
        setPage(1);
    }

    return (
        <main className={styles.page}>
            <header className={styles.pageHeader}>
                <h1 className={styles.headerTitle}>文章</h1>
            </header>

            <div className={styles.layout}>
                <section className={styles.main}>
                    <div className={styles.list}>
                        {paged.map((post) => (
                            <Link className={styles.listItem} href={`/blog/${post.slug}`} key={post.id}>
                                <div className={styles.itemBody}>
                                    <h2 className={styles.itemTitle}>{post.title}</h2>
                                    <p className={styles.itemSummary}>{post.summary}</p>
                                    <div className={styles.itemMeta}>
                                        <span className={styles.itemCategory}>{post.category}</span>
                                        {post.tags.map((tag) => (
                                            <span className={styles.itemTag} key={tag}>{tag}</span>
                                        ))}
                                        <span className={styles.itemDate}>{post.date}</span>
                                    </div>
                                </div>
                                {post.cover ? (
                                    <div className={styles.itemCover}>
                                        <img alt='' src={post.cover} />
                                    </div>
                                ) : null}
                            </Link>
                        ))}
                    </div>

                    {totalPages > 1 ? (
                        <div className={styles.pagination}>
                            <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage(page - 1)} type="button">上一页</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    className={`${styles.pageBtn} ${page === n ? styles.pageActive : ''}`}
                                    key={n}
                                    onClick={() => setPage(n)}
                                    type="button"
                                >
                                    {n}
                                </button>
                            ))}
                            <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)} type="button">下一页</button>
                        </div>
                    ) : null}
                </section>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>分类</h3>
                        <div className={styles.categories}>
                            {ALL_CATEGORIES.map((cat) => (
                                <button
                                    className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                                    key={cat}
                                    onClick={() => { setCategory(cat); setPage(1); }}
                                    type="button"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>标签</h3>
                        <div className={styles.tagFilter}>
                            {ALL_TAGS.map((tag) => (
                                <button
                                    className={`${styles.tagBtn} ${activeTags.includes(tag) ? styles.tagActive : ''}`}
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    type="button"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
