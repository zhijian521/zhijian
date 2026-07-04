import { notFound } from 'next/navigation';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { MarkdownArticle } from '@/components/site/markdown-article';
import { DOC_REGISTRY } from '@/docs/features/_registry';
import styles from './page.module.css';

export const dynamicParams = false;

/*== 预生成所有登记文档的静态参数，未登记 slug 直接 404。 ==*/
export function generateStaticParams() {
    return DOC_REGISTRY.map((entry) => ({ slug: entry.slug }));
}

/*== 文档详情：读 md 原文，用 MarkdownArticle 渲染。 ==*/
export default async function DocDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const entry = DOC_REGISTRY.find((e) => e.slug === slug);
    if (!entry) {
        notFound();
    }

    const content = readFileSync(join(process.cwd(), 'src/docs/features', entry.file), 'utf8');

    return (
        <div>
            <AdminPageHeader eyebrow="Docs" title={entry.title} description={entry.description} tag={entry.file} />
            <div className={styles.body}>
                <MarkdownArticle content={content} fullWidth />
            </div>
        </div>
    );
}
