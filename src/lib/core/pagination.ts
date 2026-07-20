/*============================================================================
  pagination — 列表分页工具

  统一解析列表接口的分页查询参数，并处理删除当前页
  最后一项后的页码回退，避免后台列表停留在空页。
============================================================================*/

/**
 * 统一解析列表接口的 page / pageSize 查询参数。
 *
 * page 最小为 1，pageSize 最小 1、最大 100，非法值回退默认值。
 */
export function resolvePageParams(
    searchParams: URLSearchParams,
    defaultPageSize = 10
): { page: number; pageSize: number } {
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || defaultPageSize));
    return { page, pageSize };
}

/**
 * 计算删除一项后应保留的页码。
 *
 * 仅在删除当前页最后一项且并非首页时回退一页，其余场景保持当前页。
 */
export function getPageAfterDelete(currentPage: number, visibleItemCount: number): number {
    if (currentPage > 1 && visibleItemCount === 1) return currentPage - 1;
    return currentPage;
}
