import IP2Region from 'ip2region';

/*============================================================================
  GeoIP 解析 + IP 处理

  职责：
  - 从 IP 解析出国家、省份、城市（中文名）
  - 使用 ip2region 离线数据库，对中国 IP 精度远高于 geoip-lite
  - IP 遮蔽：最后一段替换为 xxx，保护隐私
  - 内网 IP 跳过 geo 查询，避免写入无意义数据
============================================================================*/

const searcher = new IP2Region();

export interface GeoInfo {
    country: string; // 中文名，如 '中国'
    region: string; // 中文名，如 '陕西'
    city: string; // 中文名，如 '西安'
}

/*== 判断是否为内网/保留 IP ==*/
function isPrivateIp(ip: string): boolean {
    return /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.0\.0\.|::1$|fc|fd)/.test(ip);
}

/*== IP 遮蔽：最后一段替换为 xxx ==*/
export function maskIp(ip: string): string {
    if (!ip) return '';
    /* IPv4：192.168.1.42 → 192.168.1.xxx */
    const v4Match = ip.match(/^(\d+\.\d+\.\d+)\.\d+$/);
    if (v4Match) return v4Match[1] + '.xxx';
    /* IPv6 或其他格式：遮蔽最后一段 */
    const parts = ip.split(':');
    if (parts.length > 1) return parts.slice(0, -1).join(':') + ':xxx';
    return ip;
}

/*== 从 IP 解析地理位置（内网 IP 返回 null） ==*/
export function lookup(ip: string): GeoInfo | null {
    if (!ip || isPrivateIp(ip)) return null;

    try {
        const result = searcher.search(ip);
        if (!result) return null;

        const country = result.country || '';
        const region = (result.province || '').replace('省', '').replace('市', '');
        const city = (result.city || '').replace('市', '');

        if (!country && !region && !city) return null;

        return { country, region, city };
    } catch {
        return null;
    }
}
