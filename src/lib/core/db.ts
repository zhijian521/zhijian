import mysql from 'mysql2/promise';

/*== 模块级连接池单例，整个进程生命周期内复用同一连接。 ==*/
let pool: mysql.Pool | null = null;

/*== 获取 MySQL 连接池。 未配置数据库时返回 null，让上层自行决定是否走示例数据回退。 ==*/
export function getDb() {
    if (!process.env.DATABASE_URL) {
        return null;
    }

    if (!pool) {
        /*== 整个进程复用同一个连接池，避免每次请求都重复建立连接。
            timezone: 设置客户端时区，影响 DATE/DATETIME 列的 JS 解析
            charset: utf8mb4 确保中文正常
            每个新连接执行 SET time_zone，确保服务端 NOW()/DATE() 返回东八区时间 ==*/
        pool = mysql.createPool({
            uri: process.env.DATABASE_URL,
            connectionLimit: 3,
            connectTimeout: 2000,
            waitForConnections: true,
            queueLimit: 0,
            timezone: '+08:00',
            charset: 'utf8mb4_unicode_ci',
        });
    }

    return pool;
}

/*== 获取已设置时区的连接（用于需要 NOW()/DATE() 返回东八区时间的场景） ==*/
export async function getDbConnection(): Promise<mysql.PoolConnection> {
    const p = getDb();
    if (!p) throw new Error('数据库未配置');
    const conn = await p.getConnection();
    await conn.execute("SET time_zone = '+08:00'");
    return conn;
}
