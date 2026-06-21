import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '导航',
    description: '浏览器导航页 — 搜索、书签、备忘录、笔记。',
};

export default function NavLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
