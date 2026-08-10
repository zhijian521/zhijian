/*============================================================================
  projects-section - 首页开源项目区

  展示已确认的静态开源项目及其外部访问入口。
============================================================================*/

import { SectionHeading } from "@/components/site/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icons";
import { Tag } from "@/components/ui/tag";
import { PROJECTS } from "@/config/home";

import styles from "./projects-section.module.css";

export function ProjectsSection() {
    return (
        <section aria-labelledby="projects-title" className={styles.section} id="projects">
            <div className={styles.container}>
                <SectionHeading id="projects-title">开源项目</SectionHeading>

                <div className={styles.grid}>
                    {PROJECTS.map((project) => (
                        <article className={styles.card} key={project.title}>
                            <div className={styles.header}>
                                <Icon className={styles.icon} name={project.icon} />
                                <h3 className={styles.title}>{project.title}</h3>
                            </div>

                            <p className={styles.description}>{project.description}</p>

                            <div className={styles.tags}>
                                {project.tags.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                            </div>

                            <div className={styles.actions}>
                                <ButtonLink href={project.siteHref} icon="external-link" rel="noopener noreferrer" target="_blank">
                                    访问站点
                                </ButtonLink>
                                <ButtonLink href={project.githubHref} icon="github" rel="noopener noreferrer" target="_blank">
                                    GitHub
                                </ButtonLink>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
