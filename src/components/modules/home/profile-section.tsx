/*== 组件导入 ==*/
import { ProfileCard } from '@/components/modules/home/profile-card';
import { CommitChart } from '@/components/modules/home/commit-chart';
import { SectionHeading } from '@/components/site/section-heading';

/*== 数据与配置 ==*/
import type { DailyCommits } from '@/lib/domain/github';

/*== 样式导入 ==*/
import styles from './profile-section.module.css';

/*== 类型定义 ==*/
interface ProfileSectionProps {
    commitData: DailyCommits[];
}

export function ProfileSection({ commitData }: ProfileSectionProps) {
    return (
        <section className={styles.section} id="about-me">
            <SectionHeading>个人信息</SectionHeading>

            <div className={styles.row}>
                <ProfileCard />
                <div className={styles.commitCol}>
                    <CommitChart data={commitData} />
                </div>
            </div>
        </section>
    );
}
