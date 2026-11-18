/**
 * @api SEO URL 推送
 * @group admin
 * @auth admin
 * @method POST 将已发布文章 URL 推送到搜索引擎
 * @returns success<{ totalUrls: number; indexNow; baidu }> | fail
 */

import { NextResponse } from 'next/server';

import { BizCode, fail, success } from '@/lib/core/api-response';
import { getPublishedPosts } from '@/lib/domain/posts';
import { submitUrlsToSearchEngines } from '@/lib/domain/seo-submit';
import { SITE_METADATA } from '@/lib/core/site';
import { withAdmin } from '@/lib/core/with-admin';

/*== 后台 SEO 提交接口：收集全站 URL 并提交到 IndexNow 和百度。 ==*/
export const POST = withAdmin(async () => {
    try {
        const posts = await getPublishedPosts();

        const urls = [
            SITE_METADATA.siteUrl,
            `${SITE_METADATA.siteUrl}/blog`,
            ...posts.map((post) => `${SITE_METADATA.siteUrl}/blog/${post.slug}`),
        ];

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
