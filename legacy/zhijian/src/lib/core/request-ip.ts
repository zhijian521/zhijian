/*============================================================================
  request-ip — 客户端 IP 提取（限流 / 统计共用）

  部署假设：Nginx 单跳反代 + next start（见 docs/02-技术文档/07-部署指南.md）。
  Nginx 通过 proxy_set_header X-Real-IP $remote_addr 覆写受控头，
  并以 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for 把真实 IP 追加到链尾。

  信任策略（防 XFF 伪造）：
  - 优先 x-real-ip：由我们的 Nginx 覆写，客户端请求自带的同名头不会透传，无法伪造
  - 否则取 x-forwarded-for 链【最右侧】非空值：单跳可信反代追加的就是链尾；
    链首由客户端原始请求携带，可任意伪造，绝不可取
  - 两者皆无 → 返回 'unknown'，由调用方决定降级策略（如登录仅按用户名限流）

  注意：部署形态变为多跳反代或客户端直连时，需重新评估本文件的取值策略。
============================================================================*/

/*== IPv4 校验：点分十进制，每段 0-255。IPv6 映射尾段复用此逻辑。 ==*/
function isValidIpv4(value: string): boolean {
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return false;
    return value.split('.').every((octet) => Number(octet) <= 255);
}

/*== IPv6 校验（手写判断而非 node:net.isIP，保持运行时无关，core 可被任意层复用）：
  - 仅十六进制 / 冒号 / 点字符（天然拒绝 zone id 的 %），含至少一个冒号，最长 45 字符
  - 组数 ≤8（无压缩时恰好 8 组），单组 1-4 位十六进制
  - :: 压缩至多出现一次，且至少压缩 2 组（不用于单组压缩，如 1:2:3:4:5:6:7::8 拒绝）
  - ::ffff: 映射的 IPv4 尾段只允许出现在末尾，且复用 isValidIpv4 校验
==*/
function isValidIpv6(value: string): boolean {
    if (!value.includes(':') || value.length > 45) return false;
    if (!/^[0-9a-fA-F:.]+$/.test(value)) return false;

    /*-- :: 压缩至多一次；出现两次及以上（split 出 3 段）即拒绝 --*/
    const parts = value.split('::');
    if (parts.length > 2) return false;
    const hasCompression = parts.length === 2;

    /*-- 收集左右两侧的显式组；空串侧无组。组内空段（如 :::、首尾单冒号）将在下方 hex 校验被拒 --*/
    const groups: string[] = [];
    for (const side of parts) {
        if (side) groups.push(...side.split(':'));
    }

    let groupCount = groups.length;
    const last = groups[groups.length - 1];
    if (last && last.includes('.')) {
        /*-- IPv4 映射尾段：仅允许在最右侧，按 2 个 16 位组计入 --*/
        if (!isValidIpv4(last)) return false;
        groupCount += 1;
    }

    const hexOk = groups.every((group, index) => {
        if (group.includes('.')) return index === groups.length - 1;
        return /^[0-9a-fA-F]{1,4}$/.test(group);
    });
    if (!hexOk) return false;

    return hasCompression ? groupCount <= 6 : groupCount === 8;
}

/*== 基本 IP 格式校验：IPv4 或 IPv6，二者均拒绝即视为不可信值。 ==*/
function isValidIp(value: string): boolean {
    return isValidIpv4(value) || isValidIpv6(value);
}

/*== 提取客户端 IP：x-real-ip 优先，其次 XFF 链最右侧非空值，均无返回 'unknown'。 ==*/
export function getClientIp(request: Request): string {
    const realIp = request.headers.get('x-real-ip')?.trim();
    if (realIp && isValidIp(realIp)) return realIp;

    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        /*-- 从右往左取第一个非空且合法的值：链尾是可信反代追加的，左侧均可被客户端伪造 --*/
        const chain = forwarded.split(',');
        for (let i = chain.length - 1; i >= 0; i--) {
            const candidate = chain[i].trim();
            if (candidate && isValidIp(candidate)) return candidate;
        }
    }

    return 'unknown';
}
