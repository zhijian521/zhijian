import type { ReactNode } from 'react';

/*== 样式导入 ==*/
import styles from './section-heading.module.css';

/*== 类型定义 ==*/
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
