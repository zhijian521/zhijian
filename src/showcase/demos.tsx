/*============================================================================
  demos — 组件示例集合

  SHOWCASE_REGISTRY 中每个组件对应一个 Demo 函数。
  调好一个加一个，不提前注册未调优的组件。
============================================================================*/

'use client';

/*== 组件导入 ==*/
import { Tag } from '@/components/ui/tag';

/*== 样式导入 ==*/
import styles from './demos.module.css';

export function TagDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 默认变体下展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <Tag size="mini">mini</Tag>
                    <Tag size="small">small</Tag>
                    <Tag size="medium">medium</Tag>
                    <Tag>default</Tag>
                </div>
            </div>
            {/*-- 变体 — medium 尺寸下展示全部变体 --*/}
            <div className={styles.row}>
                <span className={styles.label}>变体</span>
                <div className={styles.items}>
                    <Tag size="medium">default</Tag>
                    <Tag size="medium" variant="primary">primary</Tag>
                    <Tag size="medium" variant="outlined">outlined</Tag>
                </div>
            </div>
        </div>
    );
}
