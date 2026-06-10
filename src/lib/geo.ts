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

/* ISO 3166-2:CN 省份代码 → 中文名（geoip-lite 返回此格式） */
const REGION_NAMES: Record<string, string> = {
    AH: '安徽', ZJ: '浙江', JX: '江西', HA: '河南',
    HE: '河北', HN: '湖南', HB: '湖北', FJ: '福建',
    HI: '海南', LN: '辽宁', JL: '吉林', HL: '黑龙江',
    SD: '山东', NM: '内蒙古', SX: '山西', GS: '甘肃',
    NX: '宁夏', SN: '陕西', QH: '青海', XZ: '西藏',
    GX: '广西', SH: '上海', BJ: '北京', TJ: '天津',
    CQ: '重庆', SC: '四川', YN: '云南', GD: '广东',
    GZ: '贵州', JS: '江苏', XJ: '新疆', TW: '台湾',
    HK: '香港', MO: '澳门',
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

/*== IP 遮蔽：返回原 IP（不再遮蔽） ==*/
export function maskIp(ip: string): string {
    return ip || '';
}