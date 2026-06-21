'use client';

import { useState, useRef, useCallback } from 'react';

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
    const [faviconError, setFaviconError] = useState(false);
    const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
    const folderRef = useRef<HTMLDivElement>(null);

    const showPopup = useCallback(() => {
        setHover(true);
        if (folderRef.current) {
            const rect = folderRef.current.getBoundingClientRect();
            setPopupPos({ top: rect.bottom + 4, left: rect.left });
        }
    }, []);

    const hidePopup = useCallback(() => {
        setHover(false);
        setPopupPos(null);
    }, []);

    if (isBookmarkFolder(bookmark)) {
        return (
            <div
                ref={folderRef}
                className={styles.folder}
                onMouseEnter={showPopup}
                onMouseLeave={hidePopup}
            >
                <span className={styles.item}>
                    <ChevronRightIcon style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0 }} />
                    <span className={styles.name}>{bookmark.name}</span>
                </span>
                {hover && popupPos && (
                    <div
                        className={styles.folderPopup}
                        style={{ position: 'fixed', top: popupPos.top, left: popupPos.left }}
                        onMouseEnter={showPopup}
                        onMouseLeave={hidePopup}
                    >
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
                                <span className={styles.name}>{child.name}</span>
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
            {!faviconError ? (
                <img
                    alt=""
                    className={styles.favicon}
                    loading="lazy"
                    src={faviconUrl(bookmark.url)}
                    onError={() => setFaviconError(true)}
                />
            ) : (
                <span className={styles.faviconFallback}>{bookmark.name[0]}</span>
            )}
            <span className={styles.name}>{bookmark.name}</span>
        </a>
    );
}

export default function BookmarkBar() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.bar}>
                {BOOKMARKS.map((bookmark, i) => (
                    <BookmarkLink key={isBookmarkFolder(bookmark) ? `folder-${i}` : bookmark.url} bookmark={bookmark} />
                ))}
            </div>
        </div>
    );
}
