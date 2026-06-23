import type { Metadata } from 'next';

import NavShell from '@/app/nav/_components/nav-shell';

export const metadata: Metadata = {
    title: '导航',
    description: '浏览器导航页 — 搜索、书签、备忘录、笔记。',
};

export const dynamic = 'force-dynamic';

export default function NavPage() {
    return <NavShell />;
}
