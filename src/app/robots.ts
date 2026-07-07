/*============================================================================
  robots — robots.txt 生成器

  Next.js 文件约定，构建时自动生成 /robots.txt。
  允许搜索引擎抓取前台，禁止后台和 API。
============================================================================*/

/*== 数据与配置 ==*/
import { SITE_METADATA } from '@/lib/core/site';

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${SITE_METADATA.siteUrl}/sitemap.xml`,
    };
}
