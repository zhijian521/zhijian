/*============================================================================
  chart-colors — 后台图表配色常量

  Recharts 通过 SVG 属性和内联样式接收颜色，无法直接引用 CSS 变量，
  因此在此集中维护与 theme.css token 对应的 hex 值。
  若调整 theme.css 中对应 token，需同步更新此文件。
============================================================================*/

/*-- 趋势图主色板：与 theme.css token 一一对应 --
    primary        ↔ --primary（朱砂红，浏览量主线）
    primarySubtle  ↔ --primary-subtle 的实色近似（token 为 color-mix 透明值，SVG fill 需实色）
    muted          ↔ --muted-foreground（访客数虚线、坐标轴文字）
    mutedSubtle    ↔ --border（网格线、轴线）
*/
export const CHART_COLORS = {
    primary: '#9f000f',
    primarySubtle: '#f5e6e8',
    muted: '#6f655c',
    mutedSubtle: '#e7ddd1',
};

/*-- Tooltip 浮层样式：border 对应 --border，background 对应 --background --*/
export const CHART_TOOLTIP_STYLE = {
    border: '1px solid #e7ddd1',
    background: '#fbf9f9',
    fontSize: 12,
    padding: '4px 8px',
};

/*-- 分布饼图色阶：主题色的衍生渐变色阶，无直接 token，首色与 --primary 对齐 --*/
export const DEVICE_PALETTE = ['#9f000f', '#c4616d', '#d9969e', '#efcdd2'];
export const BROWSER_PALETTE = ['#4a6741', '#6d8f64', '#96b68e', '#c2dbc0'];
export const OS_PALETTE = ['#5c4a2a', '#8b7355', '#b5a07a', '#d9cbb0'];
