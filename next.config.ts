import type { NextConfig } from 'next';

import { LEGACY_REDIRECTS } from '@/lib/core/legacy-redirects';

const nextConfig: NextConfig = {
    turbopack: {},
    /* ip2region 内置 .xdb 数据文件，路径基于 __dirname。
       Next.js 打包会重写 __dirname，导致运行时找不到数据文件。
       将其排除出 webpack 打包，运行时直接使用 node_modules 中的原模块。 */
    serverExternalPackages: ['ip2region'],

    /* 旧站 URL 301 永久重定向，映射配置见 src/lib/core/legacy-redirects.ts */
    async redirects() {
        return LEGACY_REDIRECTS.map(r => ({
            source: r.source,
            destination: r.destination,
            permanent: true,
        }));
    },

    /* HTML 页面禁长缓存 — 发版后立即生效；静态资源（_next/）由文件名哈希自破缓存，保持长缓存 */
    async headers() {
        return [{
            source: '/:path((?!_next).*)*',
            headers: [
                { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
            ],
        }];
    },
};

export default nextConfig;
