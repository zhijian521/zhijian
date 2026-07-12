/*============================================================================
  page — 项目文档中心首页

  按 group 分组列出所有功能文档，点击进入详情渲染 markdown。
============================================================================*/

import Link from 'next/link';

/*== 组件导入 ==*/
import AdminPageHeader from '@/components/modules/admin/page-header';

/*== 数据与配置 ==*/
import { DOC_REGISTRY, type DocEntry } from '@/docs/features/_registry';

/*== 样式导入 ==*/
import styles from './page.module.css';

export const metadata = { title: '项目文档 - 知简' };

const GROUP_LABEL: Record<DocEntry['group'], string> = {
    site: '前台',
    nav: '导航',
    admin: '后台',
    infra: '基础设施',
};

/*== 文档中心首页：按 group 分组列出所有功能文档，点击进入详情渲染 md。 ==*/
export default function DocsIndexPage() {
    const byGroup = DOC_REGISTRY.reduce<Record<string, DocEntry[]>>((acc, entry) => {
        (acc[entry.group] ??= []).push(entry);
        return acc;
    }, {});

    return (
        <div>
            <AdminPageHeader
                eyebrow="Docs"
                title="项目文档"
                description="功能文档说明。改功能时同步改文档，新增文档需在 src/docs/features/_registry.ts 登记。"
                tag={`${DOC_REGISTRY.length} 篇文档`}
            />

            {Object.entries(byGroup).map(([group, entries]) => (
                <section key={group} className={styles.section}>
                    <h2 className={styles.groupTitle}>{GROUP_LABEL[group as DocEntry['group']] ?? group}</h2>
                    <div className={styles.grid}>
                        {entries.map((entry) => (
                            <Link key={entry.slug} href={`/admin/docs/${entry.slug}`} className={styles.card}>
                                <span className={styles.cardTitle}>{entry.title}</span>
                                <span className={styles.cardDesc}>{entry.description}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
