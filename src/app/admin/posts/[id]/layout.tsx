import { ToastContainer } from '@/components/ui/toast';
import { requireAdmin } from '@/lib/auth';

/*== 编辑器全屏布局：脱离 AdminShell，最大化编辑空间 ==*/
export default async function PostEditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();
    return (
        <>
            {children}
            <ToastContainer />
        </>
    );
}
