import { viteBundler } from "@vuepress/bundler-vite";
import { defineUserConfig } from "vuepress";
import { plumeTheme } from "vuepress-theme-plume";

export default defineUserConfig({
  bundler: viteBundler(),
  // 网站信息
  base: "/zhijian-notes-blog/", // Github Pages
  // base: "/",
  lang: "zh-CN",
  title: "耶温笔记",
  description: "耶温笔记-耶温博客-学习记录",
  // 主题配置
  theme: plumeTheme({
    // seo地址
    // hostname: "https://yuwb.cn",
    // 插件
    plugins: {
      shiki: {
        // 代码高亮
        languages: [
          "shell",
          "bash",
          "typescript",
          "javascript",
          "html",
          "css",
          "vue",
          "nginx",
        ],
      },
      markdownEnhance: {
        // 代码块
        demo: true,
      },
      comment: {
        // 评论
        provider: "Giscus",
        comment: true,
        repo: "Yevin-Yu/blog-comments",
        repoId: "R_kgDOMNskgg",
        category: "Q&A",
        categoryId: "DIC_kwDOMNskgs4CgWpW",
      },
    },
    // 加密文章
    encrypt: {
      rules: {
        "/InterView/": "yuwb.cn",
      },
    },
  }),
  // 头部内容
  head: [
    [
      "link",
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
    [
      "meta",
      {
        name: "keywords",
        href: "耶温笔记,日常记录,前端学习,前端笔记,问题记录,HTML,CSS,JavaScript,Vue,Node.js",
      },
    ],
    [
      "script",
      {
        src: "/tongji.js", // 添加百度统计插件
      },
    ],
    [
      "script",
      {
        src: "https://tj.yuwb.cn/plugins/index.js?key=KH6ZM8I696EEMWQ0", // 添加统计插件
      },
    ],
  ],
});
