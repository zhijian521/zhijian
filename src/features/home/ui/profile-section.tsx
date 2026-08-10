/*============================================================================
  profile-section - 首页个人信息区

  保留旧项目个人名片的内容与联系操作。
============================================================================*/

import Image from "next/image";

import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { ABOUT_CONTENT, HERO_CONTENT } from "@/config/home";

import styles from "./profile-section.module.css";

export function ProfileSection() {
    return (
        <section aria-labelledby="profile-title" className={styles.section} id="about-me">
            <div className={styles.container}>
                <SectionHeading id="profile-title">个人信息</SectionHeading>

                <div className={styles.profile}>
                    <Image
                        alt={`${HERO_CONTENT.author} 的头像`}
                        className={styles.avatar}
                        height={120}
                        sizes="(max-width: 40rem) 7rem, 7.5rem"
                        src="/images/profile.webp"
                        width={120}
                    />

                    <div className={styles.body}>
                        <h3 className={styles.name}>{HERO_CONTENT.author}</h3>
                        <p className={styles.tagline}>{HERO_CONTENT.tagline}</p>
                        <p className={styles.bio}>{ABOUT_CONTENT.bio}</p>

                        <nav aria-label="联系方式" className={styles.actions}>
                            <ButtonLink href={ABOUT_CONTENT.links.email} icon="mail">
                                联系我
                            </ButtonLink>
                            <ButtonLink href={ABOUT_CONTENT.links.github} icon="external-link" rel="noopener noreferrer" target="_blank">
                                GitHub
                            </ButtonLink>
                            <ButtonLink href={ABOUT_CONTENT.links.rss} icon="rss" rel="noopener noreferrer" target="_blank">
                                RSS 订阅
                            </ButtonLink>
                        </nav>
                    </div>
                </div>
            </div>
        </section>
    );
}
