import styles from './split-panel-layout.module.css';

interface SplitPanelLayoutProps {
    list: React.ReactNode;
    form: React.ReactNode;
    formTitle?: string;
}

/*== 左右两栏布局：分类管理、标签管理等页面复用。 ==*/
export default function SplitPanelLayout({ list, form, formTitle }: SplitPanelLayoutProps) {
    return (
        <div className={styles.layout}>
            <div className={styles.list}>{list}</div>
            <div className={styles.form}>
                {formTitle && <h3 className={styles.formTitle}>{formTitle}</h3>}
                {form}
            </div>
        </div>
    );
}
