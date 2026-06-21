'use client';

import { useState } from 'react';

import { ChevronRightIcon } from '@/components/ui/icons';
import { BOOKMARKS, isBookmarkFolder } from '@/lib/nav-config';
import type { Bookmark } from '@/lib/nav-config';

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
