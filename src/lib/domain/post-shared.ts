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
    categoryName?: string;
    tagNames?: { id: number; name: string; slug: string }[];
}

const CHINA_TIME_ZONE = 'Asia/Shanghai';
const CHINA_UTC_OFFSET_HOURS = 8;
const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

/*== 将数据库中的时间字符串按中国时区解释，避免依赖服务器本地时区。 ==*/
export function parsePostDate(value: string | null): Date | null {
    if (!value) {
        return null;
    }

    if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
        const directDate = new Date(value);
        return Number.isNaN(directDate.getTime()) ? null : directDate;
    }

    const matched = value.match(DATE_TIME_PATTERN);
    if (matched) {
        const [, year, month, day, hours = '00', minutes = '00', seconds = '00'] = matched;

        return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours) - CHINA_UTC_OFFSET_HOURS, Number(minutes), Number(seconds)));
    }

    const fallbackDate = new Date(value.replace(' ', 'T'));
    return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

/*== 结构化数据与 sitemap 使用统一的 ISO 时间输出。 ==*/
export function toPostIsoDateTime(value: string | null): string | undefined {
    const date = parsePostDate(value);
    return date ? date.toISOString() : undefined;
}

/*== 前台阅读页使用偏内容展示的日期格式。 ==*/
export function formatPostDate(value: string | null): string {
    if (!value) {
        return '未发布';
    }

    const date = parsePostDate(value);
    if (!date) {
        return value;
    }

    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: CHINA_TIME_ZONE,
    }).format(date);
}

/*== 后台与详情页使用包含时间的格式，便于区分最近更新节奏。 ==*/
export function formatPostDateTime(value: string | null): string {
    if (!value) {
        return '未设置';
    }

    const date = parsePostDate(value);
    if (!date) {
        return value;
    }

    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: CHINA_TIME_ZONE,
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
