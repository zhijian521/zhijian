import type { ReactNode } from 'react';
import styles from './section-heading.module.css';

interface SectionHeadingProps {
    children: ReactNode;
    action?: ReactNode;
}

export function SectionHeading({ children, action }: SectionHeadingProps) {
    return (
        <div className={styles.heading}>
            <h2 className={styles.title}>{children}</h2>
            <div className={styles.line} />
            {action}
        </div>
    );
}
