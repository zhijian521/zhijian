import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

import { getDb } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

/*== 类型定义 ==*/

/*== 图片上传记录，供前端使用。 ==*/
export interface Upload {
    id: number;
    filename: string;
    original: string;
    path: string;
    size: number;
    mime: string;
    alt: string;
    createdAt: string | null;
}

/*== MySQL 查询返回的原始行类型，字段名与数据库列名保持一致。 ==*/
interface UploadRow extends RowDataPacket {
    id: number;
    filename: string;
    original: string;
    path: string;
    size: number;
    mime: string;
    alt: string;
    created_at: string;
}

/*== 常量 ==*/

/*== 允许的图片 MIME 类型。 ==*/
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
]);

/*== 文件大小上限 5 MB。 ==*/
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/*== MIME 类型到扩展名的映射。 ==*/
const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
};

/*== 校验 ==*/

/*== 校验图片格式和大小，返回错误消息或 null。 ==*/
export function validateImageFile(file: { type: string; size: number }): string | null {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return '不支持的图片格式，仅允许 JPEG、PNG、GIF、WebP、SVG。';
    }
    if (file.size > MAX_FILE_SIZE) {
        return '图片大小不能超过 5 MB。';
    }
    return null;
}

/*== 写入操作 ==*/

/*== 上传图片到文件系统 + 数据库。 非 SVG/GIF 自动转为 WebP。返回上传记录，失败时返回 null。 ==*/
export async function saveUpload(file: File): Promise<Upload | null> {
    const db = getDb();
    if (!db) return null;

    const ext = MIME_TO_EXT[file.type];
    if (!ext) return null;

    /*-- SVG 和 GIF 不转换，其余格式统一转为 WebP --*/
    const shouldConvert = file.type !== 'image/svg+xml' && file.type !== 'image/gif';

    const outputExt = shouldConvert ? 'webp' : ext;
    const outputMime = shouldConvert ? 'image/webp' : file.type;

    /*-- 生成存储路径：/uploads/YYYY/MM/<hash8>.<ext> --*/
    const now = new Date();
    const year = `${now.getFullYear()}`;
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const hash = crypto.randomBytes(4).toString('hex');
    const filename = `${hash}.${outputExt}`;
    const relativePath = `/uploads/${year}/${month}/${filename}`;

    /*-- 写入文件系统 --*/
    const publicDir = path.join(process.cwd(), 'public', 'uploads', year, month);
    try {
        fs.mkdirSync(publicDir, { recursive: true });
    } catch (err) {
        console.error('创建上传目录失败：', err);
        return null;
    }

    const filePath = path.join(publicDir, filename);
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        if (shouldConvert) {
            await sharp(buffer).webp({ quality: 80 }).toFile(filePath);
        } else {
            fs.writeFileSync(filePath, buffer);
        }
    } catch (err) {
        console.error('写入上传文件失败：', err);
        return null;
    }

    /*-- 转换后获取实际文件大小 --*/
    let actualSize: number;
    try {
        actualSize = fs.statSync(filePath).size;
    } catch {
        actualSize = file.size;
    }

    /*-- 写入数据库 --*/
    try {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO zhijian_blog_uploads (filename, original, path, size, mime, alt, created_at)
             VALUES (?, ?, ?, ?, ?, '', NOW())`,
            [filename, file.name, relativePath, actualSize, outputMime],
        );

        return getUploadById(result.insertId);
    } catch (err) {
        console.error('写入上传记录失败：', err);
        /*-- 数据库写入失败时清理已写入的文件 --*/
        try { fs.unlinkSync(filePath); } catch { /* 忽略清理失败 */ }
        return null;
    }
}

/*== 查询 ==*/

/*== 按 ID 查询上传记录。 ==*/
export async function getUploadById(id: number): Promise<Upload | null> {
    const db = getDb();
    if (!db) return null;

    try {
        const [rows] = await db.execute<UploadRow[]>(
            `SELECT id, filename, original, path, size, mime, alt,
                    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
             FROM zhijian_blog_uploads
             WHERE id = ?`,
            [id],
        );

        if (rows.length === 0) return null;
        return toUpload(rows[0]);
    } catch (err) {
        console.error('查询上传记录失败：', { id, err });
        return null;
    }
}

/*== 分页查询上传记录列表。 ==*/
export async function listUploads(
    page: number,
    pageSize: number,
): Promise<{ data: Upload[]; total: number }> {
    const db = getDb();
    if (!db) return { data: [], total: 0 };

    const offset = (page - 1) * pageSize;

    try {
        const [countRows] = await db.execute<RowDataPacket[]>(
            'SELECT COUNT(*) AS total FROM zhijian_blog_uploads',
        );
        const total = (countRows[0] as RowDataPacket).total as number;

        const [rows] = await db.execute<UploadRow[]>(
            `SELECT id, filename, original, path, size, mime, alt,
                    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
             FROM zhijian_blog_uploads
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [pageSize, offset],
        );

        return { data: rows.map(toUpload), total };
    } catch (err) {
        console.error('查询上传列表失败：', err);
        return { data: [], total: 0 };
    }
}

/*== 更新 ==*/

/*== 更新上传记录的名称和/或 alt。 返回更新后的记录，失败返回 null。 ==*/
export async function updateUploadById(
    id: number,
    fields: { original?: string; alt?: string },
): Promise<Upload | null> {
    const db = getDb();
    if (!db) return null;

    const sets: string[] = [];
    const values: unknown[] = [];

    if (fields.original !== undefined) {
        sets.push('original = ?');
        values.push(fields.original);
    }
    if (fields.alt !== undefined) {
        sets.push('alt = ?');
        values.push(fields.alt);
    }

    if (sets.length === 0) return getUploadById(id);

    values.push(id);

    try {
        const [result] = await db.execute<ResultSetHeader>(
            `UPDATE zhijian_blog_uploads SET ${sets.join(', ')} WHERE id = ?`,
            values,
        );
        if (result.affectedRows === 0) return null;
        return getUploadById(id);
    } catch (err) {
        console.error('更新上传记录失败：', { id, fields, err });
        return null;
    }
}

/*== 删除 ==*/

/*== 删除上传记录 + 物理文件。 返回是否成功删除。 ==*/
export async function deleteUploadById(id: number): Promise<boolean> {
    const db = getDb();
    if (!db) return false;

    /*-- 先查询记录，获取文件路径 --*/
    const upload = await getUploadById(id);
    if (!upload) return false;

    /*-- 删除数据库记录 --*/
    try {
        const [result] = await db.execute<ResultSetHeader>(
            'DELETE FROM zhijian_blog_uploads WHERE id = ?',
            [id],
        );

        if (result.affectedRows === 0) return false;
    } catch (err) {
        console.error('删除上传记录失败：', { id, err });
        return false;
    }

    /*-- 删除物理文件 --*/
    const filePath = path.join(process.cwd(), 'public', upload.path);
    try {
        fs.unlinkSync(filePath);
    } catch (err) {
        /*-- 文件删除失败不影响结果，只记录日志 --*/
        console.warn('删除上传文件失败（记录已删除）：', { path: upload.path, err });
    }

    return true;
}

/*== 内部工具 ==*/

/*== 数据库行 → Upload 对象。 ==*/
function toUpload(row: UploadRow): Upload {
    return {
        id: row.id,
        filename: row.filename,
        original: row.original,
        path: row.path,
        size: row.size,
        mime: row.mime,
        alt: row.alt ?? '',
        createdAt: row.created_at ?? null,
    };
}
