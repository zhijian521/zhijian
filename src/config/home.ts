/*============================================================================
  home - 首页配置

  集中维护首页静态文案，避免组件内硬编码。
============================================================================*/

/*== 首屏展示内容 ==*/
export const HERO_CONTENT = {
    author: "Zhi Jian",
    tagline: "前端开发 · 全栈 · 简约设计 · 造物",
    motto: "写代码，也写文字；喜欢简洁的设计，追求美好的事物；一切在这里记录。",
} as const;

/*== 首页个人介绍 ==*/
export const ABOUT_CONTENT = {
    bio: "喜欢简洁的设计，也喜欢安静地写点代码。偶尔捣鼓些小工具，把一闪而过的想法变成看得见的东西。这里没有宏大的叙事，只有一些零散的记录和简单的快乐。",
    links: {
        email: "mailto:yuwb0521@yeah.net",
        github: "https://github.com/zhijian521",
        rss: "/feed.xml",
    },
} as const;

/*== 首页开源项目 ==*/
export const PROJECTS = [
    {
        description: "知简 - 极简个人站点，博客写作、导航书签与后台管理，追求简洁与实用。",
        githubHref: "https://github.com/zhijian521/zhijian",
        icon: "code",
        siteHref: "https://yuwb.dev/",
        tags: ["Next.js", "TypeScript"],
        title: "zhijian",
    },
    {
        description: "Cesium 三维地球示例集，涵盖地图加载、模型渲染与空间数据可视化。",
        githubHref: "https://github.com/zhijian521/cesium-example",
        icon: "book-open",
        siteHref: "https://yuwb.dev/cesium",
        tags: ["Cesium", "GIS"],
        title: "cesium-example",
    },
] as const;
