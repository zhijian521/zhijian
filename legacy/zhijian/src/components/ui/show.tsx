/*============================================================================
  Show — 条件渲染组件

  when 为 truthy 时渲染 children，否则渲染 fallback。
  消除 JSX 中的 {condition ? <div>...</div> : null} 模板。
============================================================================*/

interface ShowProps {
    /** 渲染 children 的条件 */
    when: unknown;
    /** 条件不满足时的回退内容，默认 null */
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function Show({ when, fallback = null, children }: ShowProps) {
    return when ? <>{children}</> : <>{fallback}</>;
}
