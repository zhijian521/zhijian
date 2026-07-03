import type { ComponentType } from 'react';
import { GhostButton } from '@/components/ui/ghost-button';
import { Tag } from '@/components/ui/tag';

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

export const SHOWCASE_REGISTRY: ShowcaseEntry[] = [
    {
        name: 'Tag',
        description: '标签，3 种变体 × 4 种尺寸',
        module: 'ui',
        source: 'src/components/ui/tag.tsx',
        examples: [
            { label: 'default', Component: Tag as ComponentType<Record<string, unknown>>, props: { children: '默认' } },
            { label: 'primary', Component: Tag as ComponentType<Record<string, unknown>>, props: { children: '主色', variant: 'primary' } },
            { label: 'outlined', Component: Tag as ComponentType<Record<string, unknown>>, props: { children: '边框', variant: 'outlined' } },
            { label: 'mini', Component: Tag as ComponentType<Record<string, unknown>>, props: { children: '极小', size: 'mini' } },
        ],
    },
    {
        name: 'GhostButton',
        description: '幽灵按钮，default / primary 两种变体',
        module: 'ui',
        source: 'src/components/ui/ghost-button.tsx',
        examples: [
            { label: 'default', Component: GhostButton as ComponentType<Record<string, unknown>>, props: { children: '默认', href: '#' } },
            { label: 'primary', Component: GhostButton as ComponentType<Record<string, unknown>>, props: { children: '主色', href: '#', variant: 'primary' } },
            { label: 'asButton', Component: GhostButton as ComponentType<Record<string, unknown>>, props: { children: '按钮形态', asButton: true } },
        ],
    },
];
