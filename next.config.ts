import type { NextConfig } from 'next';

/**
 * 当前项目暂未使用 `next/image` 的远程图片白名单能力，
 * 保持配置最小化，后续有明确来源时再按域名补充即可。
 */
const nextConfig: NextConfig = {
    turbopack: {},
    /* ip2region 内置 .xdb 数据文件，路径基于 __dirname。
       Next.js 打包会重写 __dirname，导致运行时找不到数据文件。
       将其排除出 webpack 打包，运行时直接使用 node_modules 中的原模块。 */
    serverExternalPackages: ['ip2region'],
};

export default nextConfig;
