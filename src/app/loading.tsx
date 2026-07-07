/*============================================================================
  loading — 全局加载态

  全屏居中，衬线字体 "加载中..." + 三个渐显圆点动画。
  Next.js 文件约定，自动作为 Suspense fallback。
============================================================================*/

/*== 样式导入 ==*/
import styles from './loading.module.css';

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
