/*== 文章发布状态：草稿或已发布。 ==*/
export type PostStatus = 'draft' | 'published';

/*== 文章核心数据模型，前后台共用。 ==*/
export interface Post {
    id: number;
    slug: string;
    title: string;
    summary: string;
    content: string;
    coverImage: string | null;
    altText: string | null;
    categoryId: number | null;
    tags: number[];
    status: PostStatus;
    publishedAt: string | null;
    updatedAt: string | null;
    /* 查询时拼装的展示字段，不存数据库 */
    categoryName?: string;
    tagNames?: { id: number; name: string; slug: string }[];
}

/*== 前台阅读页使用更偏内容展示的日期格式。 ==*/
export function formatPostDate(value: string | null): string {
    if (!value) {
        return '未发布';
    }

    const normalized = value.replace(' ', 'T');
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

/*== 后台与详情页使用包含时间的格式，便于区分最近更新节奏。 ==*/
export function formatPostDateTime(value: string | null): string {
    if (!value) {
        return '未设置';
    }

    const normalized = value.replace(' ', 'T');
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

/*== 把数据库中的日期字符串转换成 `datetime-local` 需要的值。 ==*/
export function toDateTimeLocalValue(value: string | null): string {
    if (!value) {
        return '';
    }

    return value.replace(' ', 'T').slice(0, 16);
}

/*== 按空行拆分文章内容，方便详情页按段落渲染。 ==*/
export function splitPostContent(content: string): string[] {
    return content
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}
