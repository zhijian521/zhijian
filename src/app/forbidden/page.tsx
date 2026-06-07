import type { Metadata } from 'next';
import Link from 'next/link';

import { APP_ROUTES } from '@/lib/site';
import styles from './forbidden.module.css';

export const metadata: Metadata = {
    title: '403 禁止访问 - Zhijian',
};

/*== 403 页面：非管理员尝试访问后台时展示。 ==*/
export default function ForbiddenPage() {
    return (
        <main className={styles.page}>
            <div className={styles.content}>
                <p className={styles.icon}>🚫</p>
                <h1 className={styles.title}>无权访问</h1>
                <p className={styles.description}>你当前的账号没有访问该页面的权限。</p>
                <div className={styles.actions}>
                    <Link className={styles.primaryBtn} href={APP_ROUTES.home}>
                        返回首页
                    </Link>
                    <Link className={styles.ghostBtn} href={APP_ROUTES.adminLogin}>
                        切换账号
                    </Link>
                </div>
            </div>
        </main>
    );
}