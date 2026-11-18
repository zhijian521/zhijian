/*============================================================================
  empty-state — 无数据提示

  收敛全站手写空态（chartEmpty / .empty / .emptyState 等）为统一原子组件。
  inline：行内纯文字，用于列表与小区域；
  block：垂直居中块级（图标+文字+行动区），用于面板与卡片。
============================================================================*/

import { cn } from '@/lib/core/utils';
import { Show } from './show';
import styles from './empty-state.module.css';

export interface EmptyStateProps {
    /*-- 提示文案 --*/
    text: string;
    /*-- 可选图标，传入 SVG 元素，仅 block 形态渲染（显示在文字上方） --*/
    icon?: React.ReactNode;
    /*-- 可选行动区（按钮/链接），仅 block 形态渲染（显示在文字下方） --*/
    action?: React.ReactNode;
    /*-- 形态：inline 行内纯文字（列表/小区域）/ block 居中块级（面板/卡片） --*/
    variant?: 'inline' | 'block';
    /*-- 追加样式类，承载高度、内边距、对齐等场景化修饰 --*/
    className?: string;
}

/*== EmptyState 无数据提示 — 全站统一空态原子组件 ==*/
export function EmptyState({ text, icon, action, variant = 'inline', className }: EmptyStateProps) {
    if (variant === 'block') {
        return (
            <div className={cn(styles.empty, styles.block, className)}>
                <Show when={icon}>
                    <span className={styles.icon}>{icon}</span>
                </Show>
                <p className={styles.text}>{text}</p>
                <Show when={action}>{action}</Show>
            </div>
        );
    }

    return <p className={cn(styles.empty, className)}>{text}</p>;
}
