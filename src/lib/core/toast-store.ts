/*============================================================================
  toast-store — 全局 Toast 状态管理

  基于 useSyncExternalStore 的单例 Store，任何组件共享同一队列，
  无需 Context。toast.success/error 可直接在任意位置调用，
  3 秒自动消失。
============================================================================*/

'use client';

import { useSyncExternalStore } from 'react';

/*== Toast 数据结构 ==*/
export interface ToastItem {
    id: number;
    type: 'success' | 'error';
    message: string;
}

/*== 单例 Store — 任何组件共享同一队列 ==*/

let items: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emitChange() {
    for (const fn of listeners) fn();
}

function subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

function getSnapshot() {
    return items;
}

function push(type: ToastItem['type'], message: string) {
    const id = ++nextId;
    items = [...items, { id, type, message }];
    emitChange();
    setTimeout(() => remove(id), 3000);
}

function remove(id: number) {
    if (!items.some((t) => t.id === id)) return;
    items = items.filter((t) => t.id !== id);
    emitChange();
}

/*-- 全局 toast 方法，可在任何组件内调用 --*/
export const toast = {
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    remove,
};

/*-- Hook：获取当前 toast 队列（响应式） --*/
export function useToastItems() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
