/*============================================================================
  nav-icons — 导航图标 key → 图标组件映射

  lib/core/site.ts 中的导航配置只存图标 key 字符串（NavIconKey），
  以保持 app → domain → core 单向依赖、core 层可被纯 Node 脚本引用。
  本模块位于 components 层，负责把 key 解析为实际的图标组件。

  注意：Record<NavIconKey, ...> 提供编译时穷尽性约束，
  新增 NavIconKey 时此处必须同步补充映射，否则类型检查报错。
============================================================================*/

/*== 配置与类型 ==*/
import type { NavIconKey } from '@/lib/core/site';

/*== 组件导入 ==*/
import {
    ActivityIcon,
    BookOpenIcon,
    CodeIcon,
    FileTextIcon,
    FolderTreeIcon,
    ImageIcon,
    LayoutDashboardIcon,
    SettingsIcon,
    UsersIcon,
    WrenchIcon,
    type IconComponent,
} from '@/components/ui/icons';

/*== 导航图标映射：key 与 icons.tsx 中 STROKE_ICONS 的 key 一一对应 ==*/
export const NAV_ICON_COMPONENTS: Record<NavIconKey, IconComponent> = {
    activity: ActivityIcon,
    'book-open': BookOpenIcon,
    code: CodeIcon,
    'file-text': FileTextIcon,
    'folder-tree': FolderTreeIcon,
    image: ImageIcon,
    'layout-dashboard': LayoutDashboardIcon,
    settings: SettingsIcon,
    users: UsersIcon,
    wrench: WrenchIcon,
};

/*== 查找函数：按 key 取导航图标组件 ==*/
export function getNavIcon(key: NavIconKey): IconComponent {
    return NAV_ICON_COMPONENTS[key];
}
