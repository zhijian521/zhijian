/*============================================================================
  profile-card — 个人名片

  头像 + 姓名 + 简介 + 联系按钮（GitHub / 邮箱 / RSS），
  纯展示组件，无外部数据依赖。
============================================================================*/

import Image from 'next/image';

/*== 组件导入 ==*/
import { GhostButton } from '@/components/ui/ghost-button';
import { ArrowRightIcon, MailIcon } from '@/components/ui/icons';
import { RssCopyButton } from '@/components/site/rss-copy-button';

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';

/*== 样式导入 ==*/
import styles from './profile-card.module.css';

export function ProfileCard() {
    return (
        <div className={styles.card}>
            <div className={styles.avatarWrap}>
                <div className={styles.avatarFrame}>
                    <Image alt={SITE_METADATA.author} className={styles.avatar} fill sizes="160px" src="/images/logo.webp" />
                </div>
            </div>
            <div className={styles.body}>
                <h3 className={styles.name}>{SITE_METADATA.author}</h3>
                <p className={styles.meta}>{SITE_METADATA.authorTagline}</p>
                <p className={styles.copy}>{SITE_METADATA.authorBio}</p>
                <div className={styles.links}>
                    <GhostButton href="mailto:yuwb0521@yeah.net" icon={<MailIcon />} size="small">
                        联系我
                    </GhostButton>
                    <GhostButton
                        href="https://github.com/zhijian521"
                        icon={<ArrowRightIcon />}
                        size="small"
                        target="_blank"
                    >
                        GitHub
                    </GhostButton>
                    <RssCopyButton />
                </div>
            </div>
        </div>
    );
}
