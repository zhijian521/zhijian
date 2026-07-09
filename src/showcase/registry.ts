/*============================================================================
  registry — 组件登记表

  手写登记，每加一个组件在此追加一条 ShowcaseEntry。
  示例由 demos.tsx 提供。不做自动反射扫描。
============================================================================*/

/*== 类型导入 ==*/
import type { ComponentType } from 'react';

/*== 组件导入 ==*/
import { GhostButtonDemo, IconButtonDemo, SubmitButtonDemo, TagDemo, TextLinkDemo } from './demos';

/*== 类型定义 ==*/
export interface ShowcaseExample {
    /*-- 示例标题 --*/
    label: string;
    /*-- 渲染该示例的组件 --*/
    Component: ComponentType<Record<string, unknown>>;
    /*-- 传给组件的 props --*/
    props?: Record<string, unknown>;
}

export interface ShowcaseEntry {
    /*-- 组件名，用于锚点和搜索 --*/
    name: string;
    /*-- 一句话说明 --*/
    description: string;
    /*-- 所属模块，用于分组 --*/
    module: 'ui' | 'site' | 'nav' | 'blog' | 'admin';
    /*-- 源码路径，仅展示 --*/
    source: string;
    /*-- 一组示例 --*/
    examples: ShowcaseExample[];
}

/*-- demo 快捷工厂：单组件示例 --*/
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
        description: '幽灵按钮，2 变体 × 4 尺寸 + 图标 + asButton + 禁用态',
        module: 'ui',
        source: 'src/components/ui/ghost-button.tsx',
        examples: [demo(GhostButtonDemo)],
    },
    {
        name: 'SubmitButton',
        description: '提交按钮，朱砂红主按钮，3 尺寸 + 禁用态',
        module: 'ui',
        source: 'src/components/ui/submit-button.tsx',
        examples: [demo(SubmitButtonDemo)],
    },
    {
        name: 'IconButton',
        description: '图标按钮，2 变体 × 4 尺寸（mini/small/medium/default）+ 禁用态',
        module: 'ui',
        source: 'src/components/ui/icon-button.tsx',
        examples: [demo(IconButtonDemo)],
    },
    {
        name: 'TextLink',
        description: '纯文字链接，朱砂红+箭头，hover 淡出',
        module: 'ui',
        source: 'src/components/ui/text-link.tsx',
        examples: [demo(TextLinkDemo)],
    },
];
