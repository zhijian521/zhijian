import type { Metadata } from 'next';

import ComponentShowcase from './_components/component-showcase';

export const metadata: Metadata = {
    title: '组件列表',
};

export default function ComponentsPage() {
    return <ComponentShowcase />;
}