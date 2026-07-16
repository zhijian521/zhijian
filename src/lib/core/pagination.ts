/*============================================================================
  pagination — 列表分页状态工具

  统一处理删除当前页最后一项后的页码回退，避免后台列表停留在空页。
============================================================================*/

/**
 * 计算删除一项后应保留的页码。
 *
 * 仅在删除当前页最后一项且并非首页时回退一页，其余场景保持当前页。
 */
export function getPageAfterDelete(currentPage: number, visibleItemCount: number): number {
    if (currentPage > 1 && visibleItemCount === 1) return currentPage - 1;
    return currentPage;
}
