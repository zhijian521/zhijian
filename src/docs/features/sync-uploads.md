# 图片同步

将服务器上的图片文件增量同步到本地 `public/uploads/` 目录，用于开发环境预览。

## 使用方法

在项目根目录运行：

```bash
node scripts/sync-uploads.mjs
```

脚本会交互式提示输入用户名和密码，登录后自动获取服务器图片清单并下载到本地。

### 命令行参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--server <url>` | 服务器地址 | `NEXT_PUBLIC_SITE_URL` 环境变量，或 `https://yuwb.dev` |
| `--username <name>` | 登录用户名（跳过交互输入） | 交互式提示 |
| `--password <pass>` | 登录密码（跳过交互输入） | 交互式提示 |

### 示例

```bash
# 基本用法
node scripts/sync-uploads.mjs

# 指定服务器
node scripts/sync-uploads.mjs --server https://yuwb.dev

# 完整参数（CI 场景）
node scripts/sync-uploads.mjs --server https://yuwb.dev --username admin --password xxx
```

## 同步规则

- **增量同步**：本地已存在且大小一致的文件自动跳过
- **更新覆盖**：本地存在但大小不一致的文件会被重新下载
- **幂等安全**：重复运行不会重复下载已存在的文件
- 并发下载 3 个文件

## 运行示例

```
$ node scripts/sync-uploads.mjs

知简图片同步工具
服务器: https://yuwb.dev

? 用户名: admin
? 密码: ********

登录成功，获取文件清单...
服务器共 42 张图片

✓ /uploads/2026/05/a1b2c3d4.jpg (189 KB)
· /uploads/2026/06/8e448d8c.png (已存在)
✓ /uploads/2026/06/f5e6d7a8.webp (245 KB)

同步完成：新增 38 张，更新 0 张，跳过 4 张，失败 0 张
```

## 管理台入口

在后台「图片管理」页面（`/admin/uploads`）点击「同步到本地」按钮，弹窗会展示运行命令，可直接复制。

## 涉及文件

| 文件 | 说明 |
|------|------|
| `scripts/sync-uploads.mjs` | 同步脚本 |
| `src/app/api/admin/uploads/sync/route.ts` | 文件清单 API |
| `src/app/admin/uploads/_components/upload-management.tsx` | 管理页同步按钮 |
