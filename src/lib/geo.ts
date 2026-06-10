import geoip from 'geoip-lite';

/*============================================================================
  GeoIP 解析 + 区域名称映射 + IP 遮蔽

  职责：
  - 从 IP 解析出国家代码、省份代码、城市名
  - 将 ISO 国家代码映射为中文名
  - 将省份代码映射为中文名（geoip-lite 返回 FIPS 代码）
  - 隐私处理：IP 遮蔽（最后一段替换为 xxx）
============================================================================*/

/* 国家代码 → 中文名（覆盖常见国家） */
const COUNTRY_NAMES: Record<string, string> = {
    CN: '中国', US: '美国', JP: '日本', KR: '韩国',
    GB: '英国', DE: '德国', FR: '法国', AU: '澳大利亚',
    CA: '加拿大', RU: '俄罗斯', IN: '印度', SG: '新加坡',
    IT: '意大利', ES: '西班牙', BR: '巴西', MX: '墨西哥',
    TH: '泰国', VN: '越南', PH: '菲律宾', MY: '马来西亚',
    ID: '印尼', TW: '台湾', HK: '香港', MO: '澳门',
    NL: '荷兰', SE: '瑞典', NO: '挪威', DK: '丹麦',
    FI: '芬兰', PL: '波兰', CZ: '捷克', AT: '奥地利',
    CH: '瑞士', BE: '比利时', IE: '爱尔兰', PT: '葡萄牙',
    AR: '阿根廷', CL: '智利', CO: '哥伦比亚', SA: '沙特',
    AE: '阿联酋', IL: '以色列', NZ: '新西兰', ZA: '南非',
    EG: '埃及', PK: '巴基斯坦', BD: '孟加拉', NG: '尼日利亚',
};

/* FIPS 省份代码 → 中文名（覆盖中国省份+直辖市+自治区） */
const REGION_NAMES: Record<string, string> = {
    '01': '安徽', '02': '浙江', '03': '江西', '04': '河南',
    '05': '河北', '06': '湖南', '07': '湖北', '08': '福建',
    '09': '海南', '10': '辽宁', '11': '吉林', '12': '黑龙江',
    '13': '山东', '14': '内蒙古', '15': '山西', '16': '甘肃',
    '17': '宁夏', '18': '陕西', '19': '青海', '20': '西藏',
    '21': '广西', '22': '上海', '23': '北京', '24': '天津',
    '25': '重庆', '26': '四川', '27': '云南', '28': '广东',
    '29': '贵州', '30': '江苏', '31': '新疆', '32': '台湾',
    '33': '香港', '34': '澳门',
};

export interface GeoInfo {
    country: string;   // 中文名，如 '中国'
    region: string;    // 中文名，如 '上海'
    city: string;      // 原始英文名，如 'Shanghai'
}

/*== 从 IP 解析地理位置 ==*/
export function lookup(ip: string): GeoInfo | null {
    const geo = geoip.lookup(ip);
    if (!geo) return null;
    return {
        country: COUNTRY_NAMES[geo.country] || geo.country,
        region: REGION_NAMES[geo.region] || geo.region || '',
        city: geo.city || '',
    };
}

/*== IP 遮蔽：最后一段替换为 xxx ==*/
export function maskIp(ip: string): string {
    if (!ip) return '';
    const parts = ip.split('.');
    if (parts.length === 4) return parts.slice(0, 3).join('.') + '.xxx';
    return ip; // IPv6 或异常格式不遮蔽
}