/*============================================================================
  docs-check — Markdown 文档与 API Route 一致性校验

  1. 核心项目文档必须存在
  2. Markdown 相对链接必须指向真实文件
  3. 接口 Markdown 与 src/app/api/** /route.ts 的路径和 HTTP 方法双向一致

  用法：npm run docs:check
============================================================================*/

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');
const docsDir = resolve(projectRoot, 'docs');
const apiDir = resolve(projectRoot, 'src/app/api');
const apiDocsDir = resolve(docsDir, '02-技术文档/03-接口文档');
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const requiredFiles = [
    'README.md',
    'AGENTS.md',
    'docs/00-文档导航.md',
    'docs/01-产品文档/01-需求文档.md',
    'docs/01-产品文档/02-功能文档.md',
    'docs/02-技术文档/01-架构设计文档.md',
    'docs/02-技术文档/03-接口文档/00-接口导航.md',
    'docs/03-开发规范/00-规范导航.md',
    'docs/03-开发规范/08-文档与校验.md',
];

let errors = 0;

function fail(message) {
    console.error(`  ✗ ${message}`);
    errors++;
}

/*== 递归收集目录下所有满足条件的文件。 ==*/
function collectFiles(dir, filter) {
    const result = [];

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...collectFiles(fullPath, filter));
        } else if (filter(entry.name)) {
            result.push(fullPath);
        }
    }

    return result;
}

function toProjectPath(file) {
    return relative(projectRoot, file).replaceAll('\\', '/');
}

function parseDocumentedMethods(content, apiPath) {
    const methods = new Set();
    const methodHeadingPattern = new RegExp(`^###\\s+(${HTTP_METHODS.join('|')})(?:\\s+·|\\s*$)`, 'gm');

    for (const match of content.matchAll(methodHeadingPattern)) {
        const method = match[1];
        if (methods.has(method)) {
            fail(`接口文档方法重复登记：/api/${apiPath} ${method}`);
            continue;
        }
        methods.add(method);
    }

    return methods;
}

function parseRouteMethods(content) {
    const methods = new Set();
    const routeExportPattern = new RegExp(
        `export\\s+(?:(?:const|let|var)\\s+|(?:async\\s+)?function\\s+)(${HTTP_METHODS.join('|')})\\b`,
        'g'
    );

    for (const match of content.matchAll(routeExportPattern)) {
        methods.add(match[1]);
    }

    return methods;
}

/*== 从 Markdown 链接中提取不含锚点的本地相对路径。 ==*/
function parseLocalLink(target) {
    const normalized = target.trim().replace(/^<|>$/g, '');
    if (!normalized || normalized.startsWith('#') || normalized.startsWith('/')) return null;
    if (/^[a-z][a-z\d+.-]*:/i.test(normalized)) return null;

    const [pathname] = normalized.split('#');
    if (!pathname) return null;

    try {
        return decodeURIComponent(pathname);
    } catch {
        return pathname;
    }
}

/*============================================================================
  核心文档
============================================================================*/

console.log('检查核心项目文档...');
for (const file of requiredFiles) {
    if (!existsSync(resolve(projectRoot, file))) {
        fail(`核心文档不存在：${file}`);
    }
}

/*============================================================================
  Markdown 相对链接
============================================================================*/

console.log('检查 Markdown 相对链接...');
const markdownFiles = [resolve(projectRoot, 'README.md'), resolve(projectRoot, 'AGENTS.md')];
if (existsSync(docsDir)) {
    markdownFiles.push(...collectFiles(docsDir, (name) => name.endsWith('.md')));
}

const markdownLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
for (const file of markdownFiles) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(markdownLinkPattern)) {
        const target = parseLocalLink(match[1]);
        if (!target) continue;

        const resolvedTarget = resolve(dirname(file), target);
        if (!existsSync(resolvedTarget)) {
            fail(`${toProjectPath(file)} 链接不存在：${match[1]}`);
        }
    }
}

/*============================================================================
  API Route 与接口 Markdown
============================================================================*/

console.log('检查 API Route 与接口 Markdown...');
const documentedRoutes = new Map();
const apiHeadingPattern = /^## \/api\/(.+?)(?:\s+·|\s*$)/gm;

if (!existsSync(apiDocsDir)) {
    fail('接口文档目录不存在：docs/02-技术文档/03-接口文档');
} else {
    const apiDocFiles = collectFiles(apiDocsDir, (name) => name.endsWith('.md'));
    for (const file of apiDocFiles) {
        const content = readFileSync(file, 'utf8');
        const apiHeadings = [...content.matchAll(apiHeadingPattern)];

        for (const [index, match] of apiHeadings.entries()) {
            const apiPath = match[1].trim();
            if (documentedRoutes.has(apiPath)) {
                fail(`接口文档重复登记：/api/${apiPath}`);
                continue;
            }

            const nextHeading = apiHeadings[index + 1];
            const block = content.slice(match.index, nextHeading?.index ?? content.length);
            documentedRoutes.set(apiPath, parseDocumentedMethods(block, apiPath));

            if (!existsSync(join(apiDir, apiPath, 'route.ts'))) {
                fail(`接口文档对应的 Route Handler 不存在：/api/${apiPath}`);
            }
        }
    }
}

const routeFiles = collectFiles(apiDir, (name) => name === 'route.ts');
for (const routeFile of routeFiles) {
    const apiPath = relative(apiDir, routeFile).replaceAll('\\', '/').replace(/\/route\.ts$/, '');
    const documentedMethods = documentedRoutes.get(apiPath);
    if (!documentedMethods) {
        fail(`API Route 未登记到 Markdown：/api/${apiPath}`);
        continue;
    }

    const routeMethods = parseRouteMethods(readFileSync(routeFile, 'utf8'));
    for (const method of routeMethods) {
        if (!documentedMethods.has(method)) {
            fail(`接口文档缺少方法：/api/${apiPath} ${method}`);
        }
    }
    for (const method of documentedMethods) {
        if (!routeMethods.has(method)) {
            fail(`接口文档登记了不存在的方法：/api/${apiPath} ${method}`);
        }
    }
}

/*============================================================================
  输出结果
============================================================================*/

if (errors > 0) {
    console.error(`\n✗ docs:check failed（${errors} 个问题）`);
    process.exit(1);
}

console.log(`\n✓ docs:check passed（${markdownFiles.length} 篇 Markdown，${documentedRoutes.size} 个接口）`);
