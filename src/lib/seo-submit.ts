import http from 'node:http';

import { SITE_METADATA } from '@/lib/site';

/*== 搜索引擎提交结果 ==*/
export interface SubmitResult {
    success: boolean;
    count?: number;
    message?: string;
}

/*== 提交到 IndexNow（支持 Bing/Yandex 等搜索引擎联盟） ==*/
async function submitToIndexNow(urls: string[]): Promise<SubmitResult> {
    const key = process.env.INDEXNOW_API_KEY;
    if (!key) return { success: false, message: '未配置 INDEXNOW_API_KEY' };
    if (urls.length === 0) return { success: true, count: 0 };

    try {
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                host: new URL(SITE_METADATA.siteUrl).host,
                key,
                urlList: urls,
            }),
        });

        /* IndexNow: 200=全部成功, 202=部分成功, 400+=失败 */
        if (response.status === 200 || response.status === 202) {
            return { success: true, count: urls.length };
        }

        return { success: false, message: `HTTP ${response.status}` };
    } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : '未知错误' };
    }
}

/*== 提交到百度站长平台（百度仅支持 HTTP/1.1，Node fetch 会协商 HTTP/2 导致 505） ==*/
async function submitToBaidu(urls: string[]): Promise<SubmitResult> {
    const token = process.env.BAIDU_SUBMISSION_TOKEN;
    if (!token) return { success: false, message: '未配置 BAIDU_SUBMISSION_TOKEN' };
    if (urls.length === 0) return { success: true, count: 0 };

    try {
        const site = process.env.BAIDU_SITE || SITE_METADATA.siteUrl;
        const body = urls.join('\n');
        const path = `/urls?site=${site}&token=${token}`;
        const data = await new Promise<string>((resolve, reject) => {
            const req = http.request(
                {
                    hostname: 'data.zz.baidu.com',
                    port: 80,
                    path,
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain', 'Content-Length': Buffer.byteLength(body) },
                },
                (res) => {
                    const chunks: Buffer[] = [];
                    res.on('data', (chunk: Buffer) => chunks.push(chunk));
                    res.on('end', () => resolve(Buffer.concat(chunks).toString()));
                },
            );
            req.on('error', reject);
            req.write(body);
            req.end();
        });

        const result = JSON.parse(data);
        if (result.success !== undefined) {
            return { success: true, count: result.success };
        }
        return { success: false, message: `${result.error}: ${result.message ?? ''}`.trim() };
    } catch (err) {
        return { success: false, message: err instanceof Error ? err.message : '未知错误' };
    }
}

/*== 提交 URL 到所有搜索引擎，返回各引擎结果 ==*/
export async function submitUrlsToSearchEngines(urls: string[]): Promise<{
    indexNow: SubmitResult;
    baidu: SubmitResult;
}> {
    const [indexNow, baidu] = await Promise.all([
        submitToIndexNow(urls),
        submitToBaidu(urls),
    ]);

    return { indexNow, baidu };
}
