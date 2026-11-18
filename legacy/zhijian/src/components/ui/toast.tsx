/*============================================================================
  toast — 全局提示

  固定右上角，支持 success（朱砂红边框）/ error（危险红边框），
  3 秒自动消失，可手动关闭，匹配文人书斋风格。
============================================================================*/

'use client';

/*== 组件导入 ==*/
import { CheckIcon, XIcon } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/icon-button';

/*== 数据与配置 ==*/
import { useToastItems, toast, type ToastItem } from '@/lib/core/toast-store';

/*== 样式导入 ==*/
import styles from './toast.module.css';

/*== ToastRow 单条提示 — 图标 + 消息 + 关闭按钮 ==*/
function ToastRow({ item }: { item: ToastItem }) {
    const Icon = item.type === 'success' ? CheckIcon : XIcon;
    return (
        <div className={`${styles.item} ${styles[item.type]}`}>
            <Icon className={styles.icon} />
            <span className={styles.message}>{item.message}</span>
            <IconButton aria-label="关闭" icon={<XIcon />} onClick={() => toast.remove(item.id)} size="mini" />
        </div>
    );
}

/*== ToastContainer 容器 — 挂载在布局壳中 ==*/
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

export { toast } from '@/lib/core/toast-store';
