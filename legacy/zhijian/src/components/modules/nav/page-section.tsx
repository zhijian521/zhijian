/*============================================================================
  page-section — 导航页单屏框架

  承担 scroll-snap、观察目标和页面级语义，业务内容由调用方传入。
============================================================================*/

import type { ReactNode, RefCallback } from 'react';

import { cn } from '@/lib/core/utils';

import styles from './page-section.module.css';

interface PageSectionProps {
    children: ReactNode;
    label: string;
    sectionRef: RefCallback<HTMLElement>;
    variant?: 'top' | 'stretch';
}

export default function PageSection({ children, label, sectionRef, variant }: PageSectionProps) {
    return (
        <section aria-label={label} className={cn(styles.section, variant && styles[variant])} ref={sectionRef}>
            {children}
        </section>
    );
}
