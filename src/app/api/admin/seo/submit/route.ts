import { NextResponse } from 'next/server';

import { BizCode, fail, success } from '@/lib/api-response';
import { getPublishedPosts } from '@/lib/posts';
import { submitUrlsToSearchEngines } from '@/lib/seo-submit';
import { SITE_METADATA } from '@/lib/site';
import { withAdmin } from '@/lib/with-admin';

/*== 后台 SEO 提交接口：收集全站 URL 并提交到 IndexNow 和百度。 ==*/
export const POST = withAdmin(async () => {
    try {
        const posts = await getPublishedPosts();

        const urls = [SITE_METADATA.siteUrl, `${SITE_METADATA.siteUrl}/blog`, ...posts.map((post) => `${SITE_METADATA.siteUrl}/blog/${post.slug}`)];

        const result = await submitUrlsToSearchEngines(urls);

        return NextResponse.json(
            success(
                {
                    totalUrls: urls.length,
                    indexNow: result.indexNow,
                    baidu: result.baidu,
                },
                '提交完成。'
            )
        );
    } catch (err) {
        console.error('SEO 提交失败：', err);
        return NextResponse.json(fail(BizCode.INTERNAL, '提交失败，请稍后重试。'), { status: 500 });
    }
});
