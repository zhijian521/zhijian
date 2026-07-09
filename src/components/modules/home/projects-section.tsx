/*============================================================================
  projects-section — 开源项目区

  SectionHeading + ProjectCard 网格，展示开源项目列表，
  项目数据由 page.tsx 注入，组件本身纯展示。
============================================================================*/

import type { ReactNode } from 'react';

/*== 组件导入 ==*/
import { SectionHeading } from '@/components/site/section-heading';
import { ProjectCard, type ProjectAction } from '@/components/modules/home/project-card';

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
