'use client';

import { SITE_METADATA } from '@/lib/core/site';

import SearchBar from './search-bar';
import BookmarkBar from './bookmark-bar';

import styles from './search-section.module.css';

interface SearchSectionProps {
    isLoggedIn?: boolean;
    dataVersion?: number;
    onAskAi: (query: string) => void;
}

export default function SearchSection({ isLoggedIn, dataVersion, onAskAi }: SearchSectionProps) {
    return (
        <div className={styles.section}>
            <h1 className={styles.brandTitle}>{SITE_METADATA.name}</h1>
            <SearchBar onAskAi={onAskAi} />
            <div className={styles.bookmarks}>
                <BookmarkBar isLoggedIn={isLoggedIn} dataVersion={dataVersion} />
            </div>
        </div>
    );
}
