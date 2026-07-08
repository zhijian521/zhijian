'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

import { APP_ROUTES, SITE_METADATA } from '@/lib/core/site';
import { SiteHeader } from '@/components/site/site-header';
import styles from './public-chrome.module.css';

interface PublicChromeProps {
    children: React.ReactNode;
}

/*== 前台公共壳层：统一提供 SiteHeader + 页脚 + 统计脚本。 ==*/
export default function PublicChrome({ children }: PublicChromeProps) {
    const pathname = usePathname();
    const transparent = pathname === APP_ROUTES.home || pathname.startsWith(APP_ROUTES.blog);

    return (
        <div className={`${styles.root} ${transparent ? styles.rootTransparent : ''}`}>
            <SiteHeader transparent={transparent} />

            <div className={styles.main}>{children}</div>

            {/* 页脚 */}
            <footer className={styles.footer}>
                <p className={styles.footerCopy}>
                    © {new Date().getFullYear()} {SITE_METADATA.name}：认真生活，简单做人，用心做事
                </p>
            </footer>

            {/* 网站统计脚本 — 仅前台加载，后台不触发 */}
            <Script async src="https://yuwb.dev/script.js" data-site-id="y7dbsplr" strategy="afterInteractive" />
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-6HHPGL2HBM" strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-6HHPGL2HBM');
                `}
            </Script>
        </div>
    );
}
