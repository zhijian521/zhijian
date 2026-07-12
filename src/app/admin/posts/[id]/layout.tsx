/*============================================================================
  layout — 编辑器布局

  鉴权与 Toast 由 admin/layout.tsx 统一处理，此处仅透传 children。
============================================================================*/

/*== 类型定义 ==*/
interface PostEditorLayoutProps {
    children: React.ReactNode;
}

export default function PostEditorLayout({ children }: PostEditorLayoutProps) {
    return children;
}
