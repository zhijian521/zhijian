/**
 * @api 文章导出
 * @group admin
 * @auth admin
 * @method GET 导出文章与引用图片为 ZIP（?id= 可选单篇）
 * @returns ZIP 文件流 | fail
 */

import fs from 'fs';
import path from 'path';

import { ZipArchive } from 'archiver';

import { withAdmin } from '@/lib/core/with-admin';
import { extractImagePaths, getAllPosts } from '@/lib/domain/posts';

/*== 文章一键导出 API — 将所有文章 + 引用图片打包为 ZIP 流式下载
    支持 ?id= 参数：指定时只导出该文章；省略时导出全部。 ==*/

export const GET = withAdmin(async (request) => {
    const allPosts = await getAllPosts();

    /*-- 支持单篇导出（?id=） --*/
    const targetId = request.nextUrl.searchParams.get('id');
    const posts = targetId ? allPosts.filter((p) => p.id === Number(targetId)) : allPosts;

    /*-- 收集图片路径映射：源路径 → ZIP 内目标路径 --*/
    const imageMap = new Map<string, string>();
    const coverMap = new Map<number, string>(); // postId → ZIP 内封面路径

    for (const post of posts) {
        /* 封面图：重命名为 cover-{postId}.{ext} 避免冲突 */
        if (post.coverImage?.startsWith('/uploads/')) {
            const ext = path.extname(post.coverImage);
            const targetName = `images/cover-${post.id}${ext}`;
            imageMap.set(post.coverImage, targetName);
            coverMap.set(post.id, targetName);
        }

        /* 正文图片：保留原文件名 */
        for (const imgPath of extractImagePaths(post.content)) {
            if (!imageMap.has(imgPath)) {
                imageMap.set(imgPath, `images/${path.basename(imgPath)}`);
            }
        }
    }

    /*-- 创建 ZIP 流 --*/
    const archive = new ZipArchive({ zlib: { level: 9 } });

    /*-- 记录缺失文件，写入 manifest --*/
    const missingFiles: string[] = [];
    const publicDir = path.join(process.cwd(), 'public');

    /*-- 为每篇文章生成 .md 文件 --*/
    const usedTitles = new Map<string, number>();

    for (const post of posts) {
        /* 替换正文中的图片路径 */
        let content = post.content;
        for (const [src, target] of imageMap) {
            content = content.replaceAll(src, target);
        }

        /* 构建 Front Matter */
        const frontMatter = [
            `title: ${escapeYaml(post.title)}`,
            `slug: ${post.slug}`,
            `status: ${post.status}`,
            post.summary ? `summary: ${escapeYaml(post.summary)}` : '',
            post.categoryName ? `category: ${escapeYaml(post.categoryName)}` : '',
            post.tagNames?.length ? `tags: [${post.tagNames.map((t) => escapeYaml(t.name)).join(', ')}]` : '',
            post.publishedAt ? `publishedAt: ${post.publishedAt}` : '',
            coverMap.has(post.id) ? `coverImage: ${coverMap.get(post.id)}` : '',
        ]
            .filter(Boolean)
            .join('\n');

        const mdContent = `---\n${frontMatter}\n---\n\n${content}\n`;

        /* 文件名：标题去非法字符，冲突追加 id */
        const rawName = (post.title || `untitled-${post.id}`).replace(/[\/\\:*?"<>|]/g, '-').trim() || `untitled-${post.id}`;

        let fileName = rawName;
        const count = usedTitles.get(rawName) ?? 0;
        if (count > 0) {
            fileName = `${rawName}-${count + 1}`;
        }
        usedTitles.set(rawName, count + 1);

        archive.append(mdContent, { name: `${fileName}.md` });
    }

    /*-- 复制图片文件到 ZIP --*/
    for (const [src, target] of imageMap) {
        const filePath = path.join(publicDir, src.replace(/^\//, ''));
        try {
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: target });
            } else {
                missingFiles.push(src);
            }
        } catch {
            missingFiles.push(src);
        }
    }

    /*-- manifest.json --*/
    const manifest = {
        exportedAt: new Date().toISOString(),
        totalPosts: posts.length,
        totalImages: imageMap.size,
        ...(missingFiles.length > 0 ? { missingFiles } : {}),
    };
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

    /*-- 完成打包 --*/
    archive.finalize();

    /*-- 桥接 archiver stream → Web ReadableStream --*/
    const readable = new ReadableStream({
        start(controller) {
            archive.on('data', (chunk: Buffer) => {
                controller.enqueue(new Uint8Array(chunk));
            });
            archive.on('end', () => {
                controller.close();
            });
            archive.on('error', (err: Error) => {
                controller.error(err);
            });
        },
    });

    const dateStr = new Date().toISOString().slice(0, 10);

    return new Response(readable, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="zhijian-export-${dateStr}.zip"`,
        },
    });
});

/*== YAML 值转义：含 : # 引号等特殊字符时用双引号包裹。 ==*/
function escapeYaml(value: string): string {
    if (/[:#"'&*!|>%@`\{\}\[\],\n]/.test(value)) {
        return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
}
