import styles from './admin-page-header.module.css';

interface AdminPageHeaderProps {
    action?: React.ReactNode;
    description: string;
    eyebrow?: string;
    tag?: string;
    title: string;
}

/*== 后台页面统一头部，匹配博客衬线标题风格。 ==*/
export default function AdminPageHeader({ action, description, eyebrow, tag, title }: AdminPageHeaderProps) {
    return (
        <header className={styles.header}>
            {eyebrow ? <p className={`${styles.eyebrow} admin-kicker`}>{eyebrow}</p> : null}
            <h1 className='admin-title'>{title}</h1>
            <p className={`${styles.description} admin-copy`}>{description}</p>

            {(tag || action) ? (
                <div className={styles.metaRow}>
                    {tag ? <span className={styles.tag}>{tag}</span> : null}
                    {action}
                </div>
            ) : null}
        </header>
    );
}
