'use client';

import { SITE_METADATA } from '@/lib/site';

import SearchBar from './search-bar';
import BookmarkBar from './bookmark-bar';

import styles from './search-section.module.css';

export default function SearchSection() {
    return (
        <div className={styles.section}>
            <h1 className={styles.brandTitle}>{SITE_METADATA.name}</h1>
            <SearchBar />
            <BookmarkBar />
        </div>
    );
}
