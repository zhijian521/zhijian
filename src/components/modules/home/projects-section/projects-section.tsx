import type { ReactNode } from 'react';

/*== 组件导入 ==*/
import { ProjectCard, type ProjectAction } from '@/components/modules/home/project-card/project-card';
import { SectionHeading } from '@/components/site/section-heading';

/*== 样式导入 ==*/
import styles from './projects-section.module.css';

/*== 类型定义 ==*/
interface Project {
    icon: ReactNode;
    title: string;
    description: string;
    tags: string[];
    actions: ProjectAction[];
}

interface ProjectsSectionProps {
    projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
    return (
        <section className={styles.section}>
            <SectionHeading>开源项目</SectionHeading>
            <div className={styles.grid}>
                {projects.map((project) => (
                    <ProjectCard key={project.title} {...project} />
                ))}
            </div>
        </section>
    );
}
