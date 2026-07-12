/*============================================================================
  loading — 后台骨架屏

  异步加载子页面时展示占位动画，保持侧边栏可见。
============================================================================*/

/*== 样式导入 ==*/
import styles from './loading.module.css';

/*== 后台骨架屏：异步加载子页面时保持侧边栏可见。 ==*/
export default function AdminLoading() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                <div className={styles.bar1} />
                <div className={styles.bar2} />
            </div>
        </div>
    );
}
