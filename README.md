# Wizard Note

> 一个算法笔记博客。**Astro 7 手写**，没用任何现成主题。
> 从 Hexo + Fluid 迁移而来，全部 19 篇文章、约 7000 个数学公式都完整搬过来了。

---

## 长什么样

- **首页** —— 白板上一条条文章卡（没有卡片框，只有分隔线），封面 16:9，图片加载前先铺主色渐变
- **文章页** —— 100vh 全屏头图 + 正文白板 + 右侧吸顶目录
- **公式** —— KaTeX，和旧站逐像素一致
- **代码块** —— macOS 窗口样式，整条标题栏可点开合，一键复制
- **搜索** —— 点图标弹出居中模态框，只有下划线的输入框，命中片段高亮
- **暗色模式 / 主题色** —— 一个色相数字驱动全站配色，设置面板里能实时拖
- **其它** —— 音乐播放器（切页不断）、图片灯箱、Mermaid 图表、打字机标题、归档 / 分类 / 标签、[RSS](/rss.xml)

## 技术栈

| | |
| --- | --- |
| 框架 | [Astro 7](https://astro.build) |
| 样式 | [Tailwind v4](https://tailwindcss.com)（CSS-first，无配置文件）+ 手写 `global.css` |
| 数学 | [KaTeX](https://katex.org) |
| 代码高亮 | [Shiki](https://shiki.style)（明暗双主题） |
| 搜索 | [Pagefind](https://pagefind.app)（构建期建索引，零后端） |
| 图表 | [Mermaid](https://mermaid.js.org)（滚动到附近才加载） |
| 路由 | `astro:transitions` 的 `ClientRouter`（无刷新切页） |

## 快速开始

需要 **Node ≥ 22** 和 **pnpm**。

```bash
pnpm install

pnpm dev       # 开发服务器 → http://localhost:5173
pnpm build     # 构建 + 生成搜索索引
pnpm preview   # 预览构建产物
```

> ⚠️ **构建请用 `pnpm build`，不要用 `npx astro build`。**
> 后者会清空 `dist/`，把 Pagefind 的搜索索引一起删掉 —— 搜索就永远返回 0 条。

### 改这三处，博客就变成你的

| 文件 | 改什么 |
| --- | --- |
| [`src/consts.ts`](src/consts.ts) | 站点名、作者、域名、主题色相、每页篇数、导航栏 |
| [`src/content/blog/`](src/content/blog) | 文章本体（Markdown） |
| [`public/img/`](public/img) | 封面图、头图、头像 |

## 部署到 GitHub Pages

仓库里已经有 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)，**推送即自动部署**。

**推荐做法**：新建一个名为 `<你的用户名>.github.io` 的仓库，然后：

```bash
git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
git push -u origin main
```

再去仓库的 **Settings → Pages**，把 `Source` 选成 **GitHub Actions**。
两分钟后访问 `https://<你的用户名>.github.io/`。

站点地址由 `actions/configure-pages` **自动注入构建**，不需要手改任何常量。

> 如果你必须用**项目站**（`https://<用户名>.github.io/<仓库名>/`），
> 还需要设 `base` 并改写站内绝对路径 —— 详见 [GUIDE.md 第 9.5 节](GUIDE.md#95-如果你想用项目站子路径)。

## 项目结构

```
my_blog/
├── astro.config.mjs        # markdown 管线、站点地址、端口
├── pagefind.yml            # 搜索索引配置
├── scripts/                # 构建期脚本（LQIP 生成、清缓存、Hexo 迁移）
├── public/                 # 静态资源：封面图、音乐、favicon
└── src/
    ├── consts.ts           # ★ 站点常量
    ├── content/blog/       # ★ 文章
    ├── layouts/            # 页面骨架
    ├── components/         # 11 个组件
    ├── pages/              # 路由（文件名即 URL）
    ├── plugins/            # ★ 自定义 markdown 语法
    ├── scripts/            # ★ 浏览器端交互
    └── styles/global.css   # ★ 全站样式
```

## 写文章

```markdown
---
title: 动态规划入门
description: 从记忆化搜索讲到状态压缩。
pubDate: 2026-01-15
cover: /img/05.jpg
categories: [Algorithm]
tags: [DP, 优化]
---

正文。行内公式写 $O(n \log n)$。

:::tip[小提示]
这个站有一套自定义的指令语法。
:::
```

自定义指令（提示框 / 折叠块 / 标签页 / 链接卡 / 栅格 / 步骤 / 剧透）的完整说明，
以及数学公式、代码块、Mermaid 的写法，都在 [GUIDE.md 第 4 节](GUIDE.md#4-写文章)。

## 进一步阅读

**[GUIDE.md](GUIDE.md) —— 维护手册**，包含：

- 目录导览与路由表
- 完整的写作语法
- 样式系统（色相驱动、Tailwind v4 入口、`global.css` 组织）
- 组件与脚本清单
- **[踩坑记录](GUIDE.md#8-踩坑记录最值钱的一节)** —— 构建缓存、CSS、markdown 渲染、客户端路由四类真实故障
- 部署详解与常见问题

## 致谢

设计上大量参考了两个优秀项目：

- [hexo-theme-fluid](https://github.com/fluid-dev/hexo-theme-fluid) —— 首页列表、分页、归档、分类、标签的版式
- [Firefly](https://github.com/CuteLeaf/Firefly) —— 导航栏、设置面板、目录、代码块、链接卡的交互与取值
