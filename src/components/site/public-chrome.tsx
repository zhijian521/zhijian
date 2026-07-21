/*============================================================================
  public-chrome — 前台公共壳层

  统一提供 SiteHeader + 页脚 + 统计脚本（Google Analytics / 自建统计）。
  首页与博客详情页透明导航栏，其余页面常规导航栏。
============================================================================*/

'use client';
/*== 依赖导入 ==*/
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { APP_ROUTES, SITE_METADATA } from '@/lib/core/site';
import { getGaId, getScriptUrl, getTrackSiteId } from '@/lib/core/utils';
import { SiteHeader } from '@/components/site/site-header';
import type { PublicChromeProps } from '@/types/site';
import styles from './public-chrome.module.css';

/*== 前台公共壳层：统一提供 SiteHeader + 页脚 + 统计脚本。 ==*/
export default function PublicChrome({ children }: PublicChromeProps) {
    const pathname = usePathname();
    const transparent = pathname === APP_ROUTES.home || pathname.startsWith(APP_ROUTES.blog);
    // 本站自埋点站点 ID，未配置时不加载统计脚本
    const trackSiteId = getTrackSiteId();
    // Google Analytics 衡量 ID，未配置时不加载 GA 脚本
    const gaId = getGaId();

    return (
        <div className={`${styles.root} ${transparent ? styles.rootTransparent : ''}`}>
            {/* 网站导航 */}
            <SiteHeader transparent={transparent} />

            {/* 渲染出口 */}
            <div className={styles.main}>{children}</div>

            {/* 页脚 */}
            <footer className={styles.footer}>
                <p className={styles.footerCopy}>
                    © {new Date().getFullYear()} {SITE_METADATA.name}：认真生活，简单做人，用心做事
                </p>
            </footer>

            {/* 网站统计脚本 — 仅前台加载，后台不触发；未配置 NEXT_PUBLIC_TRACK_SITE_ID 时不渲染 */}
            {trackSiteId && (
                <Script async src={`${getScriptUrl()}/script.js`} data-site-id={trackSiteId} strategy="afterInteractive" />
            )}
            {/* Google Analytics — 未配置 NEXT_PUBLIC_GA_ID 时不渲染 */}
            {gaId && (
                <>
                    <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${gaId}');
                        `}
                    </Script>
                </>
            )}
        </div>
    );
}
