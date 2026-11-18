/*============================================================================
  page — 组件预览页

  按模块分组渲染所有已登记组件，数据源来自 showcase/registry.ts。
============================================================================*/

/*== 组件导入 ==*/
import AdminPageHeader from '@/components/modules/admin/page-header';

/*== 数据与配置 ==*/
import { SHOWCASE_REGISTRY } from '@/showcase/registry';

/*== 样式导入 ==*/
import styles from './page.module.css';

export const metadata = { title: '组件预览' };

export default function ShowcaseComponentsPage() {
    const byModule = SHOWCASE_REGISTRY.reduce<Record<string, typeof SHOWCASE_REGISTRY>>((acc, entry) => {
        (acc[entry.module] ??= []).push(entry);
        return acc;
    }, {});

    return (
        <div>
            <AdminPageHeader
                eyebrow="Components"
                title="组件预览"
                description="浏览项目内所有可复用的 UI 组件，新增组件需在 src/showcase/registry.ts 登记。"
                tag={`已登记 ${SHOWCASE_REGISTRY.length} 个组件`}
            />

            {Object.entries(byModule).map(([module, entries]) => (
                <section key={module} className={styles.section}>
                    <h2 className={styles.moduleTitle}>{module}</h2>
                    {entries.map((entry) => {
                        const Demo = entry.examples[0].Component;
                        return (
                            <article key={entry.name} className={styles.card}>
                                <header className={styles.cardHeader}>
                                    <h3 className={styles.cardTitle}>{entry.name}</h3>
                                    {entry.description && <span className={styles.cardDesc}>{entry.description}</span>}
                                    <code className={styles.cardSource}>{entry.source}</code>
                                </header>
                                <Demo />
                            </article>
                        );
                    })}
                </section>
            ))}
        </div>
    );
}
