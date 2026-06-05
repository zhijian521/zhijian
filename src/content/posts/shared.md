# 一篇覆盖所有 Markdown 语法的示例

> 这篇文章用于验证和调优排版样式，覆盖了常见的 Markdown 语法元素。后续所有文章详情页暂时都展示此内容，接入数据后替换。

---

## 段落与文本

这是一段普通文本。Markdown 的核心理念是**让写作回归内容本身**——格式只是手段，不是目的。

第二段文本，用来验证段落间距。好的排版应该让段落之间的节奏感自然流畅，既不拥挤也不松散。

行内样式测试：**加粗文本**、*斜体文本*、~~删除线文本~~、`行内代码`、[链接文本](https://example.com)。

组合测试：***加粗斜体***、**加粗中包含`行内代码`**、*斜体中包含[链接](https://example.com)*。

---

## 标题层级

### 三级标题

三级标题常用于文章的子章节划分。

#### 四级标题

四级标题用于更细粒度的内容分组。

##### 五级标题

五级标题较少使用，但需要确保样式正确。

###### 六级标题

六极标题是 Markdown 支持的最深层级。

---

## 引用

> 独行者速，众行者远。
> —— 非洲谚语

嵌套引用：

> 外层引用
>
> > 内层引用——用于标注出处或补充说明

引用中的其他元素：

> - 引用中的列表项一
> - 引用中的列表项二
>
> 引用中的 `行内代码` 和 **加粗**。

---

## 列表

### 无序列表

- 设计原则：少即是多
- 技术选型：适合比流行更重要
- 写作态度：真实比完美更有价值
- 生活方式：减法比加法更需勇气

### 有序列表

1. 需求分析——明确核心问题
2. 技术选型——选择合适的工具
3. 原型设计——快速验证方向
4. 逐步迭代——小步快跑

### 嵌套列表

- 前端框架
  - React —— 组件化思维
  - Vue —— 渐进式设计
  - Svelte —— 编译时优化
- 样式方案
  - CSS Modules —— 作用域隔离
  - Tailwind —— 原子化工具
  - CSS-in-JS —— 运行时动态

### 任务列表

- [x] 完成首页静态化
- [x] 提取原子组件（Tag / TextLink / GhostButton）
- [x] 封装 MarkdownArticle 渲染组件
- [ ] 后台文章编辑器
- [ ] 图片上传接口
- [ ] 全站 SEO 优化

---

## 代码

行内代码：使用 `npm install react-markdown` 安装依赖，在组件中引入 `ReactMarkdown` 即可。

代码块：

```javascript
// 递归计算斐波那契数列
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 使用记忆化优化
const memo = new Map();
function fibonacciMemo(n) {
    if (memo.has(n)) return memo.get(n);
    const result = n <= 1 ? n : fibonacciMemo(n - 1) + fibonacciMemo(n - 2);
    memo.set(n, result);
    return result;
}
```

CSS 示例：

```css
/* 使用 CSS 变量实现主题切换 */
:root {
    --primary: #9f000f;
    --background: #fbf9f9;
    --foreground: #1d1b20;
    --muted: #f6efe7;
    --border: #e7ddd1;
}

.card {
    background: var(--background);
    border: 1px solid var(--border);
    padding: 1.5rem;
    transition: box-shadow 0.2s ease;
}

.card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
```

TypeScript 类型示例：

```typescript
interface Post {
    slug: string;
    title: string;
    content: string;
    tags: string[];
    publishedAt: Date;
}

async function getPost(slug: string): Promise<Post | null> {
    const meta = getStaticPostMeta(slug);
    const content = await getStaticPostContent(slug);
    if (!meta || !content) return null;
    return { ...meta, content };
}
```

纯文本：

```
天有时
地有气
材有美
工有巧
合此四者
然后可以为良
——《考工记》
```

---

## 表格

### 设计令牌对照表

| 变量名 | 色值 | 用途 | 色感 |
|--------|------|------|------|
| `--primary` | `#9f000f` | 朱砂红 · 点睛 | 热情、力量 |
| `--foreground` | `#1d1b20` | 水墨 · 主文字 | 沉静、深邃 |
| `--background` | `#fbf9f9` | 宣纸白 · 底色 | 纯净、温润 |
| `--muted` | `#f6efe7` | 米黄 · 辅底 | 柔和、包容 |
| `--border` | `#e7ddd1` | 驼色 · 分隔 | 淡雅、克制 |

### 渲染策略对比

| 页面类型 | 渲染方式 | 数据来源 | 更新频率 |
|---------|---------|---------|---------|
| 首页 | SSG | 静态文件 | 低 |
| 博客列表 | SSG | 静态文件 | 中 |
| 文章详情 | SSG | MD 文件 | 中 |
| 后台管理 | CSR | API | 高 |
| 后台编辑 | CSR | API + 实时 | 实时 |

---

## 图片

![示例图片](/images/home-hero-bg.png)

---

## 分隔线

上面是一条分隔线，用于大章节之间的视觉间隔。

---

## 链接

自动链接：<https://zhijian.dev>

带文字的链接：[知简个人站点](https://www.yuwb.dev/)

带标题的链接：[GitHub](https://github.com/zhijian521 "我的 GitHub 主页")

---

## 混合内容测试

一段包含多种元素的文本：在 `Next.js` 中使用 **CSS Modules** 时，推荐通过 `var(--primary)` 定义设计令牌。详细做法参见[上一节](#标题层级)，核心原则有三：

1. **单一来源** —— 所有颜色值定义在 `theme.css` 中
2. **语义命名** —— 用 `--primary` 而非 `--red-700`
3. **渐进增强** —— 先用静态数据跑通，再接入 API

> 好的样式系统不是"能不能实现"，而是"改一个地方，其他地方是否自动跟着变"。

最后，用一个代码块收尾：

```bash
# 构建并预览
npm run build && npm start
```

---

*本文用于排版验证，所有详情页暂时共用此内容。接入数据后，每篇文章将展示各自的 Markdown 正文。*
