'use client';

import styles from './loading.module.css';

/*== 全局加载态：全屏居中，无其他组件干扰 ==*/
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
