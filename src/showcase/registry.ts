import type { ComponentType } from 'react';

import {
    ConfirmDialogDemo,
    DataTableDemo,
    DialogDemo,
    GhostButtonDemo,
    IconButtonDemo,
    PaginationDemo,
    PillSelectDemo,
    SelectDemo,
    SubmitButtonDemo,
    TagDemo,
    TextInputDemo,
    TextLinkDemo,
    ToastDemo,
} from './demos';

/* showcase 组件登记表
   每加一个组件在此登记一行 + 示例 props。
   迁入新组件时同步追加。手写可控，示例由开发者定。 */

export interface ShowcaseExample {
    /** 示例标题 */
    label: string;
    /** 渲染该示例的组件 */
    Component: ComponentType<Record<string, unknown>>;
    /** 传给组件的 props */
    props?: Record<string, unknown>;
}

export interface ShowcaseEntry {
    /** 组件名，用于锚点和搜索 */
    name: string;
    /** 一句话说明 */
    description: string;
    /** 所属模块，用于分组 */
    module: 'ui' | 'site' | 'nav' | 'blog' | 'admin';
    /** 源码路径，仅展示 */
    source: string;
    /** 一组示例 */
    examples: ShowcaseExample[];
}

const demo = (C: ComponentType<Record<string, unknown>>): ShowcaseExample => ({
    label: '全部配置项',
    Component: C,
});

export const SHOWCASE_REGISTRY: ShowcaseEntry[] = [
    {
        name: 'Tag',
        description: '标签，3 种变体 × 4 种尺寸',
        module: 'ui',
        source: 'src/components/ui/tag.tsx',
        examples: [demo(TagDemo)],
    },
    {
        name: 'GhostButton',
        description: '幽灵按钮，2 变体 × 3 尺寸 + asButton / icon / disabled',
        module: 'ui',
        source: 'src/components/ui/ghost-button.tsx',
        examples: [demo(GhostButtonDemo)],
    },
    {
        name: 'SubmitButton',
        description: '提交按钮，朱砂主按钮，3 尺寸 + disabled',
        module: 'ui',
        source: 'src/components/ui/submit-button.tsx',
        examples: [demo(SubmitButtonDemo)],
    },
    {
        name: 'IconButton',
        description: '图标按钮，2 变体 × 3 尺寸',
        module: 'ui',
        source: 'src/components/ui/icon-button.tsx',
        examples: [demo(IconButtonDemo)],
    },
    {
        name: 'TextLink',
        description: '纯文字链接，朱砂色 + 箭头，可关闭箭头',
        module: 'ui',
        source: 'src/components/ui/text-link.tsx',
        examples: [demo(TextLinkDemo)],
    },
    {
        name: 'TextInput',
        description: '文本输入框，标签 / 图标 / 3 尺寸',
        module: 'ui',
        source: 'src/components/ui/text-input.tsx',
        examples: [demo(TextInputDemo)],
    },
    {
        name: 'PillSelect',
        description: '药丸单选，连排扁平选项，3 尺寸',
        module: 'ui',
        source: 'src/components/ui/pill-select.tsx',
        examples: [demo(PillSelectDemo)],
    },
    {
        name: 'Select',
        description: '下拉选择，3 尺寸 + disabled + placeholder',
        module: 'ui',
        source: 'src/components/ui/select.tsx',
        examples: [demo(SelectDemo)],
    },
    {
        name: 'Pagination',
        description: '分页，回调模式 + 链接模式 + 每页条数',
        module: 'ui',
        source: 'src/components/ui/pagination.tsx',
        examples: [demo(PaginationDemo)],
    },
    {
        name: 'DataTable',
        description: '通用数据表格，普通 / scrollable / 空状态',
        module: 'ui',
        source: 'src/components/ui/data-table.tsx',
        examples: [demo(DataTableDemo)],
    },
    {
        name: 'Dialog',
        description: '通用弹窗，默认宽度 / 自定义 maxWidth',
        module: 'ui',
        source: 'src/components/ui/dialog.tsx',
        examples: [demo(DialogDemo)],
    },
    {
        name: 'ConfirmDialog',
        description: '二次确认弹窗，默认 / 自定义按钮 + loading',
        module: 'ui',
        source: 'src/components/ui/confirm-dialog.tsx',
        examples: [demo(ConfirmDialogDemo)],
    },
    {
        name: 'Toast',
        description: '全局轻提示，success / error',
        module: 'ui',
        source: 'src/components/ui/toast.tsx',
        examples: [demo(ToastDemo)],
    },
];
