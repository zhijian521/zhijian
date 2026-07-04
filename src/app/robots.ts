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
