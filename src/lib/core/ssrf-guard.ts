/*============================================================================
  SSRF 防护 — 服务端出站请求的公网地址校验

  为服务端代理类接口（当前为 /api/favicon）提供统一的 SSRF 防线：
  1. isPublicIp：纯函数，判定单个 IP 是否为公网地址
  2. fetchWithSsrfGuard：fetch 包装，校验通过后才放行请求
     - 仅允许 https 协议
     - 主机名为 IP 字面量时直接判定；为域名时解析 DNS，
       全部解析结果都必须是公网地址（防「合法域名 A 记录指向内网」）
     - 手动跟随重定向，每一跳重新走完整校验（防 302 跳转内网）

  残余风险：DNS 校验与 fetch 实际连接各自独立解析，校验与建连之间存在
  rebinding 时间窗（攻击者可在校验后把 A 记录改回内网地址）。彻底消除需要
  固定解析结果建连，本项目为个人站点，威胁模型可接受，暂不做。
============================================================================*/

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/*== 解析点分十进制 IPv4 为 4 个字节；无法解析返回 null。 ==*/
function parseIpv4(ip: string): number[] | null {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;
    const octets: number[] = [];
    for (const part of parts) {
        if (!/^\d{1,3}$/.test(part)) return null;
        const value = Number(part);
        if (value > 255) return null;
        octets.push(value);
    }
    return octets;
}

/*== 解析 IPv6 为 8 个 16 位组（支持 :: 压缩与内嵌 IPv4 尾部）；无法解析返回 null。 ==*/
function parseIpv6(ip: string): number[] | null {
    let input = ip.toLowerCase();
    /* 内嵌 IPv4 尾部（如 ::ffff:1.2.3.4）：折算成两个 16 位组后按纯十六进制解析 */
    if (input.includes('.')) {
        const lastColon = input.lastIndexOf(':');
        if (lastColon === -1) return null;
        const v4 = parseIpv4(input.slice(lastColon + 1));
        if (!v4) return null;
        const hi = ((v4[0] << 8) | v4[1]).toString(16);
        const lo = ((v4[2] << 8) | v4[3]).toString(16);
        input = `${input.slice(0, lastColon)}:${hi}:${lo}`;
    }
    const halves = input.split('::');
    if (halves.length > 2) return null;
    const head = halves[0] ? halves[0].split(':') : [];
    const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
    if (halves.length === 1 && head.length !== 8) return null;
    const missing = 8 - head.length - tail.length;
    if (missing < 0 || (halves.length === 2 && missing < 1)) return null;
    const groups: number[] = [];
    for (const part of [...head, ...Array(missing).fill('0'), ...tail]) {
        if (!/^[0-9a-f]{1,4}$/.test(part)) return null;
        groups.push(parseInt(part, 16));
    }
    return groups;
}

/*== 判定 IPv4 字节组是否为公网地址。 ==*/
function isPublicIpv4(octets: number[]): boolean {
    const [a, b, c] = octets;
    if (a === 0) return false; // 0.0.0.0/8 本网络
    if (a === 10) return false; // 10.0.0.0/8 私网
    if (a === 100 && b >= 64 && b <= 127) return false; // 100.64.0.0/10 运营商级 NAT
    if (a === 127) return false; // 127.0.0.0/8 回环
    if (a === 169 && b === 254) return false; // 169.254.0.0/16 链路本地（含云元数据 169.254.169.254）
    if (a === 172 && b >= 16 && b <= 31) return false; // 172.16.0.0/12 私网
    if (a === 192 && b === 0 && c === 0) return false; // 192.0.0.0/24 IETF 协议保留
    if (a === 192 && b === 168) return false; // 192.168.0.0/16 私网
    if (a === 198 && (b === 18 || b === 19)) return false; // 198.18.0.0/15 网络基准测试
    if (a >= 224) return false; // 224.0.0.0/4 组播、240.0.0.0/4 保留、255.255.255.255 广播
    return true;
}

/*== 判定 IPv6 组数组是否为公网地址。
    NAT64 / Teredo / 6to4 等过渡机制前缀整段拒绝：它们在内嵌位中携带任意 IPv4
    （如 64:ff9b::a9fe:a9fe 映射 169.254.169.254 云元数据地址），可绕过上方
    IPv4 黑名单直达内网；favicon 代理的合法目标不会以这些字面量形式出现，保守拒绝。 ==*/
function isPublicIpv6(groups: number[]): boolean {
    if (groups.every((g) => g === 0)) return false; // :: 未指定地址
    if (groups.slice(0, 7).every((g) => g === 0) && groups[7] === 1) return false; // ::1 回环
    /* ::ffff:a.b.c.d IPv4 映射地址：取出映射地址递归按 IPv4 判定 */
    if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {
        return isPublicIpv4([
            (groups[6] >> 8) & 0xff,
            groups[6] & 0xff,
            (groups[7] >> 8) & 0xff,
            groups[7] & 0xff,
        ]);
    }
    if (groups.slice(0, 6).every((g) => g === 0)) return false; // ::/96 已废弃的 IPv4 兼容地址，保守拒绝
    if (groups[0] === 0x0064 && groups[1] === 0xff9b && groups.slice(2, 6).every((g) => g === 0)) {
        return false; // 64:ff9b::/96 NAT64 知名前缀（RFC 6052），末 32 位内嵌 IPv4
    }
    if (groups[0] === 0x0064 && groups[1] === 0xff9b && groups[2] === 0x0001) {
        return false; // 64:ff9b:1::/48 NAT64 本地前缀（RFC 8215），内嵌 IPv4
    }
    if (groups[0] === 0x2001 && groups[1] === 0x0000) return false; // 2001::/32 Teredo，内嵌 IPv4
    if (groups[0] === 0x2002) return false; // 2002::/16 6to4，内嵌 IPv4
    const byte0 = groups[0] >> 8;
    const byte1 = groups[0] & 0xff;
    if ((byte0 & 0xfe) === 0xfc) return false; // fc00::/7 唯一本地地址（fc/fd）
    if (byte0 === 0xfe && (byte1 & 0xc0) === 0x80) return false; // fe80::/10 链路本地
    return true;
}

/*== 判定 IP 字面量是否为公网地址；无法解析为 IP 的输入返回 false。 ==*/
export function isPublicIp(ip: string): boolean {
    const family = isIP(ip);
    if (family === 4) {
        const octets = parseIpv4(ip);
        return octets !== null && isPublicIpv4(octets);
    }
    if (family === 6) {
        const groups = parseIpv6(ip);
        return groups !== null && isPublicIpv6(groups);
    }
    return false;
}

/*== 带 SSRF 防护的 fetch：仅 https，DNS 解析结果必须全为公网地址，手动跟随重定向并逐跳校验。 ==*/
export async function fetchWithSsrfGuard(
    url: string,
    options?: { maxRedirects?: number; timeoutMs?: number }
): Promise<Response> {
    const maxRedirects = options?.maxRedirects ?? 3;
    const timeoutMs = options?.timeoutMs ?? 5000;

    let currentUrl = url;
    for (let hop = 0; hop <= maxRedirects; hop++) {
        const target = new URL(currentUrl);
        if (target.protocol !== 'https:') {
            throw new Error(`ssrf-guard: 仅允许 https 协议（实际为 ${target.protocol}）`);
        }

        /* WHATWG URL 已把 0x7f.1、127.1 等怪异写法归一化为标准 IP；IPv6 字面量的方括号需剥掉 */
        let hostname = target.hostname;
        if (hostname.startsWith('[') && hostname.endsWith(']')) {
            hostname = hostname.slice(1, -1);
        }

        if (isIP(hostname)) {
            if (!isPublicIp(hostname)) {
                throw new Error(`ssrf-guard: 拒绝访问非公网地址 ${hostname}`);
            }
        } else {
            let addresses: { address: string }[];
            try {
                addresses = await lookup(hostname, { all: true, verbatim: true });
            } catch {
                /* DNS 解析失败视为不可信 */
                throw new Error(`ssrf-guard: DNS 解析失败（${hostname}）`);
            }
            /* 全部解析结果都必须是公网地址，防「一个域名同时挂公网与内网 A 记录」 */
            if (addresses.length === 0 || addresses.some((item) => !isPublicIp(item.address))) {
                throw new Error(`ssrf-guard: ${hostname} 的解析结果包含非公网地址`);
            }
        }

        const response = await fetch(currentUrl, {
            redirect: 'manual',
            signal: AbortSignal.timeout(timeoutMs),
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FaviconBot/1.0)' },
        });

        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (!location) {
                throw new Error(`ssrf-guard: ${response.status} 响应缺少 Location 头`);
            }
            /* 取消未消费的 3xx 响应体，避免占用连接池 */
            if (response.body) await response.body.cancel().catch(() => undefined);
            /* Location 可能是相对路径，基于当前 URL 解析后进入下一轮校验 */
            currentUrl = new URL(location, currentUrl).toString();
            continue;
        }
        return response;
    }
    throw new Error(`ssrf-guard: 重定向次数超过上限（${maxRedirects}）`);
}
