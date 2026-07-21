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

/*== 基本 IP 格式校验。手写判断而非 node:net.isIP，保持运行时无关（core 可被任意层复用）。 ==*/
function isValidIp(value: string): boolean {
    /*-- IPv4 点分十进制，每段 0-255 --*/
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
        return value.split('.').every((octet) => Number(octet) <= 255);
    }
    /*-- IPv6：仅十六进制 / 冒号 / 点（兼容 ::ffff: 映射），至少含一个冒号，最长 45 字符 --*/
    return value.includes(':') && value.length <= 45 && /^[0-9a-fA-F:.]+$/.test(value);
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
