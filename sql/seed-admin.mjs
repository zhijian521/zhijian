/*==
  种子管理员脚本。
  首次部署时运行，用环境变量 ADMIN_USERNAME/ADMIN_PASSWORD 创建首个 admin。
  已存在管理员时跳过，不会覆盖。
  自动加载项目根目录的 .env.local 和 .env。
==*/

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// 手动加载 .env 文件（避免引入 dotenv 依赖）
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

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
        // 文件不存在则跳过
    }
}

async function seed() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ 未设置 DATABASE_URL 环境变量。');
        process.exit(1);
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-password';

    const pool = createPool({ uri: dbUrl, connectionLimit: 1 });

    try {
        // 1. 确保 zhijian_users 表存在
        console.log('📋 检查 zhijian_users 表...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS zhijian_users (
                id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                username      VARCHAR(50)     NOT NULL,
                email         VARCHAR(255)    NOT NULL,
                password_hash VARCHAR(255)    NOT NULL,
                role          ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                status        ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
                created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uniq_zhijian_users_username (username),
                UNIQUE KEY uniq_zhijian_users_email (email),
                KEY idx_zhijian_users_role (role),
                KEY idx_zhijian_users_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ zhijian_users 表就绪。');

        // 2. 检查是否已有管理员
        const [rows] = await pool.execute(
            'SELECT COUNT(*) AS cnt FROM zhijian_users WHERE role = ?',
            ['admin']
        );
        if (rows[0].cnt > 0) {
            console.log('ℹ️  已存在管理员账号，跳过种子。');
            return;
        }

        // 3. 创建种子管理员
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        await pool.execute(
            'INSERT INTO zhijian_users (username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
            [adminUsername, `${adminUsername}@zhijian.local`, passwordHash, 'admin', 'active']
        );
        console.log(`✅ 种子管理员创建成功：${adminUsername}`);
    } finally {
        await pool.end();
    }
}

seed().catch((err) => {
    console.error('❌ 种子失败：', err);
    process.exit(1);
});
