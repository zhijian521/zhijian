/**
 * @api 图片同步检查
 * @group admin
 * @auth admin
 * @method GET 扫描服务器上传目录
 * @returns success<{ files: { path: string; size: number }[]; total: number }>
 */

import fs from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';

import { success } from '@/lib/core/api-response';
import { withAdmin } from '@/lib/core/with-admin';

/*== 图片同步清单接口 — 扫描服务器 public/uploads/ 目录，返回所有图片的路径和大小，供本地同步脚本使用。 ==*/

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);

interface SyncFileItem {
    path: string;
    size: number;
}

/*== 递归扫描目录，收集所有图片文件的相对路径和大小。 ==*/
function scanUploadsDir(dir: string, base: string, results: SyncFileItem[]): void {
    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return;
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            scanUploadsDir(fullPath, base, results);
        } else if (entry.isFile() && ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
            try {
                const stat = fs.statSync(fullPath);
                results.push({ path: '/' + path.relative(base, fullPath).replace(/\\/g, '/'), size: stat.size });
            } catch {
                /* 文件无法读取 stat 时跳过 */
            }
        }
    }
}

export const GET = withAdmin(async () => {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const files: SyncFileItem[] = [];
    scanUploadsDir(uploadsDir, path.join(process.cwd(), 'public'), files);

    return NextResponse.json(success({ files, total: files.length }));
});
