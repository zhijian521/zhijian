'use client';

import { useState } from 'react';

import type { ApiEntry } from '@/docs/api/_registry';
import styles from './api-list.module.css';

const AUTH_LABEL: Record<string, string> = {
    none: '公开',
    user: '需登录',
    admin: '需管理员',
};

function authClass(auth: string) {
    if (auth === 'admin') return styles.authAdmin;
    if (auth === 'user') return styles.authUser;
    return styles.authNone;
}

/*== 接口列表项：点击展开参数与响应字段表格。 ==*/
function ApiRow({ entry }: { entry: ApiEntry }) {
    const [open, setOpen] = useState(false);
    const hasDetail = Boolean(entry.params?.length || entry.response?.length);

    return (
        <div className={styles.apiRow}>
            <button
                type="button"
                className={styles.apiHeader}
                onClick={() => setOpen((v) => !v)}
                disabled={!hasDetail}
                aria-expanded={open}
            >
                <div className={styles.apiMain}>
                    <span className={styles.apiName}>{entry.name}</span>
                    <code className={styles.apiPath}>/api/{entry.path}</code>
                </div>
                <div className={styles.apiMeta}>
                    <span className={`${styles.apiAuth} ${authClass(entry.auth)}`}>{AUTH_LABEL[entry.auth]}</span>
                    {entry.methods.map((m) => (
                        <span key={m.method} className={styles.apiMethod}>
                            <span className={styles.apiMethodVerb}>{m.method}</span>
                            <span className={styles.apiMethodDesc}>{m.desc}</span>
                        </span>
                    ))}
                    {hasDetail ? <span className={styles.chevron}>{open ? '▾' : '▸'}</span> : null}
                </div>
            </button>

            {open && hasDetail ? (
                <div className={styles.detail}>
                    {entry.params?.length ? (
                        <div className={styles.detailSection}>
                            <h4 className={styles.detailTitle}>请求参数</h4>
                            <FieldTable fields={entry.params} />
                        </div>
                    ) : null}
                    {entry.response?.length ? (
                        <div className={styles.detailSection}>
                            <h4 className={styles.detailTitle}>响应字段</h4>
                            <FieldTable fields={entry.response} />
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

/*== 字段说明表格 ==*/
function FieldTable({ fields }: { fields: NonNullable<ApiEntry['params']> }) {
    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>字段</th>
                        <th className={styles.th}>类型</th>
                        <th className={styles.th}>必填</th>
                        <th className={styles.th}>说明</th>
                    </tr>
                </thead>
                <tbody>
                    {fields.map((f) => (
                        <tr key={f.name} className={styles.tr}>
                            <td className={styles.tdName}>{f.name}</td>
                            <td className={styles.tdType}>{f.type}</td>
                            <td className={styles.tdRequired}>{f.required ? '是' : '否'}</td>
                            <td className={styles.tdDesc}>{f.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/*== 接口列表容器：按 group 渲染，每个条目可展开。 ==*/
export function ApiList({
    groups,
    groupLabels,
}: {
    groups: Record<string, ApiEntry[]>;
    groupLabels: Record<string, string>;
}) {
    return (
        <>
            {Object.entries(groups).map(([group, entries]) => (
                <section key={group} className={styles.section}>
                    <h2 className={styles.groupTitle}>{groupLabels[group] ?? group}</h2>
                    <div className={styles.apiList}>
                        {entries.map((entry) => (
                            <ApiRow key={entry.path} entry={entry} />
                        ))}
                    </div>
                </section>
            ))}
        </>
    );
}
