/*==
  图片同步脚本 — 将服务器上的图片文件增量同步到本地 public/uploads/ 目录。

  用法：
    node scripts/sync-uploads.mjs
    node scripts/sync-uploads.mjs --server https://yuwb.dev
    node scripts/sync-uploads.mjs --server https://yuwb.dev --username admin --password xxx

  自动加载项目根目录的 .env.local 和 .env 获取 NEXT_PUBLIC_SITE_URL。
==*/

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..', '..');

/*== session cookie 名称，与 src/lib/auth.ts 保持一致 ==*/
const SESSION_COOKIE_NAME = 'zhijian_session';

/*== 加载 .env 文件（与 seed-admin.mjs 保持一致） ==*/
for (const envFile of ['.env', '.env.local']) {
    try {
        const content = readFileSync(resolve(projectRoot, envFile), 'utf-8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) continue;
            const key = trimmed.slice(0, eqIndex).trim();
            const value = trimmed.slice(eqIndex + 1).trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    } catch {
        /* 文件不存在则跳过 */
    }
}

/*== 解析命令行参数 ==*/
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--') && i + 1 < args.length) {
            parsed[args[i].slice(2)] = args[i + 1];
            i++;
        }
    }
    return parsed;
}

/*== 交互式输入 ==*/
async function prompt(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/*== 交互式密码输入（隐藏输入） ==*/
async function promptPassword(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        process.stdout.write(question);
        const stdin = process.stdin;
        const wasRaw = stdin.isRaw;
        if (stdin.isTTY) stdin.setRawMode(true);

        let password = '';
        const onData = (ch) => {
            const c = ch.toString();
            if (c === '\n' || c === '\r') {
                if (stdin.isTTY) stdin.setRawMode(wasRaw ?? false);
                stdin.removeListener('data', onData);
                rl.close();
                process.stdout.write('\n');
                resolve(password);
            } else if (c === '' || c === '\b') {
                if (password.length > 0) {
                    password = password.slice(0, -1);
                    process.stdout.write('\b \b');
                }
            } else {
                password += c;
                process.stdout.write('*');
            }
        };
        stdin.on('data', onData);
    });
}

/*== 格式化文件大小 ==*/
function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/*== 从登录响应中提取 session cookie ==*/
function extractSessionCookie(res) {
    /* 优先用 getSetCookie()（Node 20.2+） */
    const setCookieHeaders = res.headers.getSetCookie?.() || [];
    for (const header of setCookieHeaders) {
        if (header.startsWith(`${SESSION_COOKIE_NAME}=`)) {
            return header.split(';')[0];
        }
    }

    /* 兜底：从 set-cookie header 手动解析 */
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
        /* 多个 cookie 可能用逗号拼接，但 cookie 值内也可能含逗号（如 Expires 日期），
           这里只找 zhijian_session= 开头的部分 */
        const match = setCookie.match(new RegExp(`${SESSION_COOKIE_NAME}=[^;]+`));
        if (match) return match[0];
    }

    return null;
}

/*== 登录并返回 cookie 字符串 ==*/
async function login(server, username, password) {
    const loginRes = await fetch(`${server}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const cookie = extractSessionCookie(loginRes);

    if (!cookie) {
        const body = await loginRes.json().catch(() => null);
        if (body?.code !== 0) {
            throw new Error(body?.message || '登录失败');
        }
        /* 登录成功但没拿到 cookie — 可能是 HTTPS same-site 限制 */
        throw new Error('登录成功但未获取到 session cookie，请检查服务器 Cookie 策略');
    }

    return cookie;
}

/*== 主流程 ==*/
async function main() {
    const args = parseArgs();
    const server = args.server || process.env.NEXT_PUBLIC_SITE_URL || 'https://zhijian.yuwb.cn';

    console.log('');
    console.log('知简图片同步工具');
    console.log(`服务器: ${server}`);
    console.log('');

    /*-- 获取登录态 --*/
    let username = args.username || '';
    let password = args.password || '';

    if (!username || !password) {
        username = await prompt('用户名: ');
        password = await promptPassword('密码: ');
        if (!username || !password) {
            console.error('❌ 用户名和密码不能为空');
            process.exit(1);
        }
    }

    console.log('登录中...');
    let cookie;
    try {
        cookie = await login(server, username, password);
    } catch (err) {
        console.error('❌', err.message);
        process.exit(1);
    }

    console.log('登录成功，获取文件清单...');

    /*-- 获取文件清单 --*/
    const syncRes = await fetch(`${server}/api/admin/uploads/sync`, {
        headers: { Cookie: cookie },
    });
    const syncData = await syncRes.json();
    if (syncData.code !== 0 || !syncData.data?.files) {
        console.error('❌ 获取文件清单失败：', syncData.message || '未知错误');
        process.exit(1);
    }

    const files = syncData.data.files;
    const total = syncData.data.total;

    if (total === 0) {
        console.log('服务器无图片，无需同步。');
        return;
    }

    console.log(`服务器共 ${total} 张图片`);
    console.log('');

    /*-- 增量比对与下载 --*/
    let added = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    /* 并发控制：同时下载 3 个 */
    const CONCURRENCY = 3;
    const queue = [...files];

    async function downloadWorker() {
        while (queue.length > 0) {
            const file = queue.shift();
            if (!file) break;

            const localPath = join(projectRoot, 'public', file.path);
            const localDir = dirname(localPath);

            /* 比对：已存在且大小一致则跳过 */
            const localExists = existsSync(localPath);
            if (localExists) {
                try {
                    const localStat = statSync(localPath);
                    if (localStat.size === file.size) {
                        console.log(`· ${file.path} (已存在)`);
                        skipped++;
                        continue;
                    }
                } catch {
                    /* stat 失败则重新下载 */
                }
            }

            /* 下载文件 */
            try {
                const fileRes = await fetch(`${server}${file.path}`);
                if (!fileRes.ok) {
                    console.error(`✗ ${file.path} (HTTP ${fileRes.status})`);
                    failed++;
                    continue;
                }
                const buffer = Buffer.from(await fileRes.arrayBuffer());

                mkdirSync(localDir, { recursive: true });
                writeFileSync(localPath, buffer);

                if (localExists) {
                    updated++;
                    console.log(`↻ ${file.path} (${formatSize(file.size)})`);
                } else {
                    added++;
                    console.log(`✓ ${file.path} (${formatSize(file.size)})`);
                }
            } catch (err) {
                console.error(`✗ ${file.path} (${err.message})`);
                failed++;
            }
        }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => downloadWorker());
    await Promise.all(workers);

    console.log('');
    console.log(`同步完成：新增 ${added} 张，更新 ${updated} 张，跳过 ${skipped} 张，失败 ${failed} 张`);
}

main().catch((err) => {
    console.error('❌ 同步失败：', err);
    process.exit(1);
});
