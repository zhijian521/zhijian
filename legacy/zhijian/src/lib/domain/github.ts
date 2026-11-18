/*============================================================================
  github — GitHub 提交记录数据层

  从 GitHub commits API 拉取最近 180 天提交并按日聚合，
  供首页 CommitChart 提交热力图使用。

  性能说明：首页为 force-dynamic，fetch 级 revalidate 会被页面动态语义覆盖，
  因此缓存放到了函数级 —— unstable_cache 跨请求缓存 1 小时，
  避免每个访客都串行翻页打 GitHub API（最多 20 页），同时保留页面动态语义。
============================================================================*/

import { unstable_cache } from 'next/cache';

export interface DailyCommits {
    date: string;
    count: number;
}

const OWNER = 'zhijian521';
const REPO = 'zhijian';

/*== 缓存周期：1 小时（秒） ==*/
const REVALIDATE_SECONDS = 3600;

/*-- 日期键口径：固定按 Asia/Shanghai 换算（YYYY-MM-DD）。
     GitHub 返回的 author.date 是 UTC ISO 串，直接 slice(0, 10) 取的是 UTC 日期，
     会把东八区 0-8 点的提交归到前一天格子；渲染侧（commit-chart）按浏览器本地
     时区取键，作者与受众均在中国、数据库时区同为 +08:00，故聚合侧统一换算到
     Asia/Shanghai。这里不能省略 timeZone 依赖服务器本地时区 —— 部署环境
     （如 Vercel）默认 UTC，显式指定才能保证两侧口径一致且不受部署位置影响 --*/
function toShanghaiDateKey(iso: string): string {
    return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

/*-- 实际拉取逻辑：未配置 GITHUB_TOKEN 时返回空数组，调用方按无数据渲染 --*/
async function fetchCommitHistoryFromGitHub(): Promise<DailyCommits[]> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return [];

    const since = new Date();
    since.setDate(since.getDate() - 180);
    const sinceISO = since.toISOString();

    const dates: string[] = [];
    let page = 1;

    while (page <= 20) {
        const url = `https://api.github.com/repos/${OWNER}/${REPO}/commits?since=${sinceISO}&per_page=100&page=${page}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
        });
        if (!res.ok) break;

        const commits: { commit: { author: { date: string } | null } }[] = await res.json();
        if (commits.length === 0) break;
        for (const c of commits) {
            const d = c.commit.author?.date;
            if (d) dates.push(toShanghaiDateKey(d));
        }
        if (commits.length < 100) break;
        page++;
    }

    const map = new Map<string, number>();
    for (const d of dates) map.set(d, (map.get(d) || 0) + 1);
    return [...map.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
}

/*== 跨请求缓存：force-dynamic 页面下依然生效，避免每访客实时打 GitHub API ==*/
export const fetchCommitHistory = unstable_cache(
    fetchCommitHistoryFromGitHub,
    ['github-commit-history'],
    { revalidate: REVALIDATE_SECONDS, tags: ['github-commit-history'] }
);
