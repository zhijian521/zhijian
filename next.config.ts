import type { NextConfig } from 'next';

/**
 * 当前项目暂未使用 `next/image` 的远程图片白名单能力，
 * 保持配置最小化，后续有明确来源时再按域名补充即可。
 */
const nextConfig: NextConfig = {
    turbopack: {},
};

export default nextConfig;
