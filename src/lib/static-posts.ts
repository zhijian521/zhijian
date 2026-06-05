import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const CONTENT_DIR = join(process.cwd(), 'src/content/posts');

/*== 文章元数据（与 MD 文件名对应） ==*/
interface PostMeta {
    title: string;
    subtitle: string;
    category: string;
    date: string;
    tags: string[];
}

const POST_META: Record<string, PostMeta> = {
    'tea-ceremony': {
        title: '茶道与留白的美学',
        subtitle: '在喧嚣的现代生活中，泡一壶清茶，体会杯盏间的留白。这不仅仅是一种饮品，更是一种减法生活的哲学实践。',
        category: '生活方式',
        date: '2026年5月20日',
        tags: ['茶道', '极简主义'],
    },
    'grid-system-order': {
        title: '秩序之美：网格系统的力量',
        subtitle: '探讨如何通过严谨的网格系统在数字设计中建立秩序感。和谐的视觉比例能够引导用户的视线，传递品牌的沉稳与专业。',
        category: '设计札记',
        date: '2026年5月15日',
        tags: ['UI/UX', 'CSS'],
    },
    'craftsmanship': {
        title: '《考工记》与现代工艺精神',
        subtitle: '"天有时，地有气，材有美，工有巧，合此四者，然后可以为良。"重读古代造物典籍，寻找属于这个时代的工匠精神回归之路。',
        category: '文化随笔',
        date: '2026年5月1日',
        tags: ['东方智慧', '设计'],
    },
    'white-space-design': {
        title: '留白的力量：在界面设计中寻找呼吸感',
        subtitle: '探讨如何在现代数字产品中运用中国传统水墨画中的留白哲学，通过减少视觉噪音来增强用户的专注力。',
        category: '设计思考',
        date: '2026年5月20日',
        tags: ['UI/UX', '极简主义'],
    },
    'material-subtraction': {
        title: '物质的减法与精神的加法',
        subtitle: '在消费主义盛行的时代，尝试通过减少物质负担来获得精神上的自由与宁静。',
        category: '生活方式',
        date: '2026年5月10日',
        tags: ['极简主义', '哲学'],
    },
    'zhuangzi-wisdom': {
        title: '无用之用：庄子思想在现代生活中的映射',
        subtitle: '庄子说"人皆知有用之用，而莫知无用之用也"，探讨这句话在快节奏现代生活中的深刻启示。',
        category: '文化随笔',
        date: '2026年5月5日',
        tags: ['哲学', '东方智慧'],
    },
    'nextjs-blog': {
        title: '用 Next.js 搭建个人博客的实践笔记',
        subtitle: '从零开始记录搭建过程，包括路由、数据层、样式方案的选择思路与踩坑经验。',
        category: '前端开发',
        date: '2026年4月12日',
        tags: ['Next.js', 'TypeScript'],
    },
    'css-modules': {
        title: '为什么我选择 CSS Modules 而不是 Tailwind',
        subtitle: '关于样式方案选型的个人思考：可读性、可维护性与团队协作的权衡。',
        category: '前端开发',
        date: '2026年4月5日',
        tags: ['CSS', '工具链'],
    },
    'four-seasons': {
        title: '四季的韵律：观察一棵树的生长历程',
        subtitle: '通过长达一年的定点观察，记录银杏树从抽芽到落叶的全过程，体悟时间的流转。',
        category: '自然',
        date: '2026年3月28日',
        tags: ['自然观察', '随笔'],
    },
    'silence-in-noise': {
        title: '动中求静：在喧嚣世界中寻找宁静',
        subtitle: '如何在信息爆炸的时代保持内心的平和与专注？一些日常实践分享。',
        category: '生活方式',
        date: '2026年3月20日',
        tags: ['正念', '哲学'],
    },
    'cesium-intro': {
        title: 'Cesium 入门：从零搭建三维地球应用',
        subtitle: '记录学习 Cesium.js 的过程，包括环境搭建、基础配置与第一个示例。',
        category: '前端开发',
        date: '2026年3月12日',
        tags: ['Cesium', 'GIS'],
    },
    'color-theory': {
        title: '色彩的情绪：浅谈网页配色中的东方美学',
        subtitle: '从传统中国画中提取配色灵感，应用到现代网页设计中。',
        category: '设计思考',
        date: '2026年3月5日',
        tags: ['UI/UX', '东方美学'],
    },
    'build-a-next-fullstack-personal-site': {
        title: '构建 Next.js 全栈个人站点',
        subtitle: '从零搭建一个集博客、后台管理于一体的全栈站点。',
        category: '前端开发',
        date: '2026年4月10日',
        tags: ['Next.js', '全栈'],
    },
    'why-self-hosted-admin-can-be-simpler': {
        title: '自建后台为何可以更简单',
        subtitle: '反思过度工程化的后台方案，回归简约。',
        category: '架构',
        date: '2026年3月20日',
        tags: ['架构', '极简'],
    },
};

/*== 获取所有文章 slug ==*/
export function getStaticPostSlugs(): string[] {
    return Object.keys(POST_META);
}

/*== 按 slug 获取文章元数据 ==*/
export function getStaticPostMeta(slug: string): PostMeta | null {
    return POST_META[slug] ?? null;
}

/*== 按 slug 读取文章 Markdown 正文（所有文章暂共用 shared.md） ==*/
export async function getStaticPostContent(_slug: string): Promise<string | null> {
    try {
        const filePath = join(CONTENT_DIR, 'shared.md');
        return await readFile(filePath, 'utf-8');
    } catch {
        return null;
    }
}

/*== 获取所有 MD 文件名（用于 validate content 目录一致性） ==*/
export async function getAvailableSlugs(): Promise<string[]> {
    try {
        const files = await readdir(CONTENT_DIR);
        return files
            .filter((f) => f.endsWith('.md'))
            .map((f) => f.replace(/\.md$/, ''));
    } catch {
        return [];
    }
}
