import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

/**
 * 获取 MySQL 连接池。
 * 未配置数据库时返回 null，让上层自行决定是否走示例数据回退。
 */
export function getDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    // 整个进程复用同一个连接池，避免每次请求都重复建立连接。
    pool = mysql.createPool(process.env.DATABASE_URL);
  }

  return pool;
}
