import type { DailyCommits } from '@/lib/domain/github';
import { ProfileCard } from '@/components/site/profile-card/profile-card';
import { CommitChart } from '@/components/site/commit-chart/commit-chart';
import { SectionHeading } from '@/components/site/section-heading/section-heading';
import styles from './profile-section.module.css';

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
