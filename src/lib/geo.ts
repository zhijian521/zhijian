import IP2Region from 'ip2region';

/*============================================================================
  GeoIP 解析 + IP 处理

  职责：
  - 从 IP 解析出国家、省份、城市（中文名）
  - 使用 ip2region 离线数据库，对中国 IP 精度远高于 geoip-lite
============================================================================*/

const searcher = new IP2Region();

export interface GeoInfo {
    country: string;   // 中文名，如 '中国'
    region: string;    // 中文名，如 '陕西省'
    city: string;      // 中文名，如 '西安市'
}

/*== 从 IP 解析地理位置 ==*/
export function lookup(ip: string): GeoInfo | null {
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

/*== IP 处理：返回原 IP ==*/
export function maskIp(ip: string): string {
    return ip || '';
}
