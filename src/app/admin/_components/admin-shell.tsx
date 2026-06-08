import AdminSidebar from '@/app/admin/_components/admin-sidebar';
import { ToastContainer } from '@/components/ui/toast';
import styles from './admin-shell.module.css';

interface AdminShellProps {
    children: React.ReactNode;
}

/*== 后台壳层：固定侧边栏并提供右侧主内容区域。 ==*/
export default function AdminShell({ children }: AdminShellProps) {
    return (
        <main className={styles.layout}>
            <AdminSidebar />
            <section className={styles.main}>{children}</section>
            <ToastContainer />
        </main>
    );
}
