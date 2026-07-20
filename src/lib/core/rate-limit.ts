/*============================================================================
  通用频率限制（令牌桶）

  进程内内存实现，供 /api/auth/login、/api/auth/register 等公开接口防爆破复用：
  - checkRateLimit(key, limit, windowMs)：每个 key 在 windowMs 内最多放行 limit 次
  - 惰性注册清理 interval，避免 Next.js 热重载时重复注册
============================================================================*/

const buckets = new Map<string, { tokens: number; lastRefill: number }>();
let cleanupRegistered = false;

/*== 检查并消耗一次配额；true = 放行，false = 超限。 ==*/
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    /*-- 惰性注册清理 interval，避免热重载重复注册 --*/
    if (!cleanupRegistered) {
        cleanupRegistered = true;
        setInterval(() => {
            const cutoff = Date.now() - 60000;
            for (const [bucketKey, bucket] of buckets) {
                if (bucket.lastRefill < cutoff) buckets.delete(bucketKey);
            }
        }, 300000);
    }

    let bucket = buckets.get(key);
    const now = Date.now();

    if (!bucket) {
        bucket = { tokens: limit - 1, lastRefill: now };
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
