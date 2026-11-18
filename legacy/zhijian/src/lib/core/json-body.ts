/*============================================================================
  json-body — JSON 请求体数组校验

  导航页各表按「每用户一条 JSON」整存整取，写库前必须确认提交值
  确实是数组、且序列化后体积不超上限：非数组会污染 JSON 列结构，
  超大请求体会撑大单行数据、拖慢读写并放大内存占用。

  限额 1MB 沿用 /api/nav/chat 与 /api/nav/sync 的既有约束；
  体积度量沿用 JSON.stringify(...).length（字符串长度），
  与既有实现保持一致，避免迁移改变线上行为。
============================================================================*/

/*== 单条 JSON 上限 1MB（按 JSON.stringify 序列化长度计）。 ==*/
export const MAX_JSON_ARRAY_SIZE = 1024 * 1024;

/*== 判断 value 为数组且序列化长度不超过限额。 ==*/
export function isJsonArrayWithinLimit(value: unknown, limit = MAX_JSON_ARRAY_SIZE): value is unknown[] {
    return Array.isArray(value) && JSON.stringify(value).length <= limit;
}
