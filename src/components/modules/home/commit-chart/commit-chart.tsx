'use client';

import { useState } from 'react';

/*== 数据与配置 ==*/
import type { DailyCommits } from '@/lib/domain/github';

/*== 样式导入 ==*/
import styles from './commit-chart.module.css';

/*== 类型定义 ==*/
interface CommitChartProps {
    data: DailyCommits[];
}

const LEVELS = ['l0', 'l1', 'l2', 'l3', 'l4'] as const;

function buildWeeks(data: Map<string, number>, max: number) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + (7 - end.getDay()));
    const start = new Date(end);
    start.setDate(start.getDate() - 26 * 7);

    const weeks: { date: string; level: (typeof LEVELS)[number] }[][] = [];
    const d = new Date(start);
    while (d < end) {
        const week: { date: string; level: (typeof LEVELS)[number] }[] = [];
        for (let i = 0; i < 7; i++) {
            const ds = d.toISOString().slice(0, 10);
            const c = data.get(ds) || 0;
            const lvl = c === 0 ? 0 : c <= max * 0.25 ? 1 : c <= max * 0.5 ? 2 : c <= max * 0.75 ? 3 : 4;
            week.push({ date: ds, level: LEVELS[lvl] });
            d.setDate(d.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function CommitChart({ data }: CommitChartProps) {
    const [selected, setSelected] = useState<{ date: string; count: number } | null>(null);

    if (data.length === 0) return <div className={styles.empty}>配置 GITHUB_TOKEN 后查看提交记录</div>;

    const dayMap = new Map(data.map((d) => [d.date, d.count]));
    const max = Math.max(...data.map((d) => d.count), 1);
    const weeks = buildWeeks(dayMap, max);

    return (
        <div className={styles.wrap}>
            <p className={styles.title}>
                项目提交记录
                {selected ? (
                    <span className={styles.tip}>
                        {' '}
                        — {formatDate(selected.date)} · {selected.count} 次提交
                    </span>
                ) : null}
            </p>
            <div className={styles.scroll}>
                <div className={styles.grid}>
                    <div className={styles.weekLabels}>
                        <span />
                        <span>一</span>
                        <span />
                        <span>三</span>
                        <span />
                        <span>五</span>
                        <span />
                    </div>
                    <div className={styles.cells}>
                        {weeks.map((w, wi) => (
                            <div className={styles.col} key={wi}>
                                {w.map((day, di) => {
                                    const count = dayMap.get(day.date) || 0;
                                    const label = `${formatDate(day.date)}: ${count} 次提交`;
                                    return (
                                        <button aria-label={label} className={`${styles.cell} ${styles[day.level]}`} key={di} onClick={() => setSelected({ date: day.date, count })} type="button" />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles.legend}>
                <span>少</span>
                {LEVELS.map((l) => (
                    <span className={`${styles.cell} ${styles[l]}`} key={l} />
                ))}
                <span>多</span>
            </div>
        </div>
    );
}
