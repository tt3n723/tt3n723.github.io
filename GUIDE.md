# Wizard Note · 维护手册

> 这不是「Astro 教程」，而是**这个博客本身的说明书**：每个文件干什么、怎么写文章、
> 改颜色去哪里、以及 —— 最值钱的 —— **我已经踩过的坑**。

## 目录

1. [这是什么](#1-这是什么)
2. [快速开始](#2-快速开始)
3. [目录导览](#3-目录导览)
4. [写文章](#4-写文章)
5. [样式系统](#5-样式系统)
6. [组件与交互](#6-组件与交互)
7. [脚本清单](#7-脚本清单)
8. [踩坑记录（最值钱的一节）](#8-踩坑记录最值钱的一节)
9. [部署到 GitHub Pages](#9-部署到-github-pages)
10. [从 Hexo 迁移](#10-从-hexo-迁移)

---

## 1. 这是什么

从 **Hexo + Fluid 主题**迁移过来的个人博客，用 **Astro 7** 重写。
**没有用任何现成主题** —— 所有布局、样式、组件都是本仓库的源码。

| 用途 | 选型 |
| --- | --- |
| 框架 | Astro 7（绝大多数页面构建期生成） |
| 样式 | Tailwind v4（CSS-first，**没有 tailwind.config.js**）+ 手写 `global.css` |
| 数学 | KaTeX（`remark-math` + `rehype-katex`） |
| 代码高亮 | Shiki 双主题（github-light / github-dark） |
| 图表 | Mermaid 12（滚动到附近才 `import()`） |
| 搜索 | Pagefind（构建期建索引） |
| 路由 | `astro:transitions` 的 `ClientRouter`（无刷新切页） |

### 设计参考

| 部分 | 参考 |
| --- | --- |
| 首页 / 分页 / 归档 / 分类 / 标签 / 单页 | 旧 Hexo 站（hexo-theme-fluid 1.9.8） |
| 导航栏 / 设置面板 / 目录 / 代码块 / 链接卡 / 公式 | **Firefly v6.16.8** |

> 一条铁律：**「看起来差不多」不够。要么量数值，要么把参考站跑起来并排截图。**

---

## 2. 快速开始

```bash
pnpm install
pnpm dev       # 开发服务器 → http://localhost:5173
pnpm build     # 构建 + 生成搜索索引
pnpm preview   # 预览构建产物
```

### 三个必须记住的命令细节

**① 构建一定要用 `pnpm build`，不要用 `npx astro build`**

`pnpm build` 跑三步：

```
node scripts/generate-lqips.mjs   # 每张封面生成主色渐变（防加载跳动）
astro build                       # 生成静态站点
pagefind --site dist              # 给 dist 建搜索索引
```

`astro build` 会**先清空 `dist/`** —— 包括上一步的 Pagefind 索引。
踩过：构建完发现搜索永远返回 0 条。

**② 改了 markdown 插件之后要 `pnpm clean`**

| 缓存 | 存什么 |
| --- | --- |
| `.astro/` | Astro 的类型与集合缓存 |
| `node_modules/.astro/` | **每篇文章渲染好的 HTML**（最容易坑人的一个） |
| `node_modules/.vite/` | Vite 模块缓存；不删它 **dev 服务器**会一直用旧插件，build 却是新的 |

```bash
pnpm clean && pnpm build
```

**③ 开发端口固定 5173**

Astro 默认的 4321 落在 **Windows 动态保留区间 4304-4403** 里，绑定直接失败：
`listen EACCES: permission denied`。查当前区间：

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

---

## 3. 目录导览

```
my_blog/
├── astro.config.mjs          # 配置入口：markdown 管线、站点地址、端口
├── pagefind.yml              # 搜索索引配置（排除 KaTeX 等）
├── .github/workflows/deploy.yml  # 推送到 GitHub 自动构建 + 部署 Pages
├── scripts/                  # 构建期脚本（Node）
│   ├── generate-lqips.mjs    #   封面 → 主色渐变，写进 src/data/lqips.json
│   ├── clean.mjs             #   清三个缓存
│   └── migrate.mjs           #   从旧 Hexo 迁移内容（已完成，留作参考）
├── public/                   # 原样拷贝到 dist/ 的静态资源
│   ├── favicon.svg / .ico
│   ├── img/                  #   18 张封面 + 头图 + 头像
│   └── music/                #   音乐播放器的 mp3
└── src/
    ├── consts.ts             # ★ 站点名、作者、域名、色相、每页篇数、导航栏
    ├── content.config.ts     # 内容集合 schema（frontmatter 校验）
    ├── content/blog/*.md     # ★ 文章本体
    ├── data/lqips.json       #   自动生成，别手改
    ├── data/music.ts         #   音乐播放列表
    ├── layouts/              #   BaseLayout（骨架）/ BlogPost（文章页）
    ├── components/           #   11 个组件，见第 6 节
    ├── pages/                #   路由，文件名即 URL
    ├── plugins/              # ★ remark / rehype 插件
    ├── scripts/              # ★ 浏览器端脚本，每个导出 initXxx()
    └── styles/global.css     # ★ 全站样式（约 2000 行）
```

### 路由表（`src/pages/`）

| 文件 | URL |
| --- | --- |
| `[...page].astro` | `/`、`/2/`、`/3/`… 首页分页 |
| `blog/[...slug].astro` | `/blog/<文件名>/` |
| `archive.astro` | `/archive/` |
| `categories/index.astro` / `[category].astro` | `/categories/` 与单分类 |
| `tags/index.astro` / `[tag].astro` | `/tags/` 与单标签 |
| `about.astro` | `/about/` |
| `lab.astro` | `/lab/` **内部样式展台**（不进 sitemap、不索引） |
| `404.astro` | `/404.html` |
| `rss.xml.ts` | `/rss.xml` RSS 订阅源（`@astrojs/rss`） |

**`/lab/` 的用法**：它把全站能用的 markdown 元素和指令组件都摆在一页里。
**改完样式回 `/lab/` 扫一遍**，就知道有没有把旧东西弄坏。

---

## 4. 写文章

在 `src/content/blog/` 下新建 `.md`，**文件名就是 URL**（`01-基础.md` → `/blog/01-基础/`）。

### 4.1 frontmatter

```yaml
---
title: 动态规划入门
description: 从记忆化搜索讲到状态压缩。   # 会进摘要和 SEO
pubDate: 2026-01-15                     # 必填，决定排序和归档
updatedDate: 2026-02-01                 # 可选
cover: /img/05.jpg                      # 头图 + 首页缩略图
categories: [Algorithm]                 # 决定「同分类文章」
tags: [DP, 优化]
draft: false                            # true 则完全不出现在站上
---
```

校验规则在 `src/content.config.ts`。

### 4.2 数学公式

```
行内：$O(n \log n)$
块级：$$
f(x) = \sum_{i=0}^{n} y_i \prod_{j \ne i} \frac{x - x_j}{x_i - x_j}
$$
```

- 渲染器是 **KaTeX**，也支持 `\ce{}` 化学式
- 公式写错**不会让构建失败**，只在那个位置标红（`throwOnError: false`）
- ⚠️ **不要在行内用 `\dfrac`** —— 它是显示尺寸分式，会把行距撑得很高

### 4.3 指令块（自定义语法）

实现都在 `src/plugins/remark-directives.mjs`。

**提示框**（左彩条 + 同色浅底）—— 类型：`tip` / `note` / `info` / `important` / `warning` / `danger` / `caution`

```
:::tip[标题]
内容
:::
```

**折叠块**（默认收起，右侧「展开 / 收起」）

```
:::details[点我看题解]
内容。里面可以再放代码块、公式、图片。
:::
```

**标签页**（选中态是实心胶囊）

```
:::tabs
::tab[递归写法]
内容 A
::tab[迭代写法]
内容 B
:::
```

**链接卡**（站外＝地球图标 + 虚线；站内＝文档图标 + 实线）

```
:::link[CSES Problem Set]{href=https://cses.fi/problemset/}
300 道题的题库。
:::
```

**栅格**：`:::grid{cols=2}` + `::cell` 分隔。
**步骤 / 时间线**：`:::steps` / `:::timeline`。
**行内剧透**：`这是 :spoiler[答案] 的写法`（默认涂黑，悬停显示）。

### 4.4 代码块

普通围栏代码块即可。运行时 `copy-code.ts` 会包成 macOS 窗口：

- 三色点 +（有的话）标题 + 语言标签 + 复制按钮
- **超过 3 行**才自动加行号
- **整条标题栏可点**，展开 / 收起
- 展开还是收起**只由「默认是否展开」决定**：`:::details` 里的默认收起，普通块默认展开

### 4.5 图片与图表

```markdown
![这是题注](/img/xxx.png)
```

`rehype-figure.mjs` 把 alt 变成 `<figcaption>`，并给图片加灯箱。
Mermaid 直接写 ` ```mermaid ` 围栏，滚动到附近才加载（约 500KB）。

---

## 5. 样式系统

### 5.1 一个色相驱动全站

整站没有硬编码颜色，全部写成 `oklch(明度 彩度 var(--hue))`。
`--hue` 写在 `<html style="--hue: 265">` 上，默认值来自 `src/consts.ts` 的 `SITE_HUE`。

```css
:root {
  --hue: 265;                               /* 靛蓝 */
  --accent: oklch(0.55 0.17 var(--hue));    /* 强调色 */
  --surface: oklch(0.995 0.002 var(--hue)); /* 卡片底色 */
}
```

**换主题色只需改一个数字**：265 靛蓝 / 230 蓝 / 200 青 / 160 绿 / 100 黄绿 / 60 琥珀 / 25 橙红 / 0 红 / 330 洋红。

### 5.2 全站基准字号（关键）

```css
html {
  font-size: 19px;        /* ← 整站「呼吸感」的来源 */
  letter-spacing: 0.02em;
}
```

抄自旧 Hexo 站（Fluid）。Tailwind 的单位都是 `rem`，
改这一个数字**全站间距和字号等比缩放**。

### 5.3 Tailwind v4 的入口（删了会出大事）

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';
@custom-variant dark (&:where(.dark, .dark *));
@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-accent: var(--accent);
}
```

| 少了哪一行 | 会怎样 |
| --- | --- |
| `@import 'tailwindcss'` | **全站工具类消失**：`lg:grid` 退化成 `display:block`、`max-w-*` 失效。页面「看起来还行」（手写 CSS 还在）但布局全塌 |
| `@plugin typography` | `prose` 正文排版全没 |
| `@custom-variant dark` | 明暗切换跟系统走，设置面板按钮失效 |
| `@theme inline` | `bg-bg` / `text-fg` / `border-line` 这些类不存在 |

`@theme` 用 `inline`，工具类才能跟着运行时的 `--hue` 和明暗实时变化。

### 5.4 `global.css` 的组织

1. `:root` / `html.dark` 设计变量
2. 基准字号、跳到主内容、渐进增强（`.cover-img` / `[data-reveal]`）
3. 白板 `.board` / `.board-inner`
4. 首页列表 `.index-card` 一族
5. 分页、归档、分类、标签、扁平列表
6. 目录 `.toc-*`
7. **正文**：标题层级、代码块、折叠块、标签页、提示框、链接卡、栅格、剧透、步骤、题注、公式、灯箱
8. 文章页：正文板、同分类、回到顶部
9. 设置面板驱动的几项
10. 搜索模态框、Mermaid、打印样式

### 5.5 设置面板能改什么

导航栏 → 齿轮。所有选择存 `localStorage`，通过往 `<html>` 上写属性/类生效：

| 项 | 实现 |
| --- | --- |
| 主题色相 | `--hue`（16 个预设 + 滑杆） |
| 明暗 | `html.dark` |
| 字号 / 行距 / 圆角 / 代码字号 | `--prose-scale` / `--prose-leading` / `--radius` / `--code-scale` |
| 列表布局 | `html[data-post-layout='list'|'grid']` |
| 卡片描边 / 白板跟随主题色 | `html.enable-card-border` / `html.card-follow-theme` |

---

## 6. 组件与交互

| 组件 | 说明 |
| --- | --- |
| `BaseLayout.astro` | HTML 骨架。SEO / OG meta、主题初始化内联脚本、**所有 `initXxx()` 的注册表** |
| `BlogPost.astro` | 文章页：100vh 头图（封面 + 标题 + 日期·字数·时长）→ 正文板 → 同分类 → 上/下一篇 |
| `Header.astro` | 固定导航栏 + 音乐面板 + 设置面板 + 移动端抽屉（全站最大的组件） |
| `Banner.astro` | 头图。`cover/center`、遮罩 `rgba(0,0,0,.3)`、可打字机 |
| `PostCard.astro` | 首页卡片（**没有卡片框**，只有一条分隔线，照搬 Fluid） |
| `Pagination.astro` | 构建期分页。每个链接带 `#board`，点页码不跳回页首 |
| `Toc.astro` | 右侧目录：导轨线 + 只展开当前章节 + 当前章节吸顶 |
| `CategoryNav.astro` | 「同分类文章」，照搬 Firefly 的 SeriesNav（默认收起手风琴） |
| `SearchModal.astro` | 搜索模态框（只有下划线的输入框 + 结果列表） |
| `MusicPlayer.astro` | 音乐播放器。`transition:persist` 让它切页时**不被重建**，音乐不断 |
| `BackToTop` / `Footer` / `FormattedDate` | 顾名思义 |

### 导航栏毛玻璃

```css
/* 顶部：完全透明（白字 + 一层淡暗描边，压在花哨头图上才读得清） */
/* 往下滚：毛玻璃，按主题色 */
--glass-bg: oklch(0.975 0.045 var(--hue) / 0.55);
backdrop-filter: blur(22px) saturate(1.8);
```

`--glass-bg` 的**彩度是 `--surface` 的十几倍** —— 故意的，
否则换色相根本看不出来，等于没有「按主题色」。

---

## 7. 脚本清单

`src/scripts/` 下 15 个浏览器端脚本，**每个导出一个 `initXxx()`**。

### 注册方式（这个模式很重要）

```js
// BaseLayout.astro 末尾
let lastPath = '';
function boot() {
  if (location.pathname === lastPath) return;    // 首屏两个时机都会到，防重复
  lastPath = location.pathname;
  document.documentElement.classList.add('js');  // ClientRouter 换页后要补回来
  initHeader();
  initCopyCode();
  // …
}
document.addEventListener('astro:page-load', boot);
```

**为什么不用 `DOMContentLoaded`**：用了 `ClientRouter` 之后，
**切页时 `DOMContentLoaded` 不会再触发**，`<script src>` 也不会重新执行。
搜索功能一度「一直用不了」就是踩了这个。

| 脚本 | 干什么 |
| --- | --- |
| `header.ts` | 导航栏：滚动状态、隐藏/出现、三个浮层开合、**滚动时自动关浮层**、设置面板 6 个 applier |
| `theme.ts` | 明暗一键切换 |
| `typed.ts` | 头图标题打字机（终端样式，底部短横线光标） |
| `toc.ts` | 目录：滚动高亮、只展开当前章节、点击偏移用**实测**导航栏高度 |
| `search-modal.ts` | 搜索。动态 `import('/pagefind/pagefind.js')` |
| `copy-code.ts` | 代码块包成 macOS 窗口 + 复制 + 折叠 |
| `tabs.ts` / `series-nav.ts` / `archive.ts` | 标签页、同分类手风琴、归档年份折叠 |
| `music.ts` | 播放器。`<audio>` 挂 `document.body`，首次播放才创建 |
| `mermaid.ts` | 滚动到附近才 `import()` Mermaid |
| `lqip.ts` / `reveal.ts` / `banner.ts` / `lightbox.ts` | 封面淡入、滚动渐入、头图、图片灯箱 |
| `back-to-top.ts` / `fireworks.ts` | 回到顶部、点击烟花（挂 `document`，切页不用重跑） |

---

## 8. 踩坑记录（最值钱的一节）

每一条都是**真实踩过并修好的**。

### 8.1 构建 / 缓存类

**❌ 用 `npx astro build` 代替 `pnpm build` → 搜索永远 0 条**
`astro build` 先清空 `dist/`，把 Pagefind 索引一起删了。

**❌ 改了 remark/rehype 插件但不 `pnpm clean` → 页面不变**
最坑的是 `node_modules/.astro/`，它缓存**每篇文章渲染好的 HTML**。

**❌ 改了插件后 dev 一直用旧版**
`node_modules/.vite/` 的模块缓存。build 是新的、dev 是旧的，会让人以为「改了没用」。

**❌ `remarkSectionize` 放错位置 → 静默不生效**
它是个 **remark** 插件，我一度写在 `rehypePlugins` 里。构建成功、没有警告，
但一个 `<section>` 都没生成。修好后第 12 篇里有 85 个 `<section>`。

**❌ 孤儿 dev/preview 服务器占着端口**
`pnpm clean` 会删掉后台状态文件，于是 `astro dev status` 撒谎说没在跑，
而老进程还占着端口 → 新的 `--background` 启动**静默失败**，你一直在看旧输出。

```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen | Select OwningProcess
Stop-Process -Id <PID> -Force
```

### 8.2 CSS 类

**❌ 用「从 A 切片到 B」的方式删 CSS**
我用 `css.slice(0, a) + new + css.slice(b)` 替换一段样式，
结果**切掉了中间好几段无关样式**（白板主规则、分类网格、标签云、公式容器、代码块窗口）。
各段在文件里的先后顺序和我以为的不一样，切掉的比预期多得多。
**症状：某些组件突然变成裸样式，但 CSS 语法完全合法、括号也平衡**，极难查。

> 要删某一段，就用它的**完整文本**做精确替换，别用首尾索引切。

**❌ 删掉 `@import 'tailwindcss'`**（见 5.3）
后果不是「变丑」，而是**全站工具类集体消失**，页面「看起来还行」但布局全塌。

**❌ 行内元素的 `getBoundingClientRect()` 会跨多个行盒**
我写过一版「用 JS 逐个量公式高度、给超高的段落加行高」。
一个**换行的**公式量出来 143px，于是行高被设成 143px，整段间距彻底散架。

> 行内元素的高度和「它占了几行」是两回事。

**❌ 父容器没高度时，子元素 `sticky` 不生效**
```css
/* ✗ 无效：栅格子项只有内容那么高，内层没有可移动的轨道 */
.toc-card { position: sticky; top: 5.2rem; }

/* ✓ 有效：外层保持默认 stretch（被拉到整行高），内层才能粘 */
```
反过来的「外层 sticky + `align-self: start`」也不行 —— 外层只有内容那么高。

### 8.3 Markdown / 渲染类（**最隐蔽的一类**）

**❌ Tailwind Typography 给行内 `<code>` 私自加了反引号**

```css
.prose code::before { content: "`"; }   /* 默认就有！ */
.prose code::after  { content: "`"; }
```

旧站用的是 `github-markdown-css`，**没有这个行为**。
于是同一篇文章：旧站渲染成 `q`，我这边渲染成**反引号 + q + 反引号**（反引号跟着显示出来）。

```css
/* 修： */
.prose code::before, .prose code::after { content: none; }
```

> **从别的静态站迁过来时，渲染器的「默认装饰」是最容易漏的一类差异。**
> Tailwind Typography 不只排版，它还给 `<code>` 加反引号、给 `<blockquote>` 加引号、给表格加边框。

**❌ `.katex { font-size: 1.06em }` 把公式改小了**
KaTeX 默认是 **1.21em**。我手写了个 1.06em，公式小一圈、分式被挤，
看起来就像「分母超过了行距」。

| 指标 | 旧站 Hexo | 我（错误版） | 修正后 |
| --- | --- | --- | --- |
| KaTeX 字号 | 22.99px | 20.14px | 22.99px |
| 分式高度 | 27px | 23px | 27px |

> **永远不要给 `.katex` 设 `font-size`。**

**❌ 给「含公式的段落」额外加行高**
试过两轮（CSS 的 `:has(.mfrac)` 和 JS 量测），都把段落间距弄得比默认还难看。
KaTeX 自己用 inline-block 的 strut 撑开行盒，**默认行高下本来就不重叠**。保持原样。

### 8.4 客户端路由类

**❌ `DOMContentLoaded` + `<script src>` 在 `ClientRouter` 下不会触发**
切页时两者都不发生 → 新页面的 DOM 上什么事件都没挂。
搜索「一直用不了」、`#search` 里 0 个元素，就是这个原因。

**❌ `astro:page-load` 首屏会触发两次**
用 `lastPath` 守卫，否则同一页面初始化两遍。

### 8.5 一条方法论（**最重要**）

> **「我这里量着是对的」不等于「作者看到的是对的」。**

这个博客的样式对齐，我前四轮都在用 CDP 量 DOM 数值、得出「已修复」的结论，
而作者每次都说「没变」。真正解决问题的是**并排截图**：
把参考站（旧 Hexo / Firefly）跑起来，**同一段、同一宽度、同一缩放**，两张图放一起 —— 
差异一眼就看出来了（反引号、公式字号），根本不用猜。

**三条结论，别再犯：**

1. 凡是「和参考站不一样」的反馈，**第一步就是并排截图**，不要先看 DOM 数值
2. 需要精确取值时（行高、圆角、间距），去读参考项目的**源文件**，不要目测
3. 改完之后**回 `/lab/` 扫一遍**，确认没把别的组件弄坏

---

## 9. 部署到 GitHub Pages

仓库里已经有 `.github/workflows/deploy.yml`，推送即部署。

### 9.1 两种仓库，先选一种

| | 用户站 | 项目站 |
| --- | --- | --- |
| 仓库名 | **必须**叫 `<你的用户名>.github.io` | 任意，比如 `blog` |
| 网址 | `https://<用户名>.github.io/` | `https://<用户名>.github.io/blog/` |
| 需要改代码吗 | **不用** | 需要设 `base`（见 9.5） |

> **推荐用户站**：一个仓库一个站点，网址最短，**零代码改动**。

### 9.2 用户站：五步搞定

**第 1 步**：在 GitHub 新建仓库，名字**必须**是 `<你的用户名>.github.io`
（比如用户名 `w42s2tflx`，仓库就叫 `w42s2tflx.github.io`）。
**不要**勾选 Add README / .gitignore / license —— 保持空仓库。

**第 2 步**：本地关联并推送。

```bash
cd my_blog
git add -A
git commit -m 'chore: 初始化 Astro 博客'
git branch -M main
git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
git push -u origin main
```

> 本仓库当前分支叫 `master`。工作流已经同时监听 `main` 和 `master`，
> 上面 `git branch -M main` 只是让它和 GitHub 的默认分支一致（推荐做）。

**第 3 步**：仓库 → **Settings → Pages** → `Source` 选 **GitHub Actions**
（不是 Deploy from a branch）。

**第 4 步**：回到 **Actions** 标签页，能看到 `Deploy to GitHub Pages` 正在跑。
第一次约 2-4 分钟（装依赖 + 构建 + 建搜索索引）。

**第 5 步**：跑完后访问 `https://<你的用户名>.github.io/`。

### 9.3 站点地址会自动注入，不用手改

`deploy.yml` 里 `actions/configure-pages@v5` 会把**真实的 Pages 地址**输出出来，
构建时通过环境变量喂进去：

```yaml
- name: Setup Pages
  id: pages
  uses: actions/configure-pages@v5

- name: Build
  run: pnpm build
  env:
    SITE_URL: ${{ steps.pages.outputs.origin }}
```

`src/consts.ts` 里对应读环境变量：

```ts
export const SITE_URL = process.env.SITE_URL ?? 'https://example.github.io';
```

**所以 RSS / sitemap / og:image 的绝对地址在 CI 里是对的，本地开发也不会报错。**

### 9.4 工作流里两个容易错的地方

**① 必须 `pnpm build`**（不是 `astro build`）—— 否则搜索索引没了。

**② `configure-pages` 要放在 build 之前**，否则拿不到 `origin`。

### 9.5 如果你想用项目站（子路径）

项目站的网址带子路径，**这个站目前有约 56 处硬编码的绝对路径**
（`/img/01.jpg`、`/blog/...`、`/pagefind/...`），直接部署会全部 404。

要支持子路径，需要：

1. `astro.config.mjs` 加 `base: '/你的仓库名'`
2. 所有内部链接改成 `import.meta.env.BASE_URL` 拼前缀
（涉及 `Header.astro`、`Footer.astro`、`Pagination.astro`、`PostCard.astro`、
各 `pages/*.astro`、`BlogPost.astro`，以及文章 frontmatter 里的 `cover` 和 `lqips.json` 的键）

> 工作量不小且容易漏。**除非你已经有一个非 `<用户名>.github.io` 的仓库必须用，
> 否则建议直接用用户站。**

### 9.6 常见问题

| 症状 | 原因 |
| --- | --- |
| Actions 里 build 成功但网页 404 | Settings → Pages 的 Source 没选成 GitHub Actions |
| 网页能开但没样式 / 图片全挂 | 用了项目站却没设 `base`。改回用户站，或按 9.5 处理 |
| 搜索没结果 | 工作流里跑成了 `astro build`，确认是 `pnpm build` |
| 推上去没反应 | 分支名不匹配。工作流监听 `main` 和 `master` |
| 想换域名 | `public/` 放一个 `CNAME` 文件写域名，再去 DNS 加解析 |

---

## 10. 从 Hexo 迁移

`scripts/migrate.mjs` 是一键迁移脚本（**已经跑完了**，留作参考或以后重迁）。它做四件事：

1. 读 `C:/Study/Blog/source/_posts/*.md`
2. 转换 frontmatter（Hexo 的 `date` / `updated` → `pubDate` / `updatedDate`）
3. 把 `<!-- more -->` 摘要标记去掉，头图改用 `cover`
4. 拷封面图到 `public/img/`

几个坑：

| 坑 | 说明 |
| --- | --- |
| Hexo 的 `categories` 可能是嵌套数组 | 统一拍平成一维 |
| 图片路径 | Hexo 用 `![](/img/x.jpg)`，要确认文件真的在 `public/img/` |
| 代码围栏 | Hexo 里用 `c++` 这类语言名，Shiki 认识，不用改 |
| 数学公式 | **两边都是 KaTeX，源码可原样搬**（但别把行内 `\dfrac` 一起搬） |

迁移后**必须**核对：

1. 公式数量对不对（新旧站同一篇的 `.katex` 数量应当一致）
2. 代码块有没有丢（对比文件里的围栏数量）
3. 图片有没有 404

---

## 附：文件体积提醒

`public/` 里有几个大文件，影响首次加载：

| 文件 | 体积 | 建议 |
| --- | --- | --- |
| `img/avatar.gif` | 3.3 MB | 换静态图或压缩，GIF 体积失控 |
| `music/Collin Lim - Luvsick.mp3` | 2.6 MB | 可接受 |
| `img/banner-home.gif` | 1.3 MB | 首页头图，可考虑换 webp |
| `img/01-18.jpg` | 各 150-300 KB | 已够小 |

### 9.7 本地网络：git 连不上 github.com 怎么办

**症状**：

```
fatal: unable to access 'https://github.com/...':
Failed to connect to github.com port 443 after 21121 ms: Could not connect to server
```

**这不是 git 配置错，是网络到不了 GitHub 的 443。** 排查顺序：

```powershell
# 1) DNS 通不通
Resolve-DnsName github.com -Type A

# 2) 443 直连通不通
Test-NetConnection github.com -Port 443

# 3) SSH 端点通不通（经常 22 / 443 反而是通的）
Test-NetConnection ssh.github.com -Port 443
Test-NetConnection github.com -Port 22

# 4) git 有没有配代理
git config --global --get http.proxy

# 5) 系统代理是什么（**git 不会自动用它**）
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' |
  Select-Object ProxyEnable,ProxyServer
```

**这台机器的实际情况**：443 直连不通，但系统代理 `127.0.0.1:7892`（猫猫云）可用，
而且 **SSH key 已经配好并授权过了**（`ssh -T git@github.com` 返回 authenticated）。
两种修法：

**方案 A（推荐）：远端改成 SSH**

```powershell
git remote set-url origin git@github.com:<用户名>/<用户名>.github.io.git
git ls-remote origin        # 只读测试，能列出 SHA 就通了
```

好处：不依赖代理进程活着。

**方案 B：给 git 配代理**

```powershell
git config --global http.proxy  http://127.0.0.1:7892
git config --global https.proxy http://127.0.0.1:7892
```

坏处：代理一关 git 就又不通了。取消：`git config --global --unset http.proxy`。

> 关键点：**浏览器能上 GitHub ≠ git 能上**。浏览器读系统代理，命令行工具不读。

### 9.8 为什么 Actions 里会有一个失败的 `pages build and deployment`

推送之后你可能看到两个工作流：

| 工作流 | 结果 |
| --- | --- |
| `Deploy to GitHub Pages`（本仓库的） | ✅ success |
| `pages build and deployment`（GitHub 自带） | ❌ failure |

失败的那个是 **Jekyll 构建**，它拿 `.astro` 文件当 Jekyll 页面解析：

```
Invalid YAML front matter in /github/workspace/src/components/BackToTop.astro
```

**它是无害的** —— 来自 Pages 的旧模式 `Deploy from a branch`，和我们的 Actions 部署是两条独立路径，
后者优先级更高，站点照常上线。

想让它别再跑：**Settings → Pages → Source 改成 `GitHub Actions`**。

> `actions/configure-pages@v5` 自己会把 Source 切成 GitHub Actions，
> 所以这个失败通常只出现一次（切换之前那次触发）。
