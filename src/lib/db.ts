import mysql from 'mysql2/promise';

/*== 模块级连接池单例，整个进程生命周期内复用同一连接。 ==*/
let pool: mysql.Pool | null = null;

/*== 获取 MySQL 连接池。 未配置数据库时返回 null，让上层自行决定是否走示例数据回退。 ==*/
export function getDb() {
    if (!process.env.DATABASE_URL) {
        return null;
    }

    if (!pool) {
        /*== 整个进程复用同一个连接池，避免每次请求都重复建立连接。 ==*/
        pool = mysql.createPool({
            uri: process.env.DATABASE_URL,
            connectionLimit: 3,
            connectTimeout: 2000,
            waitForConnections: true,
            queueLimit: 0,
        });
    }

    return pool;
}
