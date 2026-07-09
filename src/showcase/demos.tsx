/*============================================================================
  demos — 组件示例集合

  SHOWCASE_REGISTRY 中每个组件对应一个 Demo 函数。
  调好一个加一个，不提前注册未调优的组件。
============================================================================*/

'use client';

/*== 组件导入 ==*/
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { PlusIcon, SearchIcon, Trash2Icon } from '@/components/ui/icons';
import { SubmitButton } from '@/components/ui/submit-button';
import { Tag } from '@/components/ui/tag';
import { TextLink } from '@/components/ui/text-link';

/*== 样式导入 ==*/
import styles from './demos.module.css';

export function TagDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 默认变体下展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <Tag size="mini">mini</Tag>
                    <Tag size="small">small</Tag>
                    <Tag size="medium">medium</Tag>
                    <Tag>default</Tag>
                </div>
            </div>
            {/*-- 变体 — medium 尺寸下展示全部变体 --*/}
            <div className={styles.row}>
                <span className={styles.label}>变体</span>
                <div className={styles.items}>
                    <Tag size="medium">default</Tag>
                    <Tag size="medium" variant="primary">primary</Tag>
                    <Tag size="medium" variant="outlined">outlined</Tag>
                </div>
            </div>
        </div>
    );
}

export function SubmitButtonDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <SubmitButton size="small">small</SubmitButton>
                    <SubmitButton size="medium">medium</SubmitButton>
                    <SubmitButton>default</SubmitButton>
                </div>
            </div>
            {/*-- 禁用态 --*/}
            <div className={styles.row}>
                <span className={styles.label}>禁用</span>
                <div className={styles.items}>
                    <SubmitButton disabled>禁用态</SubmitButton>
                </div>
            </div>
        </div>
    );
}

export function IconButtonDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <IconButton icon={<SearchIcon />} size="mini" />
                    <IconButton icon={<SearchIcon />} size="small" />
                    <IconButton icon={<SearchIcon />} size="medium" />
                    <IconButton icon={<SearchIcon />} />
                </div>
            </div>
            {/*-- 变体 — medium 尺寸下展示全部变体 --*/}
            <div className={styles.row}>
                <span className={styles.label}>变体</span>
                <div className={styles.items}>
                    <IconButton icon={<SearchIcon />} size="medium" />
                    <IconButton icon={<Trash2Icon />} size="medium" variant="danger" />
                </div>
            </div>
            {/*-- 禁用态 --*/}
            <div className={styles.row}>
                <span className={styles.label}>禁用</span>
                <div className={styles.items}>
                    <IconButton icon={<SearchIcon />} disabled />
                    <IconButton icon={<Trash2Icon />} disabled variant="danger" />
                </div>
            </div>
        </div>
    );
}

export function TextLinkDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 带箭头（默认） --*/}
            <div className={styles.row}>
                <span className={styles.label}>默认</span>
                <div className={styles.items}>
                    <TextLink href="#">阅读全文</TextLink>
                </div>
            </div>
            {/*-- 无箭头 --*/}
            <div className={styles.row}>
                <span className={styles.label}>无箭头</span>
                <div className={styles.items}>
                    <TextLink href="#" showArrow={false}>查看更多</TextLink>
                </div>
            </div>
        </div>
    );
}

export function GhostButtonDemo() {
    return (
        <div className={styles.demo}>
            {/*-- 尺寸 — 默认变体下展示全部尺寸 --*/}
            <div className={styles.row}>
                <span className={styles.label}>尺寸</span>
                <div className={styles.items}>
                    <GhostButton href="#" size="small">small</GhostButton>
                    <GhostButton href="#" size="medium">medium</GhostButton>
                    <GhostButton href="#">default</GhostButton>
                    <GhostButton href="#" size="large">large</GhostButton>
                </div>
            </div>
            {/*-- 变体 — medium 尺寸下展示全部变体 --*/}
            <div className={styles.row}>
                <span className={styles.label}>变体</span>
                <div className={styles.items}>
                    <GhostButton href="#" size="medium">default</GhostButton>
                    <GhostButton href="#" size="medium" variant="primary">primary</GhostButton>
                </div>
            </div>
            {/*-- 图标 — medium 尺寸带图标 --*/}
            <div className={styles.row}>
                <span className={styles.label}>图标</span>
                <div className={styles.items}>
                    <GhostButton href="#" icon={<PlusIcon />} size="medium">新增</GhostButton>
                    <GhostButton href="#" icon={<PlusIcon />} size="medium" variant="primary">新增</GhostButton>
                </div>
            </div>
            {/*-- 禁用态 — asButton 模式 --*/}
            <div className={styles.row}>
                <span className={styles.label}>禁用</span>
                <div className={styles.items}>
                    <GhostButton asButton disabled>禁用态</GhostButton>
                    <GhostButton asButton disabled variant="primary">禁用主色</GhostButton>
                </div>
            </div>
        </div>
    );
}
