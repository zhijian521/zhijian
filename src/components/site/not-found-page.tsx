/*============================================================================
  not-found-page - 站点未找到页

  为公开路由与根级未知地址提供统一的 404 状态内容。
============================================================================*/

import { ButtonLink } from "@/components/ui/button-link";
import { StatusPage } from "@/components/ui/status-page";

import styles from "./status-screen.module.css";

export function NotFoundPage() {
    return (
        <StatusPage
            align="center"
            className={styles.page}
            contentClassName={styles.content}
            description="你访问的地址不存在，或内容已被移动。"
            title="404 · 页面未找到"
        >
            <ButtonLink href="/">
                返回首页
            </ButtonLink>
        </StatusPage>
    );
}
