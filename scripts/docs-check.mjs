/*============================================================================
  docs-check — 文档与 registry 一致性校验

  功能文档：
  1. DOC_REGISTRY 登记的每篇 md 文件必须存在
  2. 磁盘上的 src/docs/features/*.md 必须都已登记（防漏登）

  接口文档：
  3. API_REGISTRY 登记的每个路径的 route.ts 必须存在
  4. 磁盘上的每个 src/app/api/** /route.ts 必须都已登记（防漏登）

  用法：npm run docs:check
============================================================================*/

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const featuresDir = resolve(projectRoot, 'src/docs/features');
const featuresRegistryFile = join(featuresDir, '_registry.ts');
const apiDir = resolve(projectRoot, 'src/app/api');
const apiRegistryFile = resolve(projectRoot, 'src/docs/api/_registry.ts');

let errors = 0;
const warnings = [];

function fail(msg) {
    console.error(`  ✗ ${msg}`);
    errors++;
}

/*== 递归收集目录下所有满足 filter 的文件 ==*/
function collectFiles(dir, filter) {
    const result = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...collectFiles(full, filter));
        } else if (filter(entry.name)) {
            result.push(full);
        }
    }
    return result;
}

// =====================================
// 功能文档校验
// =====================================

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

if (!existsSync(featuresRegistryFile)) {
    console.error('✗ docs:check failed');
    fail('功能文档 registry 不存在：src/docs/features/_registry.ts');
    console.error('\n  按规范，src/docs/features/ 下只要有 md，就必须有 _registry.ts 登记。');
    process.exit(1);
}

const featuresContent = readFileSync(featuresRegistryFile, 'utf8');
const registeredFiles = parseRegistryFiles(featuresContent);

console.log('检查功能文档登记项指向的文件...');
for (const file of registeredFiles) {
    if (!existsSync(join(featuresDir, file))) {
        fail(`registry 登记的文件不存在：${file}`);
    }
}

console.log('检查磁盘 md 是否都已登记...');
const diskMdFiles = readdirSync(featuresDir).filter((f) => f.endsWith('.md'));
const registeredFileSet = new Set(registeredFiles);
for (const file of diskMdFiles) {
    if (!registeredFileSet.has(file)) {
        fail(`磁盘文档未登记到 registry：src/docs/features/${file}`);
    }
}

// =====================================
// 接口文档校验
// =====================================

/*== 解析 _registry.ts，提取所有 path: 'xxx' 值 ==*/
function parseRegistryPaths(content) {
    const paths = [];
    const re = /path:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        paths.push(m[1]);
    }
    return paths;
}

if (existsSync(apiRegistryFile)) {
    const apiContent = readFileSync(apiRegistryFile, 'utf8');
    const registeredPaths = parseRegistryPaths(apiContent);
    const registeredPathSet = new Set(registeredPaths);

    // 3. 登记路径的 route.ts 必须存在
    console.log('检查接口登记项对应的 route 文件...');
    for (const p of registeredPaths) {
        const routePath = join(apiDir, p, 'route.ts');
        if (!existsSync(routePath)) {
            fail(`API registry 登记的路径不存在：${p}/route.ts`);
        }
    }

    // 4. 磁盘 route.ts 必须都已登记
    console.log('检查磁盘 route.ts 是否都已登记...');
    const diskRoutes = collectFiles(apiDir, (name) => name === 'route.ts');
    for (const route of diskRoutes) {
        const relPath = relative(apiDir, route).replace(/\\/g, '/').replace('/route.ts', '');
        if (!registeredPathSet.has(relPath)) {
            fail(`API route 未登记到 registry：src/app/api/${relPath}/route.ts`);
        }
    }
} else {
    const hasRoute = collectFiles(apiDir, (name) => name === 'route.ts').length > 0;
    if (hasRoute) {
        fail('检测到 API route 但 src/docs/api/_registry.ts 不存在（按 specs/07，有 route 必须有 registry）');
    }
}

// =====================================
// 输出结果
// =====================================

for (const w of warnings) {
    console.warn(`  ⚠ ${w}`);
}

if (errors > 0) {
    console.error(`\n✗ docs:check failed（${errors} 个问题）`);
    process.exit(1);
}

const featureCount = registeredFiles.length;
const apiCount = existsSync(apiRegistryFile) ? parseRegistryPaths(readFileSync(apiRegistryFile, 'utf8')).length : 0;
const summary = [`${featureCount} 篇功能文档`];
if (apiCount > 0) summary.push(`${apiCount} 个接口`);
console.log(`\n✓ docs:check passed（${summary.join('，')}）`);
