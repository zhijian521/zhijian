import styles from '../../loading.module.css';

export default function Loading() {
    return (
        <div className={styles.root}>
            <span className={styles.text}>加载中</span>
            <span className={styles.dots}>
                <i>.</i>
                <i>.</i>
                <i>.</i>
            </span>
        </div>
    );
}
