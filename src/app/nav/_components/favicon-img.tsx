'use client';

import { useState } from 'react';

import styles from './favicon-img.module.css';

/*-- 从 URL 提取域名，失败返回空串 --*/
function getDomain(url: string): string {
    try {
        return new URL(url).hostname;
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
    const domain = getDomain(url);

    if (src === 'none' || !domain) {
        return <span className={`${styles.fallback} ${className}`}>{fallbackChar ?? ''}</span>;
    }

    return (
        <img
            alt=""
            className={className}
            loading="lazy"
            src={src === 'primary' ? `/api/favicon?domain=${domain}` : `https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            onError={() => setSrc((prev) => (prev === 'primary' ? 'secondary' : 'none'))}
        />
    );
}
