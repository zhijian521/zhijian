import { ButtonLink } from "@/components/ui/button-link";
import { StatusPage } from "@/components/ui/status-page";

import PublicLayout from "./(public)/layout";

import styles from "./status-page.module.css";

/*== 404页面 ==*/
export default function RootNotFound() {
    return (
        <PublicLayout>
            <StatusPage
                align="center"
                className={styles.page}
                contentClassName={styles.content}
                description="你访问的地址不存在，或内容已被移动。"
                title="404 · 页面未找到"
            >
                <ButtonLink href="/">返回首页</ButtonLink>
            </StatusPage>
        </PublicLayout>
    );
}
