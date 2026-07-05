import Image from 'next/image';
import { ArrowDownIcon } from '@/components/ui/icons';
import styles from './hero-section.module.css';

export function HeroSection() {
    return (
        <section className={styles.hero}>
            <Image alt="山水留白背景" className={styles.heroBg} fill priority sizes="100vw" src="/images/bg-landscape.webp" />
            <div className={styles.overlay} />
            <div className={styles.content}>
                <h1 className={styles.title}>Zhi Jian</h1>
                <p className={styles.sub}>前端开发 · 全栈 · 简约设计 · 造物</p>
                <p className={styles.copy}>写代码，也写文字；喜欢简洁的设计，追求美好的事物；一切在这里记录。</p>
                <a className={styles.btn} href="#about-me">
                    开始探索
                    <ArrowDownIcon className={styles.icon} />
                </a>
            </div>
        </section>
    );
}
