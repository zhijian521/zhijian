# 导航页实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 zhijian 新增 `/nav` 浏览器导航页，全屏分页布局，上下滑动切换搜索+书签、备忘录、笔记三屏。

**架构：** 三屏各占 100vh，CSS `scroll-snap` 实现整屏切换；左侧 Dock 指示器定位当前屏并支持点击跳转；前期数据用配置文件 + localStorage，数据层抽离为独立模块便于后期替换为数据库。

**技术栈：** Next.js App Router、CSS Modules、scroll-snap、localStorage、react-markdown + rehype-highlight

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/lib/nav-config.ts` | 书签配置（前期写死数据）、搜索引擎列表 |
| `src/lib/nav-storage.ts` | localStorage 读写封装（搜索记录、备忘录、笔记） |
| `src/lib/site.ts` | 新增 `nav` 路由常量 + 公开导航项 |
| `src/app/nav/layout.tsx` | 导航页独立布局（无后台侧边栏） |
| `src/app/nav/page.tsx` | 导航页入口，组合 NavShell |
| `src/app/nav/_components/nav-shell.tsx` | 全屏分页容器（scroll-snap）+ Dock 指示器 |
| `src/app/nav/_components/nav-shell.module.css` | 分页容器 + Dock 样式 |
| `src/app/nav/_components/search-section.tsx` | 第一屏：搜索栏 + 书签栏 + 搜索记录 |
| `src/app/nav/_components/search-section.module.css` | 第一屏样式 |
| `src/app/nav/_components/search-bar.tsx` | 搜索栏（搜索引擎切换 + 输入 + 跳转） |
| `src/app/nav/_components/search-bar.module.css` | 搜索栏样式 |
| `src/app/nav/_components/bookmark-bar.tsx` | 书签栏（横向排列 + 文件夹 hover） |
| `src/app/nav/_components/bookmark-bar.module.css` | 书签栏样式 |
| `src/app/nav/_components/todo-section.tsx` | 第二屏：备忘录（待办列表） |
| `src/app/nav/_components/todo-section.module.css` | 备忘录样式 |
| `src/app/nav/_components/note-section.tsx` | 第三屏：笔记（列表 + Markdown 编辑弹窗） |
| `src/app/nav/_components/note-section.module.css` | 笔记样式 |

---

### 任务 1：路由与布局骨架

**文件：**
- 修改：`src/lib/site.ts:78-98`（APP_ROUTES 新增 nav）
- 修改：`src/lib/site.ts:131-134`（PUBLIC_NAV_ITEMS 新增导航项）
- 创建：`src/app/nav/layout.tsx`
- 创建：`src/app/nav/page.tsx`

- [ ] **步骤 1：在 APP_ROUTES 新增 nav 路由**

在 `src/lib/site.ts` 的 `APP_ROUTES` 前台部分，`blog` 之后新增：

```ts
nav: '/nav', // 导航页
```

- [ ] **步骤 2：在 PUBLIC_NAV_ITEMS 新增导航项**

在 `PUBLIC_NAV_ITEMS` 数组末尾新增：

```ts
{ href: APP_ROUTES.nav, label: '导航', match: 'exact' },
```

- [ ] **步骤 3：创建导航页 layout**

创建 `src/app/nav/layout.tsx`：

```tsx
import type { Metadata } from 'next';
import { SITE_METADATA } from '@/lib/site';

export const metadata: Metadata = {
    title: '导航',
    description: '浏览器导航页 — 搜索、书签、备忘录、笔记。',
};

export default function NavLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
```

- [ ] **步骤 4：创建导航页入口**

创建 `src/app/nav/page.tsx`：

```tsx
import NavShell from '@/app/nav/_components/nav-shell';

export default function NavPage() {
    return <NavShell />;
}
```

- [ ] **步骤 5：验证构建**

运行：`npx tsc --noEmit && npx next build`
预期：构建通过，`/nav` 路由出现在输出中

- [ ] **步骤 6：Commit**

```bash
git add -A && git commit -m "feat(导航页): 新增 /nav 路由与页面骨架"
```

---

### 任务 2：数据层（配置文件 + localStorage）

**文件：**
- 创建：`src/lib/nav-config.ts`
- 创建：`src/lib/nav-storage.ts`

- [ ] **步骤 1：创建书签与搜索引擎配置**

创建 `src/lib/nav-config.ts`：

```ts
/*============================================================================
  导航页配置 — 书签、搜索引擎

  前期数据写死在此文件，后期接入数据库后替换数据源即可。
============================================================================*/

/*-- 搜索引擎 --*/
export interface SearchEngine {
    key: string;
    name: string;
    url: string; // 搜索 URL 模板，{query} 为占位符
}

export const SEARCH_ENGINES: SearchEngine[] = [
    { key: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}' },
    { key: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={query}' },
    { key: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q={query}' },
    { key: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q={query}' },
];

/*-- 书签 --*/
export interface BookmarkItem {
    name: string;
    url: string;
}

export interface BookmarkFolder {
    name: string;
    children: BookmarkItem[];
}

export type Bookmark = BookmarkItem | BookmarkFolder;

/*-- 判断是否为文件夹 --*/
export function isBookmarkFolder(b: Bookmark): b is BookmarkFolder {
    return 'children' in b;
}

export const BOOKMARKS: Bookmark[] = [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Gmail', url: 'https://mail.google.com' },
    {
        name: '工具',
        children: [
            { name: 'Notion', url: 'https://notion.so' },
            { name: 'Figma', url: 'https://figma.com' },
            { name: 'Vercel', url: 'https://vercel.com' },
        ],
    },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { name: 'MDN', url: 'https://developer.mozilla.org' },
    {
        name: '设计',
        children: [
            { name: 'Dribbble', url: 'https://dribbble.com' },
            { name: 'Behance', url: 'https://behance.net' },
        ],
    },
];
```

- [ ] **步骤 2：创建 localStorage 封装**

创建 `src/lib/nav-storage.ts`：

```ts
/*============================================================================
  导航页本地存储 — 搜索记录、备忘录、笔记

  前期数据存 localStorage，后期接入数据库后替换数据源即可。
  上层组件通过此模块读写，不直接操作 localStorage。
============================================================================*/

/*-- 存储键 --*/
const KEYS = {
    searchHistory: 'zhijian_nav_search_history',
    searchEngine: 'zhijian_nav_search_engine',
    todos: 'zhijian_nav_todos',
    notes: 'zhijian_nav_notes',
} as const;

/*== 搜索记录 ==*/

export interface SearchRecord {
    query: string;
    engine: string;
    time: number; // timestamp
}

const MAX_SEARCH_HISTORY = 10;

export function getSearchHistory(): SearchRecord[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.searchHistory);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function addSearchRecord(record: SearchRecord): void {
    const history = getSearchHistory();
    /*-- 去重：相同 query 只保留最新 --*/
    const filtered = history.filter(h => h.query !== record.query);
    filtered.unshift(record);
    localStorage.setItem(KEYS.searchHistory, JSON.stringify(filtered.slice(0, MAX_SEARCH_HISTORY)));
}

export function clearSearchHistory(): void {
    localStorage.removeItem(KEYS.searchHistory);
}

/*== 默认搜索引擎 ==*/

export function getSearchEngine(): string {
    if (typeof window === 'undefined') return 'google';
    return localStorage.getItem(KEYS.searchEngine) || 'google';
}

export function setSearchEngine(key: string): void {
    localStorage.setItem(KEYS.searchEngine, key);
}

/*== 备忘录（待办） ==*/

export interface TodoItem {
    id: string;
    text: string;
    done: boolean;
    createdAt: number;
}

export function getTodos(): TodoItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.todos);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveTodos(todos: TodoItem[]): void {
    localStorage.setItem(KEYS.todos, JSON.stringify(todos));
}

/*== 笔记 ==*/

export interface NoteItem {
    id: string;
    title: string;
    content: string; // Markdown
    createdAt: number;
    updatedAt: number;
}

export function getNotes(): NoteItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEYS.notes);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveNotes(notes: NoteItem[]): void {
    localStorage.setItem(KEYS.notes, JSON.stringify(notes));
}
```

- [ ] **步骤 3：验证类型检查**

运行：`npx tsc --noEmit`
预期：无错误

- [ ] **步骤 4：Commit**

```bash
git add -A && git commit -m "feat(导航页): 新增书签配置与 localStorage 数据层"
```

---

### 任务 3：全屏分页容器 + Dock 指示器

**文件：**
- 创建：`src/app/nav/_components/nav-shell.tsx`
- 创建：`src/app/nav/_components/nav-shell.module.css`

- [ ] **步骤 1：创建 NavShell 样式**

创建 `src/app/nav/_components/nav-shell.module.css`：

```css
/*== 导航页全屏分页容器 ==*/

.shell {
    height: 100vh;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    scrollbar-width: none; /* Firefox */
}

.shell::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
}

/*-- 每一屏 --*/

.section {
    height: 100vh;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
}

/*-- Dock 指示器 --*/

.dock {
    position: fixed;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 10;
}

.dockItem {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 50%;
    background: var(--muted);
    color: var(--muted-foreground);
    cursor: pointer;
    transition: transform 0.2s, background 0.2s, color 0.2s;
}

.dockItem:hover {
    transform: scale(1.25);
}

.dockItemActive {
    background: var(--primary);
    color: var(--primary-foreground);
}

.dockIcon {
    width: 0.875rem;
    height: 0.875rem;
}
```

- [ ] **步骤 2：创建 NavShell 组件**

创建 `src/app/nav/_components/nav-shell.tsx`：

```tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { SearchIcon, ListIcon, PencilIcon } from '@/components/ui/icons';

import SearchSection from './search-section';
import TodoSection from './todo-section';
import NoteSection from './note-section';
import styles from './nav-shell.module.css';

/*-- Dock 配置 --*/
const SECTIONS = [
    { id: 'search', icon: SearchIcon, label: '搜索' },
    { id: 'todo', icon: ListIcon, label: '备忘录' },
    { id: 'note', icon: PencilIcon, label: '笔记' },
] as const;

export default function NavShell() {
    const [activeIndex, setActiveIndex] = useState(0);
    const shellRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

    /*-- IntersectionObserver 追踪当前屏 --*/
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
                        if (idx !== -1) setActiveIndex(idx);
                    }
                }
            },
            { root: shellRef.current, threshold: 0.6 },
        );

        sectionRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    /*-- Dock 点击跳转 --*/
    const scrollToSection = useCallback((index: number) => {
        const el = sectionRefs.current[index];
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, []);

    return (
        <div className={styles.shell} ref={shellRef}>
            {/*-- Dock 指示器 --*/}
            <div className={styles.dock}>
                {SECTIONS.map((section, i) => (
                    <button
                        key={section.id}
                        aria-label={section.label}
                        className={`${styles.dockItem} ${i === activeIndex ? styles.dockItemActive : ''}`}
                        onClick={() => scrollToSection(i)}
                        type="button"
                    >
                        <section.icon className={styles.dockIcon} />
                    </button>
                ))}
            </div>

            {/*-- 三屏内容 --*/}
            <div
                className={styles.section}
                ref={(el) => { sectionRefs.current[0] = el; }}
            >
                <SearchSection />
            </div>
            <div
                className={styles.section}
                ref={(el) => { sectionRefs.current[1] = el; }}
            >
                <TodoSection />
            </div>
            <div
                className={styles.section}
                ref={(el) => { sectionRefs.current[2] = el; }}
            >
                <NoteSection />
            </div>
        </div>
    );
}
```

- [ ] **步骤 3：创建三个占位 section 组件**

临时创建最小占位组件，确保 NavShell 可编译：

创建 `src/app/nav/_components/search-section.tsx`：
```tsx
export default function SearchSection() {
    return <div style={{ textAlign: 'center' }}>搜索 + 书签</div>;
}
```

创建 `src/app/nav/_components/todo-section.tsx`：
```tsx
export default function TodoSection() {
    return <div style={{ textAlign: 'center' }}>备忘录</div>;
}
```

创建 `src/app/nav/_components/note-section.tsx`：
```tsx
export default function NoteSection() {
    return <div style={{ textAlign: 'center' }}>笔记</div>;
}
```

- [ ] **步骤 4：验证构建**

运行：`npx tsc --noEmit && npx next build`
预期：构建通过，`/nav` 页面可访问，三屏滑动 + Dock 跳转工作

- [ ] **步骤 5：Commit**

```bash
git add -A && git commit -m "feat(导航页): 全屏分页容器与 Dock 指示器"
```

---

### 任务 4：搜索栏 + 搜索记录

**文件：**
- 创建：`src/app/nav/_components/search-bar.tsx`
- 创建：`src/app/nav/_components/search-bar.module.css`
- 修改：`src/app/nav/_components/search-section.tsx`
- 创建：`src/app/nav/_components/search-section.module.css`

- [ ] **步骤 1：创建 SearchBar 样式**

创建 `src/app/nav/_components/search-bar.module.css`：

```css
/*== 搜索栏 ==*/

.bar {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 36rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    overflow: hidden;
    transition: border-color 0.15s;
}

.bar:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--ring-subtle);
}

/*-- 搜索引擎选择器 --*/

.engineBtn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border: none;
    border-right: 1px solid var(--border);
    background: var(--muted);
    color: var(--foreground);
    font-size: 0.8125rem;
    font-family: var(--font-sans);
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
}

.engineBtn:hover {
    background: var(--secondary);
}

.engineArrow {
    width: 0.75rem;
    height: 0.75rem;
}

/*-- 搜索引擎下拉 --*/

.engineDropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.25rem;
    background: var(--popover);
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 20;
    min-width: 8rem;
}

.engineOption {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: none;
    background: none;
    color: var(--foreground);
    font-size: 0.8125rem;
    font-family: var(--font-sans);
    text-align: left;
    cursor: pointer;
    transition: background 0.1s;
}

.engineOption:hover {
    background: var(--accent);
}

.engineOptionActive {
    color: var(--primary);
    font-weight: 500;
}

/*-- 输入框 --*/

.input {
    flex: 1;
    padding: 0.625rem 0.75rem;
    border: none;
    background: transparent;
    color: var(--foreground);
    font-size: 0.9375rem;
    font-family: var(--font-sans);
    outline: none;
}

.input::placeholder {
    color: var(--muted-foreground);
}

/*-- 提交按钮 --*/

.submitBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    border: none;
    background: var(--primary);
    color: var(--primary-foreground);
    cursor: pointer;
    transition: background 0.15s;
}

.submitBtn:hover {
    background: var(--primary-hover);
}

.submitIcon {
    width: 1rem;
    height: 1rem;
}

/*-- 搜索记录 --*/

.history {
    width: 100%;
    max-width: 36rem;
    margin-top: 1rem;
}

.historyHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.historyTitle {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    margin: 0;
}

.historyClear {
    font-size: 0.6875rem;
    color: var(--muted-foreground);
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
}

.historyClear:hover {
    color: var(--primary);
}

.historyList {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.historyTag {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--muted);
    color: var(--foreground);
    font-size: 0.75rem;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: border-color 0.15s;
}

.historyTag:hover {
    border-color: var(--primary);
}
```

- [ ] **步骤 2：创建 SearchBar 组件**

创建 `src/app/nav/_components/search-bar.tsx`：

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';

import { SearchIcon, ChevronRightIcon } from '@/components/ui/icons';
import { SEARCH_ENGINES } from '@/lib/nav-config';
import { getSearchHistory, addSearchRecord, clearSearchHistory, getSearchEngine, setSearchEngine } from '@/lib/nav-storage';

import styles from './search-bar.module.css';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [engineKey, setEngineKey] = useState('google');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEngineKey(getSearchEngine());
    }, []);

    /*-- 点击外部关闭下拉 --*/
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const engine = SEARCH_ENGINES.find(e => e.key === engineKey) ?? SEARCH_ENGINES[0];

    function handleSearch(q?: string) {
        const term = (q ?? query).trim();
        if (!term) return;
        addSearchRecord({ query: term, engine: engineKey, time: Date.now() });
        window.open(engine.url.replace('{query}', encodeURIComponent(term)), '_blank');
        setQuery('');
    }

    function handleEngineChange(key: string) {
        setEngineKey(key);
        setSearchEngine(key);
        setDropdownOpen(false);
        inputRef.current?.focus();
    }

    const history = getSearchHistory();

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={styles.bar}>
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        className={styles.engineBtn}
                        onClick={() => setDropdownOpen(v => !v)}
                        type="button"
                    >
                        {engine.name}
                        <ChevronRightIcon className={styles.engineArrow} />
                    </button>
                    {dropdownOpen && (
                        <div className={styles.engineDropdown}>
                            {SEARCH_ENGINES.map(e => (
                                <button
                                    key={e.key}
                                    className={`${styles.engineOption} ${e.key === engineKey ? styles.engineOptionActive : ''}`}
                                    onClick={() => handleEngineChange(e.key)}
                                    type="button"
                                >
                                    {e.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    ref={inputRef}
                    className={styles.input}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    placeholder="搜索..."
                    type="text"
                    value={query}
                />
                <button
                    aria-label="搜索"
                    className={styles.submitBtn}
                    onClick={() => handleSearch()}
                    type="button"
                >
                    <SearchIcon className={styles.submitIcon} />
                </button>
            </div>

            {/*-- 搜索记录 --*/}
            {history.length > 0 && (
                <div className={styles.history}>
                    <div className={styles.historyHeader}>
                        <p className={styles.historyTitle}>最近搜索</p>
                        <button className={styles.historyClear} onClick={clearSearchHistory} type="button">
                            清除
                        </button>
                    </div>
                    <ul className={styles.historyList}>
                        {history.map((h) => (
                            <li key={h.time}>
                                <button className={styles.historyTag} onClick={() => handleSearch(h.query)} type="button">
                                    {h.query}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
```

- [ ] **步骤 3：创建 SearchSection 样式**

创建 `src/app/nav/_components/search-section.module.css`：

```css
/*== 第一屏：搜索 + 书签 ==*/

.section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    width: 100%;
    max-width: 48rem;
}
```

- [ ] **步骤 4：替换 SearchSection 占位组件**

替换 `src/app/nav/_components/search-section.tsx`：

```tsx
'use client';

import SearchBar from './search-bar';
import BookmarkBar from './bookmark-bar';

import styles from './search-section.module.css';

export default function SearchSection() {
    return (
        <div className={styles.section}>
            <SearchBar />
            <BookmarkBar />
        </div>
    );
}
```

- [ ] **步骤 5：创建 BookmarkBar 占位组件**

创建 `src/app/nav/_components/bookmark-bar.tsx`：

```tsx
export default function BookmarkBar() {
    return <div>书签栏</div>;
}
```

- [ ] **步骤 6：验证类型检查**

运行：`npx tsc --noEmit`
预期：无错误

- [ ] **步骤 7：Commit**

```bash
git add -A && git commit -m "feat(导航页): 搜索栏与搜索记录"
```

---

### 任务 5：书签栏

**文件：**
- 修改：`src/app/nav/_components/bookmark-bar.tsx`
- 创建：`src/app/nav/_components/bookmark-bar.module.css`

- [ ] **步骤 1：创建 BookmarkBar 样式**

创建 `src/app/nav/_components/bookmark-bar.module.css`：

```css
/*== 书签栏 ==*/

.bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    max-width: 48rem;
}

/*-- 单个书签 --*/

.item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    color: var(--foreground);
    font-size: 0.8125rem;
    font-family: var(--font-sans);
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}

.item:hover {
    border-color: var(--primary);
    background: var(--primary-subtle);
}

.favicon {
    width: 1rem;
    height: 1rem;
    border-radius: 2px;
}

/*-- 文件夹 --*/

.folder {
    position: relative;
}

.folderPopup {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.375rem;
    background: var(--popover);
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 20;
    min-width: 10rem;
    padding: 0.25rem 0;
}

.folderItem {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    color: var(--foreground);
    font-size: 0.8125rem;
    font-family: var(--font-sans);
    text-decoration: none;
    transition: background 0.1s;
}

.folderItem:hover {
    background: var(--accent);
}
```

- [ ] **步骤 2：替换 BookmarkBar 组件**

替换 `src/app/nav/_components/bookmark-bar.tsx`：

```tsx
'use client';

import { useState } from 'react';

import { ChevronRightIcon } from '@/components/ui/icons';
import { BOOKMARKS, isBookmarkFolder } from '@/lib/nav-config';
import type { Bookmark, BookmarkFolder } from '@/lib/nav-config';

import styles from './bookmark-bar.module.css';

/*-- Favicon URL --*/
function faviconUrl(url: string): string {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return '';
    }
}

/*-- 单个书签 --*/
function BookmarkLink({ bookmark }: { bookmark: Bookmark }) {
    const [hover, setHover] = useState(false);

    if (isBookmarkFolder(bookmark)) {
        return (
            <div
                className={styles.folder}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <span className={styles.item}>
                    <ChevronRightIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                    {bookmark.name}
                </span>
                {hover && (
                    <div className={styles.folderPopup}>
                        {bookmark.children.map((child) => (
                            <a
                                key={child.url}
                                className={styles.folderItem}
                                href={child.url}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <img
                                    alt=""
                                    className={styles.favicon}
                                    loading="lazy"
                                    src={faviconUrl(child.url)}
                                />
                                {child.name}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <a
            className={styles.item}
            href={bookmark.url}
            rel="noopener noreferrer"
            target="_blank"
        >
            <img
                alt=""
                className={styles.favicon}
                loading="lazy"
                src={faviconUrl(bookmark.url)}
            />
            {bookmark.name}
        </a>
    );
}

export default function BookmarkBar() {
    return (
        <div className={styles.bar}>
            {BOOKMARKS.map((bookmark, i) => (
                <BookmarkLink key={isBookmarkFolder(bookmark) ? `folder-${i}` : bookmark.url} bookmark={bookmark} />
            ))}
        </div>
    );
}
```

- [ ] **步骤 3：验证类型检查**

运行：`npx tsc --noEmit`
预期：无错误

- [ ] **步骤 4：Commit**

```bash
git add -A && git commit -m "feat(导航页): 书签栏与文件夹 hover 展开"
```

---

### 任务 6：备忘录（待办）

**文件：**
- 修改：`src/app/nav/_components/todo-section.tsx`
- 创建：`src/app/nav/_components/todo-section.module.css`

- [ ] **步骤 1：创建 TodoSection 样式**

创建 `src/app/nav/_components/todo-section.module.css`：

```css
/*== 备忘录（待办） ==*/

.panel {
    width: 100%;
    max-width: 28rem;
}

.title {
    font-size: 1.25rem;
    font-family: var(--font-serif);
    font-weight: 500;
    color: var(--foreground);
    margin: 0 0 1rem;
}

/*-- 添加输入行 --*/

.addRow {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.addInput {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    color: var(--foreground);
    font-size: 0.875rem;
    font-family: var(--font-sans);
    outline: none;
    transition: border-color 0.15s;
}

.addInput:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--ring-subtle);
}

.addInput::placeholder {
    color: var(--muted-foreground);
}

.addBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--primary);
    border-radius: var(--radius);
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 0.875rem;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: background 0.15s;
}

.addBtn:hover {
    background: var(--primary-hover);
}

/*-- 待办列表 --*/

.list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.todoItem {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    transition: border-color 0.15s;
}

.todoItem:hover {
    border-color: var(--primary);
}

.todoCheckbox {
    width: 1rem;
    height: 1rem;
    accent-color: var(--primary);
    cursor: pointer;
}

.todoText {
    flex: 1;
    font-size: 0.875rem;
    color: var(--foreground);
    line-height: 1.4;
}

.todoTextDone {
    text-decoration: line-through;
    color: var(--muted-foreground);
}

.todoDelete {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.125rem;
    border: none;
    background: none;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: color 0.15s;
}

.todoDelete:hover {
    color: var(--destructive);
}

.todoDeleteIcon {
    width: 0.875rem;
    height: 0.875rem;
}

/*-- 空状态 --*/

.empty {
    text-align: center;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    padding: 2rem 0;
}
```

- [ ] **步骤 2：替换 TodoSection 组件**

替换 `src/app/nav/_components/todo-section.tsx`：

```tsx
'use client';

import { useState, useEffect } from 'react';

import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import { getTodos, saveTodos } from '@/lib/nav-storage';
import type { TodoItem } from '@/lib/nav-storage';

import styles from './todo-section.module.css';

export default function TodoSection() {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        setTodos(getTodos());
    }, []);

    function persist(updated: TodoItem[]) {
        setTodos(updated);
        saveTodos(updated);
    }

    function handleAdd() {
        const text = input.trim();
        if (!text) return;
        const newItem: TodoItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text,
            done: false,
            createdAt: Date.now(),
        };
        persist([newItem, ...todos]);
        setInput('');
    }

    function handleToggle(id: string) {
        persist(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
    }

    function handleDelete(id: string) {
        persist(todos.filter(t => t.id !== id));
    }

    return (
        <div className={styles.panel}>
            <h2 className={styles.title}>备忘录</h2>
            <div className={styles.addRow}>
                <input
                    className={styles.addInput}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                    placeholder="添加待办..."
                    type="text"
                    value={input}
                />
                <button className={styles.addBtn} onClick={handleAdd} type="button">
                    <PlusIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                </button>
            </div>
            {todos.length === 0 ? (
                <p className={styles.empty}>暂无待办</p>
            ) : (
                <ul className={styles.list}>
                    {todos.map((t) => (
                        <li key={t.id} className={styles.todoItem}>
                            <input
                                checked={t.done}
                                className={styles.todoCheckbox}
                                onChange={() => handleToggle(t.id)}
                                type="checkbox"
                            />
                            <span className={`${styles.todoText} ${t.done ? styles.todoTextDone : ''}`}>
                                {t.text}
                            </span>
                            <button
                                aria-label="删除"
                                className={styles.todoDelete}
                                onClick={() => handleDelete(t.id)}
                                type="button"
                            >
                                <Trash2Icon className={styles.todoDeleteIcon} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
```

- [ ] **步骤 3：验证类型检查**

运行：`npx tsc --noEmit`
预期：无错误

- [ ] **步骤 4：Commit**

```bash
git add -A && git commit -m "feat(导航页): 备忘录待办列表"
```

---

### 任务 7：笔记（知识库）

**文件：**
- 修改：`src/app/nav/_components/note-section.tsx`
- 创建：`src/app/nav/_components/note-section.module.css`

- [ ] **步骤 1：创建 NoteSection 样式**

创建 `src/app/nav/_components/note-section.module.css`：

```css
/*== 笔记（知识库） ==*/

.panel {
    width: 100%;
    max-width: 36rem;
}

.title {
    font-size: 1.25rem;
    font-family: var(--font-serif);
    font-weight: 500;
    color: var(--foreground);
    margin: 0 0 1rem;
}

/*-- 添加按钮 --*/

.addBtn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--muted-foreground);
    font-size: 0.8125rem;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
}

.addBtn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

/*-- 笔记列表 --*/

.list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.noteItem {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
    cursor: pointer;
    transition: border-color 0.15s;
}

.noteItem:hover {
    border-color: var(--primary);
}

.noteInfo {
    flex: 1;
    min-width: 0;
}

.noteTitle {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--foreground);
    margin: 0 0 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.noteDate {
    font-size: 0.6875rem;
    color: var(--muted-foreground);
    margin: 0;
}

.noteDelete {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.125rem;
    border: none;
    background: none;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: color 0.15s;
}

.noteDelete:hover {
    color: var(--destructive);
}

.noteDeleteIcon {
    width: 0.875rem;
    height: 0.875rem;
}

/*-- 编辑弹窗内的表单 --*/

.editorTitle {
    width: 100%;
    padding: 0.5rem 0;
    border: none;
    border-bottom: 1px solid var(--border);
    background: transparent;
    color: var(--foreground);
    font-size: 1rem;
    font-family: var(--font-serif);
    font-weight: 500;
    outline: none;
    margin-bottom: 0.75rem;
}

.editorTitle::placeholder {
    color: var(--muted-foreground);
}

.editorBody {
    width: 100%;
    min-height: 16rem;
    padding: 0.5rem 0;
    border: none;
    background: transparent;
    color: var(--foreground);
    font-size: 0.875rem;
    font-family: var(--font-sans);
    line-height: 1.6;
    outline: none;
    resize: vertical;
}

.editorBody::placeholder {
    color: var(--muted-foreground);
}

.editorActions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.cancelBtn {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--foreground);
    font-size: 0.8125rem;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: border-color 0.15s;
}

.cancelBtn:hover {
    border-color: var(--primary);
}

.saveBtn {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--primary);
    border-radius: var(--radius);
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 0.8125rem;
    font-family: var(--font-sans);
    cursor: pointer;
    transition: background 0.15s;
}

.saveBtn:hover {
    background: var(--primary-hover);
}

/*-- 空状态 --*/

.empty {
    text-align: center;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    padding: 2rem 0;
}
```

- [ ] **步骤 2：替换 NoteSection 组件**

替换 `src/app/nav/_components/note-section.tsx`：

```tsx
'use client';

import { useState, useEffect } from 'react';

import { PlusIcon, Trash2Icon } from '@/components/ui/icons';
import Dialog from '@/components/ui/dialog';
import { getNotes, saveNotes } from '@/lib/nav-storage';
import type { NoteItem } from '@/lib/nav-storage';

import styles from './note-section.module.css';

function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NoteSection() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [editing, setEditing] = useState<NoteItem | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        setNotes(getNotes());
    }, []);

    function persist(updated: NoteItem[]) {
        setNotes(updated);
        saveNotes(updated);
    }

    function handleCreate() {
        const newItem: NoteItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: '',
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setEditing(newItem);
        setEditTitle('');
        setEditContent('');
    }

    function handleOpen(note: NoteItem) {
        setEditing(note);
        setEditTitle(note.title);
        setEditContent(note.content);
    }

    function handleSave() {
        if (!editing) return;
        const now = Date.now();
        const updated: NoteItem = {
            ...editing,
            title: editTitle.trim() || '无标题',
            content: editContent,
            updatedAt: now,
        };
        const existing = notes.find(n => n.id === updated.id);
        if (existing) {
            persist(notes.map(n => n.id === updated.id ? updated : n));
        } else {
            persist([updated, ...notes]);
        }
        setEditing(null);
    }

    function handleDelete(id: string) {
        persist(notes.filter(n => n.id !== id));
    }

    return (
        <div className={styles.panel}>
            <h2 className={styles.title}>笔记</h2>
            {notes.length === 0 ? (
                <p className={styles.empty}>暂无笔记</p>
            ) : (
                <ul className={styles.list}>
                    {notes.map((n) => (
                        <li key={n.id} className={styles.noteItem} onClick={() => handleOpen(n)}>
                            <div className={styles.noteInfo}>
                                <p className={styles.noteTitle}>{n.title || '无标题'}</p>
                                <p className={styles.noteDate}>{formatDate(n.updatedAt)}</p>
                            </div>
                            <button
                                aria-label="删除"
                                className={styles.noteDelete}
                                onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                                type="button"
                            >
                                <Trash2Icon className={styles.noteDeleteIcon} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <button className={styles.addBtn} onClick={handleCreate} type="button">
                <PlusIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                新建笔记
            </button>

            {/*-- 编辑弹窗 --*/}
            <Dialog
                onClose={() => setEditing(null)}
                open={editing !== null}
                title="编辑笔记"
                maxWidth="40rem"
            >
                <input
                    className={styles.editorTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="标题"
                    type="text"
                    value={editTitle}
                />
                <textarea
                    className={styles.editorBody}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="开始写作（Markdown）..."
                    value={editContent}
                />
                <div className={styles.editorActions}>
                    <button className={styles.cancelBtn} onClick={() => setEditing(null)} type="button">
                        取消
                    </button>
                    <button className={styles.saveBtn} onClick={handleSave} type="button">
                        保存
                    </button>
                </div>
            </Dialog>
        </div>
    );
}
```

- [ ] **步骤 3：验证构建**

运行：`npx tsc --noEmit && npx next build`
预期：构建通过

- [ ] **步骤 4：Commit**

```bash
git add -A && git commit -m "feat(导航页): 笔记知识库与 Markdown 编辑"
```

---

### 任务 8：最终验证与文档

**文件：**
- 修改：`src/docs/features/nav-portal.md`（更新实际实现状态）

- [ ] **步骤 1：完整构建验证**

运行：`npx next build`
预期：构建通过，`/nav` 路由出现在输出中

- [ ] **步骤 2：本地启动验证功能**

运行：`npx next dev`
逐项验证：
- `/nav` 页面可访问
- 三屏上下滑动切换
- Dock 指示器高亮当前屏，点击跳转
- 搜索栏切换引擎、输入搜索、跳转
- 搜索记录显示和清除
- 书签显示、文件夹 hover 展开、点击跳转
- 备忘录添加/勾选/删除、刷新后数据保留
- 笔记新建/编辑/删除、刷新后数据保留

- [ ] **步骤 3：Commit**

```bash
git add -A && git commit -m "feat(导航页): 完成全部功能实现"
```
