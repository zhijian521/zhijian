/*============================================================================
  route 注释批量注入 — 给所有 33 个 API route 顶部插入标准 JSDoc

  用法（幂等，已有注释的不重复插入）：
    node scripts/inject-route-docs.mjs

  安全：每个 route 的注释内容从内联映射表取，不会误写。
  已有 JSDoc（以 /** 开头）的文件自动跳过。
============================================================================*/

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const apiDir = resolve(projectRoot, 'src/app/api');

/*== 每个 route 文件的注释内容（path → JSDoc block） ==*/
const DOCS = new Map();

// posts
DOCS.set('posts', `/**
 * @api 公开文章列表
 * @group posts
 * @auth none
 * @method GET 返回全部已发布文章
 * @returns success<Post[]> | fail
 */
`);

// admin/posts
DOCS.set('admin/posts', `/**
 * @api 文章管理（列表/创建）
 * @group admin
 * @auth admin
 * @method GET  获取全部文章（含草稿）
 * @method POST 创建草稿
 * @returns success<Post[]> | success<Post> | fail
 */
`);

DOCS.set('admin/posts/[id]', `/**
 * @api 文章编辑/删除
 * @group admin
 * @auth admin
 * @method PATCH  更新文章字段
 * @method DELETE 删除文章
 * @returns success<Post> | fail
 */
`);

DOCS.set('admin/posts/export', `/**
 * @api 文章导出
 * @group admin
 * @auth admin
 * @method GET 导出文章与引用图片为 ZIP（?id= 可选单篇）
 * @returns ZIP 文件流 | fail
 */
`);

DOCS.set('admin/categories', `/**
 * @api 分类管理（列表/创建）
 * @group admin
 * @auth admin
 * @method GET  分类列表
 * @method POST 创建分类
 * @returns success<Category[]> | success<Category> | fail
 */
`);

DOCS.set('admin/categories/[id]', `/**
 * @api 分类编辑/删除
 * @group admin
 * @auth admin
 * @method PUT    更新分类
 * @method DELETE 删除分类
 * @returns success<Category> | fail
 */
`);

DOCS.set('admin/tags', `/**
 * @api 标签管理（列表/创建）
 * @group admin
 * @auth admin
 * @method GET  标签列表
 * @method POST 创建标签
 * @returns success<Tag[]> | success<Tag> | fail
 */
`);

DOCS.set('admin/tags/[id]', `/**
 * @api 标签编辑/删除
 * @group admin
 * @auth admin
 * @method PUT    更新标签
 * @method DELETE 删除标签
 * @returns success<Tag> | fail
 */
`);

DOCS.set('admin/upload', `/**
 * @api 图片上传
 * @group admin
 * @auth admin
 * @method POST 上传图片（multipart/form-data）
 * @returns success<Upload> | fail
 */
`);

DOCS.set('admin/uploads', `/**
 * @api 图片列表
 * @group admin
 * @auth admin
 * @method GET 图片列表（分页）
 * @returns success<ListData<Upload>> | fail
 */
`);

DOCS.set('admin/uploads/[id]', `/**
 * @api 图片编辑/删除
 * @group admin
 * @auth admin
 * @method PATCH  更新图片信息
 * @method DELETE 删除图片
 * @returns success<Upload> | fail
 */
`);

DOCS.set('admin/uploads/sync', `/**
 * @api 图片同步检查
 * @group admin
 * @auth admin
 * @method GET 对比远程与本地图片差异
 * @returns success<{ missing: string[] }> | fail
 */
`);

DOCS.set('admin/users', `/**
 * @api 用户管理（列表/创建）
 * @group admin
 * @auth admin
 * @method GET  用户列表（分页+搜索）
 * @method POST 创建用户
 * @returns success<ListData<User>> | success<User> | fail
 */
`);

DOCS.set('admin/users/[id]', `/**
 * @api 用户编辑/删除
 * @group admin
 * @auth admin
 * @method GET    获取用户详情
 * @method PUT    更新用户信息
 * @method DELETE 删除用户
 * @returns success<User> | fail
 */
`);

DOCS.set('admin/analytics/overview', `/**
 * @api 统计概览
 * @group admin
 * @auth admin
 * @method GET 综合统计数据（趋势/排名/来源/设备/语言/地域等）
 * @returns success<OverviewData> | fail
 */
`);

DOCS.set('admin/analytics/data', `/**
 * @api 统计原始数据
 * @group admin
 * @auth admin
 * @method DELETE 清除指定站点统计数据
 * @returns success | fail
 */
`);

DOCS.set('admin/analytics/sites', `/**
 * @api 统计站点管理
 * @group admin
 * @auth admin
 * @method GET    站点列表
 * @method POST   创建站点
 * @method PUT    更新站点
 * @method DELETE 删除站点
 * @returns success<TrackSite[]> | success<TrackSite> | fail
 */
`);

DOCS.set('admin/analytics/visits', `/**
 * @api 访问明细
 * @group admin
 * @auth admin
 * @method GET 分页查询访问记录
 * @returns success<ListData<Visit>> | fail
 */
`);

DOCS.set('admin/seo/submit', `/**
 * @api SEO URL 推送
 * @group admin
 * @auth admin
 * @method POST 将已发布文章 URL 推送到搜索引擎
 * @returns success | fail
 */
`);

// nav
DOCS.set('nav/data', `/**
 * @api 导航站全量数据
 * @group nav
 * @auth user
 * @method GET 获取当前用户所有导航数据（书签/todo/笔记/聊天）
 * @returns success<NavData> | fail
 */
`);

DOCS.set('nav/sync', `/**
 * @api 导航站数据同步
 * @group nav
 * @auth user
 * @method POST 批量覆盖同步导航数据（localStorage → 服务端）
 * @returns success | fail
 */
`);

DOCS.set('nav/bookmarks', `/**
 * @api 书签保存
 * @group nav
 * @auth user
 * @method PUT 保存当前用户书签数据
 * @returns success | fail
 */
`);

DOCS.set('nav/todos', `/**
 * @api 待办保存
 * @group nav
 * @auth user
 * @method PUT 保存当前用户待办数据
 * @returns success | fail
 */
`);

DOCS.set('nav/notes', `/**
 * @api 笔记保存
 * @group nav
 * @auth user
 * @method PUT 保存当前用户笔记数据
 * @returns success | fail
 */
`);

DOCS.set('nav/chat', `/**
 * @api 聊天记录
 * @group nav
 * @auth user
 * @method GET 获取聊天历史
 * @method PUT 保存聊天记录
 * @returns success<ChatData> | fail
 */
`);

// auth
DOCS.set('auth/login', `/**
 * @api 用户登录
 * @group auth
 * @auth none
 * @method POST 用户名/密码登录，成功返回 session cookie
 * @returns success<{ userId }> | fail
 */
`);

DOCS.set('auth/logout', `/**
 * @api 用户登出
 * @group auth
 * @auth none
 * @method POST 清除 session cookie
 * @returns success
 */
`);

DOCS.set('auth/me', `/**
 * @api 当前用户信息
 * @group auth
 * @auth none
 * @method GET 从 cookie 解析当前登录用户信息
 * @returns success<User> | fail
 */
`);

DOCS.set('auth/register', `/**
 * @api 用户注册
 * @group auth
 * @auth none
 * @method POST 注册新用户（默认 user 角色）
 * @returns success<{ userId }> | fail
 */
`);

// ai
DOCS.set('ai/chat', `/**
 * @api AI 对话
 * @group ai
 * @auth user
 * @method POST 发送消息到 AI，流式返回（SSE）
 * @returns SSE 流 | fail
 */
`);

DOCS.set('ai/models', `/**
 * @api AI 模型列表
 * @group ai
 * @auth user
 * @method GET 返回可用 AI 模型配置
 * @returns success<ModelConfig[]> | fail
 */
`);

// collect
DOCS.set('collect', `/**
 * @api 统计数据采集
 * @group collect
 * @auth none
 * @method POST 接收前端埋点数据（PV/UV/事件等）
 * @returns success | fail
 */
`);

// favicon
DOCS.set('favicon', `/**
 * @api Favicon 代理
 * @group util
 * @auth none
 * @method GET 自建 favicon 获取服务，代理抓取站点图标
 * @returns 图片二进制 | 302 重定向
 */
`);

/*== 递归收集所有 route.ts ==*/
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

/*== 主逻辑：遍历所有 route.ts，注入对应 JSDoc ==*/
const routeFiles = collectRouteFiles(apiDir);
let injected = 0;
let skipped = 0;

for (const filePath of routeFiles) {
    const relPath = filePath
        .replace(apiDir + '/', '')
        .replace(apiDir + '\\', '')
        .replace(/\\/g, '/')
        .replace('/route.ts', '');

    const doc = DOCS.get(relPath);
    if (!doc) {
        console.warn(`  ⚠ 未找到注释映射：${relPath}`);
        continue;
    }

    const content = readFileSync(filePath, 'utf8');

    // 直接在文件开头插入 JSDoc（已有注释则跳过，幂等）
    if (/^\s*\/\*\*/.test(content)) {
        skipped++;
        continue;
    }

    writeFileSync(filePath, doc + '\n' + content, 'utf8');

    injected++;
    console.log(`  ✓ ${relPath}`);
}

console.log(`\n完成：${injected} 个文件注入注释，${skipped} 个已有注释跳过`);
