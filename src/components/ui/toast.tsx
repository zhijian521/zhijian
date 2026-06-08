'use client';

import { CheckIcon, XIcon } from '@/components/ui/icons';
import { useToastItems, toast, type ToastItem } from './use-toast';

import styles from './toast.module.css';

/*== 单条 Toast ==*/
function ToastRow({ item }: { item: ToastItem }) {
    const Icon = item.type === 'success' ? CheckIcon : XIcon;
    return (
        <div className={`${styles.item} ${styles[item.type]}`}>
            <Icon className={styles.icon} />
            <span className={styles.message}>{item.message}</span>
            <button className={styles.closeBtn} onClick={() => toast.remove(item.id)} type='button'>
                <XIcon className={styles.closeIcon} />
            </button>
        </div>
    );
}

/*== Toast 容器 — 挂载在布局壳中 ==*/
export function ToastContainer() {
    const items = useToastItems();
    if (items.length === 0) return null;
    return (
        <div className={styles.container}>
            {items.map((item) => (
                <ToastRow key={item.id} item={item} />
            ))}
        </div>
    );
}

export { toast } from './use-toast';
