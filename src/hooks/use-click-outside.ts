/*============================================================================
  use-click-outside — 点击外部 / Escape 关闭 Hook

  收敛全站手写的「点击外部关闭」逻辑（select / site-header / search-bar /
  ai-section / bookmark-context-menu / settings-section），并修复行为不一致：
  - 统一 mousedown 事件、统一绑定 document（settings-section 原绑 window）；
  - escape 默认开启，补齐 search-bar / ai-section 缺失的 Escape 关闭；
  - delayMs 支持右键菜单等「打开动作本身即一次指针事件」的延迟绑定场景。
============================================================================*/

'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/*== 类型定义 ==*/

/** 判定「内部」的目标：单个 ref，或 ref 数组（用于触发按钮在面板外、需一并排除的场景，如 site-header） */
type ClickOutsideTarget = RefObject<HTMLElement | null> | ReadonlyArray<RefObject<HTMLElement | null>>;

/** useClickOutside 配置项 */
interface UseClickOutsideOptions {
    /** 是否绑定监听，默认 true；false 时完全不绑定，替代消费方手写条件 effect */
    enabled?: boolean;
    /** 按 Escape 是否同样触发 onClose，默认 true */
    escape?: boolean;
    /** mousedown 监听延迟绑定的毫秒数，默认 0；用于右键菜单避免「打开动作」立即触发自关闭 */
    delayMs?: number;
}

/**
 * 点击目标外部或按 Escape 时触发 onClose，无返回值。
 *
 * @param ref     判定「内部」的 ref（或 ref 数组）；事件目标命中任一 ref 内部即视为内部；
 *                ref.current 为 null（未挂载）时不视为外部，不会误触发关闭
 * @param onClose 关闭回调；hook 内部持有最新引用，传内联函数不会导致监听反复重绑
 * @param options enabled / escape / delayMs，见 UseClickOutsideOptions
 */
export function useClickOutside(ref: ClickOutsideTarget, onClose: () => void, options?: UseClickOutsideOptions): void {
    /*-- escape 是遗留全局函数名，内部改名避免遮蔽 --*/
    const { enabled = true, escape: withEscape = true, delayMs = 0 } = options ?? {};

    /*-- 用 ref 持有最新回调与目标集合：避免内联 onClose / 数组字面量 ref 使 effect 反复重跑、
         delayMs 定时器被重置（bookmark-context-menu 旧实现 deps 含 onClose，存在该隐患） --*/
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const targetsRef = useRef<ReadonlyArray<RefObject<HTMLElement | null>>>([]);
    targetsRef.current = Array.isArray(ref) ? ref : [ref];

    useEffect(() => {
        if (!enabled) return;

        /*-- 命中任一 ref 内部即视为「内部」；ref 未挂载（current 为 null）时不视为外部，不触发关闭 --*/
        function isInside(target: Node): boolean {
            return targetsRef.current.some((r) => r.current?.contains(target) ?? false);
        }

        function handleMouseDown(e: MouseEvent) {
            const target = e.target;
            /*-- e.target 可能为 null 或非 Node（如 window），contains 只接受 Node --*/
            if (!(target instanceof Node)) return;
            if (!isInside(target)) onCloseRef.current();
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onCloseRef.current();
        }

        /*-- Escape 立即绑定；mousedown 可按 delayMs 延迟绑定
             （右键菜单的打开动作本身是一次指针事件，立即绑定会立即自关闭） --*/
        if (withEscape) {
            document.addEventListener('keydown', handleKeyDown);
        }

        let timer: ReturnType<typeof setTimeout> | null = null;
        if (delayMs > 0) {
            timer = setTimeout(() => {
                document.addEventListener('mousedown', handleMouseDown);
            }, delayMs);
        } else {
            document.addEventListener('mousedown', handleMouseDown);
        }

        /*-- 卸载 / 依赖变化时完整清理：延迟定时器 + 两类监听 --*/
        return () => {
            if (timer !== null) clearTimeout(timer);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [enabled, withEscape, delayMs]);
}
