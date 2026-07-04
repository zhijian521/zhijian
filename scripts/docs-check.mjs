/*============================================================================
  docs-check — 文档与 registry 一致性校验

  校验 src/docs/features/_registry.ts 与磁盘 md 双向一致：
  1. DOC_REGISTRY 登记的每篇 md 文件必须存在
  2. 磁盘上的 src/docs/features/*.md 必须都已登记（防漏登）

  接口文档校验（specs/07 第 3-5 条）预留分支：
  - 检测到 src/app/api 下任意 route.ts 存在时，若 src/docs/api/_registry.ts
    不存在则当前仅 warn（第二阶段接入 API_REGISTRY 后改为 fail）。

  用法：npm run docs:check
============================================================================*/

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const featuresDir = resolve(projectRoot, 'src/docs/features');
const registryFile = join(featuresDir, '_registry.ts');

let errors = 0;
const warnings = [];

function fail(msg) {
    console.error(`  ✗ ${msg}`);
    errors++;
}

/*== 解析 _registry.ts，提取所有 file: 'xxx.md' 值 ==*/
function parseRegistryFiles(content) {
    const files = [];
    const re = /file:\s*['"]([^'"]+\.md)['"]/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        files.push(m[1]);
    }
    return files;
}

/*== 1. registry 必须存在 ==*/
if (!existsSync(registryFile)) {
    console.error('✗ docs:check failed');
    fail(`功能文档 registry 不存在：src/docs/features/_registry.ts`);
    console.error(`\n  按规范，src/docs/features/ 下只要有 md，就必须有 _registry.ts 登记。`);
    process.exit(1);
}

const registryContent = readFileSync(registryFile, 'utf8');
const registeredFiles = parseRegistryFiles(registryContent);

/*== 2. 登记项的文件必须存在 ==*/
console.log('检查功能文档登记项指向的文件...');
for (const file of registeredFiles) {
    const fullPath = join(featuresDir, file);
    if (!existsSync(fullPath)) {
        fail(`registry 登记的文件不存在：${file}`);
    }
}

/*== 3. 磁盘 md 必须都已登记（双向防漏）==*/
console.log('检查磁盘 md 是否都已登记...');
const diskFiles = readdirSync(featuresDir).filter((f) => f.endsWith('.md'));
const registeredSet = new Set(registeredFiles);
for (const file of diskFiles) {
    if (!registeredSet.has(file)) {
        fail(`磁盘文档未登记到 registry：src/docs/features/${file}`);
    }
}

/*== 递归收集 api 目录下所有 route.ts ==*/
function collectRouteFiles(dir) {
    const result = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...collectRouteFiles(full));
        } else if (entry.name === 'route.ts') {
            result.push(full);
        }
    }
    return result;
}

/*== 4. 接口文档预留校验（第二阶段启用） ==*/
const apiDir = resolve(projectRoot, 'src/app/api');
const apiRegistry = resolve(projectRoot, 'src/docs/api/_registry.ts');
if (existsSync(apiDir)) {
    const hasRoute = collectRouteFiles(apiDir).length > 0;
    if (hasRoute && !existsSync(apiRegistry)) {
        warnings.push(
            '检测到 API route 但 src/docs/api/_registry.ts 不存在（接口文档校验将在第二阶段启用，当前仅提醒）',
        );
    }
}

/*== 输出结果 ==*/
for (const w of warnings) {
    console.warn(`  ⚠ ${w}`);
}

if (errors > 0) {
    console.error(`\n✗ docs:check failed（${errors} 个问题）`);
    process.exit(1);
}

console.log(`\n✓ docs:check passed（${registeredFiles.length} 篇功能文档）`);
