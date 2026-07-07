import Image from 'next/image';

/*== 组件导入 ==*/
import { GhostButton } from '@/components/ui/ghost-button';
import { ArrowRightIcon, MailIcon } from '@/components/ui/icons';
import { RssCopyButton } from '@/components/site/rss-copy-button';

/*== 样式导入 ==*/
import styles from './profile-card.module.css';

export function ProfileCard() {
    return (
        <div className={styles.card}>
            <div className={styles.avatarWrap}>
                <div className={styles.avatarFrame}>
                    <Image alt="Zhi Jian" className={styles.avatar} fill sizes="160px" src="/images/logo.webp" />
                </div>
            </div>
            <div className={styles.body}>
                <h3 className={styles.name}>Zhi Jian</h3>
                <p className={styles.meta}>前端开发 · 全栈 · 简约设计 · 造物</p>
                <p className={styles.copy}>喜欢简洁的设计，也喜欢安静地写点代码。偶尔捣鼓些小工具，把一闪而过的想法变成看得见的东西。这里没有宏大的叙事，只有一些零散的记录和简单的快乐。</p>
                <div className={styles.links}>
                    <GhostButton href="mailto:yuwb0521@yeah.net" icon={<MailIcon />} size="small">
                        联系我
                    </GhostButton>
                    <GhostButton href="https://github.com/zhijian521" icon={<ArrowRightIcon />} size="small" target="_blank">
                        GitHub
                    </GhostButton>
                    <RssCopyButton />
                </div>
            </div>
        </div>
    );
}
