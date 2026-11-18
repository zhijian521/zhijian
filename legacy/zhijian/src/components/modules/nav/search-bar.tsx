'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

import { SearchSparklesIcon } from '@/components/ui/icons';
import { useClickOutside } from '@/hooks/use-click-outside';
import { SEARCH_ENGINES } from '@/lib/domain/nav-config';
import {
    getSearchHistory,
    addSearchRecord,
    clearSearchHistory,
    getSearchEngine,
    setSearchEngine,
    genId,
} from '@/lib/domain/nav-storage';
import type { SearchRecord } from '@/lib/domain/nav-storage';

import styles from './search-bar.module.css';

interface SearchBarProps {
    onAskAi: (query: string) => void;
}

export default function SearchBar({ onAskAi }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [engineKey, setEngineKey] = useState('google');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [history, setHistory] = useState<SearchRecord[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEngineKey(getSearchEngine());
        setHistory(getSearchHistory());
    }, []);

    /*-- 点外面/Escape 关闭引擎下拉（仅下拉打开时绑定；原不支持 Escape，属顺带修复） --*/
    useClickOutside(dropdownRef, () => setDropdownOpen(false), { enabled: dropdownOpen });

    const engine = SEARCH_ENGINES.find((e) => e.key === engineKey) ?? SEARCH_ENGINES[0];

    /*-- 判断是否为 URL — 需要协议头或 www 前缀，避免误判普通搜索词 --*/
    function isUrl(s: string): boolean {
        if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(s)) return true;
        if (/^www\./.test(s) && /\.[a-zA-Z]{2,}/.test(s)) return true;
        return false;
    }

    function handleSearch(q?: string) {
        const term = (q ?? query).trim();
        if (!term) return;
        if (isUrl(term)) {
            const href = term.includes('://') ? term : `https://${term}`;
            addSearchRecord({ id: genId(), query: term, engine: 'direct', time: Date.now() });
            setHistory(getSearchHistory());
            window.open(href, '_blank');
        } else {
            addSearchRecord({ id: genId(), query: term, engine: engineKey, time: Date.now() });
            setHistory(getSearchHistory());
            window.open(engine.url.replace('{query}', encodeURIComponent(term)), '_blank');
        }
        setQuery('');
    }

    function handleEngineChange(key: string) {
        setEngineKey(key);
        setSearchEngine(key);
        setDropdownOpen(false);
        inputRef.current?.focus();
    }

    function handleClearHistory() {
        clearSearchHistory();
        setHistory([]);
    }

    function handleAskAi() {
        const term = query.trim();
        onAskAi(term);
        setQuery('');
    }

    return (
        <div className={styles.outer}>
            <div className={styles.bar}>
                <div ref={dropdownRef} className={styles.engineAnchor}>
                    <button className={styles.engineBtn} onClick={() => setDropdownOpen((v) => !v)} type="button">
                        <Image
                            alt={engine.name}
                            className={styles.engineIcon}
                            height={20}
                            src={engine.logo}
                            width={20}
                        />
                    </button>
                    {dropdownOpen && (
                        <div className={styles.engineDropdown}>
                            {SEARCH_ENGINES.map((e) => (
                                <button
                                    key={e.key}
                                    className={`${styles.engineOption} ${e.key === engineKey ? styles.engineOptionActive : ''}`}
                                    onClick={() => handleEngineChange(e.key)}
                                    type="button"
                                >
                                    <Image
                                        alt={e.name}
                                        className={styles.engineOptionIcon}
                                        height={16}
                                        src={e.logo}
                                        width={16}
                                    />
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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                    placeholder="寻一处旧识，或抵达一方新境…"
                    type="text"
                    value={query}
                />
                <button aria-label="AI 搜索" className={styles.aiBtn} onClick={handleAskAi} type="button">
                    <SearchSparklesIcon className={styles.aiIcon} />
                </button>
            </div>

            {history.length > 0 && (
                <div className={styles.history}>
                    <div className={styles.historyHeader}>
                        <p className={styles.historyTitle}>最近搜索</p>
                        <button className={styles.historyClear} onClick={handleClearHistory} type="button">
                            清除
                        </button>
                    </div>
                    <ul className={styles.historyList}>
                        {history.map((h) => (
                            <li key={h.id}>
                                <button
                                    className={styles.historyTag}
                                    onClick={() => handleSearch(h.query)}
                                    type="button"
                                >
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
