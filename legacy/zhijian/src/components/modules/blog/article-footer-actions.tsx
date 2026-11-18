'use client';

/*============================================================================
  article-footer-actions — 文章底部操作按钮

  返回列表、返回主页、返回顶部。含 scrollTo 浏览器交互。
============================================================================*/

/*== 组件导入 ==*/
import { IconButton } from '@/components/ui/icon-button';
import { ArrowUpIcon, HomeIcon, ListIcon } from '@/components/ui/icons';

/*== 样式导入 ==*/
import styles from './article-footer-actions.module.css';

/*== ArticleFooterActions 文章底部操作按钮 — 返回列表/主页/顶部 ==*/
export function ArticleFooterActions() {
    return (
        <div className={styles.actions}>
            <IconButton aria-label="返回列表" href="/blog" icon={<ListIcon />} size="medium" title="返回列表" />
            <IconButton aria-label="返回主页" href="/" icon={<HomeIcon />} size="medium" title="返回主页" />
            <IconButton
                aria-label="返回顶部"
                icon={<ArrowUpIcon />}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                size="medium"
                title="返回顶部"
            />
        </div>
    );
}
