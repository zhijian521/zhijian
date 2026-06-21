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
