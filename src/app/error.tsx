"use client";

import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusPage } from "@/components/ui/status-page";

import styles from "./status-page.module.css";

interface RouteErrorProps {
    unstable_retry: () => void;
}

/*== ERROR页面 ==*/
export default function RouteError({ unstable_retry }: RouteErrorProps) {
    return (
        <StatusPage
            align="center"
            className={clsx(styles.page, styles.fullViewport)}
            contentClassName={styles.content}
            description="页面暂时无法加载，请稍后再试。"
            title="页面出现错误"
        >
            <div className={styles.actions}>
                <Button onClick={unstable_retry} variant="primary">
                    重新加载
                </Button>
                <ButtonLink href="/">返回首页</ButtonLink>
            </div>
        </StatusPage>
    );
}
