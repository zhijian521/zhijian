import { defineThemeConfig } from 'vuepress-theme-plume'
import { navbar } from './navbar'
import { notes } from './notes'


export default defineThemeConfig({
  logo: 'logo.png',

  appearance: true,

  profile: {
    avatar: 'logo.png',
    name: '耶温',
    description: '前端开发<br/>让每一次点击都充满惊喜！',
    location: '雁塔区-西安-中国',
    organization: '某不知名互联网公司',
  },
  // 导航栏
  navbar,
  // 文章列表
  notes,
  // 页脚
  footer: {
    message: '耶温笔记-YevinNotesBlog',
    copyright: 'Copyright © 2025 | ICP备案号：<a target="_blank" href="https://beian.miit.gov.cn/">陕ICP备2024040821号-1</a>'
  },
})
