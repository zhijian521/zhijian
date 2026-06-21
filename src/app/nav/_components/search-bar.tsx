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
