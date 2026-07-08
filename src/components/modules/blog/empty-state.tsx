/*== 样式导入 ==*/
import styles from './empty-state.module.css';

/*== EmptyState 空状态 — 无匹配文章时展示 ==*/
export function EmptyState() {
    return <p className={styles.empty}>没有匹配的文章。</p>;
}
