'use client';

import { useState } from 'react';

import styles from './favicon-img.module.css';

/*-- Favicon URL：自建代理优先，Google 兜底 --*/
function faviconUrl(url: string): string {
    try {
        const domain = new URL(url).hostname;
        return `/api/favicon?domain=${domain}`;
    } catch {
        return '';
    }
}

function faviconFallback(url: string): string {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return '';
    }
}

interface FaviconImgProps {
    url: string;
    className?: string;
    fallbackChar?: string;
}

/*== FaviconImg — 三级回退：自建代理 → Google → 首字母 ==*/
export default function FaviconImg({ url, className, fallbackChar }: FaviconImgProps) {
    const [src, setSrc] = useState<'primary' | 'secondary' | 'none'>('primary');

    if (src === 'none') {
        return (
            <span className={`${styles.fallback} ${className ?? ''}`}>
                {fallbackChar ?? ''}
            </span>
        );
    }

    return (
        <img
            alt=""
            className={className}
            loading="lazy"
            src={src === 'primary' ? faviconUrl(url) : faviconFallback(url)}
            onError={() => setSrc(prev => prev === 'primary' ? 'secondary' : 'none')}
        />
    );
}
