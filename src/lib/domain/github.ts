/*== 从 GitHub API 拉取仓库提交记录。 ==*/

export interface DailyCommits {
    date: string;
    count: number;
}

const OWNER = 'zhijian521';
const REPO = 'zhijian';

export async function fetchCommitHistory(): Promise<DailyCommits[]> {
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
            /* 首页 force-dynamic 覆盖此值；非 force-dynamic 页面使用时自动生效 */
            next: { revalidate: 3600 },
        });
        if (!res.ok) break;

        const commits: { commit: { author: { date: string } | null } }[] = await res.json();
        if (commits.length === 0) break;
        for (const c of commits) {
            const d = c.commit.author?.date;
            if (d) dates.push(d.slice(0, 10));
        }
        if (commits.length < 100) break;
        page++;
    }

    const map = new Map<string, number>();
    for (const d of dates) map.set(d, (map.get(d) || 0) + 1);
    return [...map.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
}
