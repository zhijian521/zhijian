import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { SHOWCASE_REGISTRY } from '@/showcase/registry';
import styles from './page.module.css';

export const metadata = { title: '组件预览 - 知简' };

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
                    <div className={styles.grid}>
                        {entries.map((entry) => (
                            <article key={entry.name} className={styles.card}>
                                <header className={styles.cardHeader}>
                                    <h3 className={styles.cardTitle}>{entry.name}</h3>
                                    <code className={styles.cardSource}>{entry.source}</code>
                                </header>
                                <p className={styles.cardDesc}>{entry.description}</p>
                                <div className={styles.examples}>
                                    {entry.examples.map((ex) => {
                                        const Example = ex.Component;
                                        return (
                                            <div key={ex.label} className={styles.example}>
                                                <span className={styles.exampleLabel}>{ex.label}</span>
                                                <Example {...ex.props} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
