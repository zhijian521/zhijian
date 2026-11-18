/*============================================================================
  通用频率限制（令牌桶）

  进程内内存实现，供 /api/auth/login、/api/auth/register、/api/collect 等公开接口防爆破复用：
  - checkRateLimit(key, limit, windowMs)：每个 key 在 windowMs 内最多放行 limit 次
  - 惰性注册清理 interval，避免 Next.js 热重载时重复注册
  - bucket 记录自己的 windowMs，过期判定与窗口参数解耦（不假设固定 60s）
  - 条目数上限保护，防止伪造 key 撑爆内存
============================================================================*/

interface Bucket {
    tokens: number;
    lastRefill: number;
    windowMs: number; // 该 bucket 自己的窗口，过期判定据此计算
}

const buckets = new Map<string, Bucket>();
let cleanupRegistered = false;

/*== 条目上限与清理宽限 ==*/
// MAX_BUCKETS：防御伪造 key 洪峰撑爆内存。达到上限时先清理过期项，仍满则拒绝新键（按超限处理）。
// 选择「拒绝」而非「放行」：伪造 key 场景下放行等于彻底放弃限流，攻击者恰好可以借此绕过；
// 拒绝只会让洪峰期间的新 key 被误判超限，限流语义不丢，代价可接受。
const MAX_BUCKETS = 10000;
// 宽限：bucket 在一个窗口后即恢复满令牌，再留一段宽限避免边界抖动误删活跃 bucket。
// 宽限取 max(60s, windowMs)，保证大窗口调用方有足够的余量。
const CLEANUP_GRACE_MS = 60000;

function isExpired(bucket: Bucket, now: number): boolean {
    return now > bucket.lastRefill + bucket.windowMs + Math.max(CLEANUP_GRACE_MS, bucket.windowMs);
}

function cleanupExpired(now: number): void {
    for (const [bucketKey, bucket] of buckets) {
        if (isExpired(bucket, now)) buckets.delete(bucketKey);
    }
}

/*== 检查并消耗一次配额；true = 放行，false = 超限。 ==*/
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    /*-- 惰性注册清理 interval，避免热重载重复注册 --*/
    if (!cleanupRegistered) {
        cleanupRegistered = true;
        setInterval(() => cleanupExpired(Date.now()), 300000);
    }

    let bucket = buckets.get(key);
    const now = Date.now();

    if (!bucket) {
        /*-- 上限保护：先清理过期项，仍满则拒绝新键，防止伪造 key 撑爆内存 --*/
        if (buckets.size >= MAX_BUCKETS) {
            cleanupExpired(now);
            if (buckets.size >= MAX_BUCKETS) return false;
        }
        bucket = { tokens: limit - 1, lastRefill: now, windowMs };
        buckets.set(key, bucket);
        return true;
    }

    const elapsed = now - bucket.lastRefill;
    if (elapsed >= windowMs) {
        bucket.tokens = Math.min(limit, bucket.tokens + Math.floor(elapsed / windowMs) * limit);
        bucket.lastRefill = now;
    }

    if (bucket.tokens <= 0) return false;
    bucket.tokens--;
    return true;
}
