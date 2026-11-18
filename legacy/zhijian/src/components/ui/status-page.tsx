/*============================================================================
  status-page — 通用状态页

  水墨山水背景 + 大号水印状态码 + 毛玻璃卡片（logo + 标题 + 副文 + 返回首页），
  用于 403 / 404 等错误页面。
============================================================================*/

/*== 组件导入 ==*/
import Image from 'next/image';

import { GhostButton } from '@/components/ui/ghost-button';
import { ArrowLeftIcon } from '@/components/ui/icons';

/*== 样式导入 ==*/
import styles from './status-page.module.css';

/*== 类型定义 ==*/
export interface StatusPageProps {
    /*-- HTTP 状态码，如 403、404 --*/
    code: number;
    /*-- 主标题，诗意长句 --*/
    title: string;
    /*-- 副文，一行补充 --*/
    subtitle?: string;
}

/*== StatusPage 通用状态页 — 水墨背景+水印码+毛玻璃卡片+返回首页 ==*/
export function StatusPage({ code, title, subtitle }: StatusPageProps) {
    return (
        <main className={styles.page}>
            {/* 水墨背景图 */}
            <div className={styles.bg} />
            {/* 半透明遮罩层 */}
            <div className={styles.overlay} />
            {/* 大号水印状态码 */}
            <span aria-hidden className={styles.watermark}>
                {code}
            </span>
            {/* 毛玻璃卡片 */}
            <div className={styles.card}>
                <div className={styles.cardBody}>
                    <Image alt="纸笺" className={styles.logo} height={80} src="/images/logo.webp" width={80} />
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
                </div>
                <GhostButton href="/" icon={<ArrowLeftIcon />} variant="primary">
                    返回首页
                </GhostButton>
            </div>
        </main>
    );
}
