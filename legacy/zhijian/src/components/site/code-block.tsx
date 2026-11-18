'use client';

/*============================================================================
  code-block — 代码块渲染组件

  react-markdown 的 pre 自定义渲染。
  语法高亮 + 右上角悬浮复制按钮。
============================================================================*/

/*== Hook 导入 ==*/
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

/*== 组件导入 ==*/
import { CheckIcon, CopyIcon } from '@/components/ui/icons';

/*== 样式导入 ==*/
import styles from './code-block.module.css';

/*== 从 React children 中递归提取纯文本 ==*/
function extractText(children: React.ReactNode): string {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(extractText).join('');
    if (children && typeof children === 'object' && 'props' in children) {
        return extractText((children as { props: { children: React.ReactNode } }).props.children);
    }
    return '';
}

/*== CodeBlock — 自定义代码块渲染：语法高亮 + 右上角浮动复制按钮 ==*/
export function CodeBlock({ children, className, ...rest }: React.ComponentPropsWithoutRef<'pre'>) {
    const code = extractText(children);
    const { copied, copy } = useCopyToClipboard();

    return (
        <div className={styles.codeBlock}>
            <button aria-label="复制代码" className={styles.copyBtn} onClick={() => copy(code)} type="button">
                {copied ? <CheckIcon className={styles.checkIcon} /> : <CopyIcon className={styles.copyIcon} />}
            </button>
            <pre className={`${styles.codeArea}${className ? ` ${className}` : ''}`} {...rest}>
                {children}
            </pre>
        </div>
    );
}