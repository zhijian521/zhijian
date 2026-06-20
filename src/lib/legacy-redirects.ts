/*============================================================================
  旧站 URL 重定向映射

  旧站文章 URL 格式为 /{分类}/{文章标识}，新站统一为 /blog/{slug}。
  此文件集中管理所有旧 URL → 新 URL 的映射关系，
  next.config.ts 读取此数组生成 301 永久重定向。

  增删映射只需编辑此文件，重新部署后生效。

  规则：
  - source：旧站完整路径，如 '/tech/ajwd123'
  - destination：新站目标路径，如 '/blog/my-article' 或 '/'
  - permanent 统一为 true（301 永久重定向），无需逐条声明
============================================================================*/

/*-- 单条映射的类型 --*/
export interface LegacyRedirect {
    source: string;
    destination: string;
}

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
    /*-- 示例（请替换为实际映射） --*/
    // { source: '/tech/ajwd123', destination: '/blog/my-article' },
    // { source: '/life/xyz456', destination: '/blog/another-post' },
    // { source: '/note/old-1', destination: '/blog/merged-article' },
    // { source: '/note/old-2', destination: '/blog/merged-article' },
    // { source: '/about', destination: '/' },
];
