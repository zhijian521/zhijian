/*============================================================================
  hero-section — 首屏封面

  山水留白背景图 + 标题 + 个人简介 + CTA 按钮，
  用户进入首页第一视觉，全屏沉浸式入场。
============================================================================*/

import Image from 'next/image';

/*== 组件导入 ==*/
import { ArrowDownIcon } from '@/components/ui/icons';
import { GhostButton } from '@/components/ui/ghost-button';

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';

/*== 样式导入 ==*/
import styles from './hero-section.module.css';

export function HeroSection() {
    return (
        <section className={styles.hero}>
            <Image
                alt="山水留白背景"
                className={styles.heroBg}
                fill
                priority
                sizes="100vw"
                src="/images/bg-landscape.webp"
            />
            <div className={styles.overlay} />
            <div className={styles.content}>
                <h1 className={styles.title}>{SITE_METADATA.author}</h1>
                <p className={styles.sub}>{SITE_METADATA.authorTagline}</p>
                <p className={styles.copy}>{SITE_METADATA.authorMotto}</p>
                <GhostButton
                    variant="primary"
                    size="large"
                    icon={<ArrowDownIcon />}
                    href="#about-me"
                    className={styles.cta}
                >
                    开始探索
                </GhostButton>
            </div>
        </section>
    );
}
