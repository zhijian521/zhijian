/*============================================================================
  page-header — 后台页面统一头部

  后台页面标题区，支持 eyebrow（小标题装饰线）、衬线主标题、
  正文描述，以及底部 tag + action 操作区。
============================================================================*/

/*== 样式导入 ==*/
import styles from './page-header.module.css';

/*== 类型定义 ==*/
interface AdminPageHeaderProps {
    /*-- 标题上方小标签（kicker / eyebrow） --*/
    eyebrow?: string;
    /*-- 页面标题 --*/
    title: string;
    /*-- 页面描述 --*/
    description: string;
    /*-- 信息标签（如"3 篇文章"） --*/
    tag?: string;
    /*-- 右侧操作区（如新建按钮） --*/
    action?: React.ReactNode;
}

/*== AdminPageHeader 后台页面统一头部 — 匹配博客衬线标题风格 ==*/
export default function AdminPageHeader({ eyebrow, title, description, tag, action }: AdminPageHeaderProps) {
    return (
        <header className={styles.header}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>

            {tag || action ? (
                <div className={styles.metaRow}>
                    {tag ? <span className={styles.tag}>{tag}</span> : null}
                    {action}
                </div>
            ) : null}
        </header>
    );
}
