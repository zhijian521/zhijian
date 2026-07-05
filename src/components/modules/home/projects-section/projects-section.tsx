import type { ReactNode } from 'react';
import { ProjectCard, type ProjectAction } from '@/components/site/project-card';
import { SectionHeading } from '@/components/site/section-heading/section-heading';
import styles from './projects-section.module.css';

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
