import Link from 'next/link';
import AdminPageHeader from '@/components/modules/admin/page-header';
import styles from './page.module.css';

export const metadata = { title: '展示中心 - 知简' };

export default function ShowcaseIndexPage() {
    return (
        <div>
            <AdminPageHeader eyebrow="Showcase" title="展示中心" description="查看项目封装的组件与图标，方便复用。" />
            <div className={styles.links}>
                <Link href="/admin/showcase/components" className={styles.link}>
                    <span className={styles.linkTitle}>组件预览</span>
                    <span className={styles.linkDesc}>查看所有封装组件与变体</span>
                </Link>
                <Link href="/admin/showcase/icons" className={styles.link}>
                    <span className={styles.linkTitle}>图标预览</span>
                    <span className={styles.linkDesc}>查看全部图标，点击复制用法</span>
                </Link>
            </div>
        </div>
    );
}
