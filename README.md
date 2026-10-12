<div align="center">

# Wizard Note

> 一个算法笔记博客主题。**Astro 7 手写**，Markdown 写作，数学公式开箱即用。

![Node.js >= 22](https://img.shields.io/badge/node.js-%3E%3D22-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro 7](https://img.shields.io/badge/Astro-7-orange)

[**在线预览**](https://tt3n723.github.io/) · [**快速开始**](#-快速开始) · [**配置说明**](#-配置说明) · [**怎么发布**](#-部署)

</div>

---

## ✨ 功能特性

### 📖 阅读体验

- **首页** —— 白板式文章列表，封面 16:9，图片加载前先铺主色渐变占位
- **文章页** —— 100vh 全屏头图 + 正文白板 + 右侧吸顶目录
- **真分页** —— 构建期生成 `/` `/2/` `/3/` …，每页篇数可配
- **归档 / 分类 / 标签** —— 三个独立页面，分类页还有系列导航
- **数学公式** —— KaTeX，行内 + 块级；**超宽公式自动换行，不会被裁掉**
- **代码块** —— Shiki 明暗双主题，macOS 窗口样式，一键复制，可配置字体
- **搜索** —— Pagefind 构建期建索引，**零后端**，结果高亮命中片段
- **其它** —— 图片灯箱、Mermaid 图表、打字机标题、返回顶部、[RSS](/rss.xml)

### 🎨 个性化

- **一个数字换整站配色** —— 全站颜色由 `oklch(L C var(--hue))` 算出，改 `SITE_HUE` 即可
- **设置面板** —— 色相、字号、行距、列表布局、樱花开关、头图遮罩深度，全部实时生效
- **明暗三态** —— 浅色 / 深色 / 跟随系统
- **樱花特效** —— 跑在 Web Worker + OffscreenCanvas 里，切页不中断、不掉帧
- **音乐播放器** —— 无刷新切页时**不会中断播放**
- **所有设置存在浏览器本地**，每个访客互不影响

### 🧩 写作

- **提示框 / 折叠块 / 标签页 / 链接卡 / 栅格 / 步骤 / 时间线 / 剧透**
- 全部是**纯 Markdown 指令**，不需要 import 任何组件
- **文件名以下划线开头就是草稿**，不会被构建

---

## 🚀 快速开始

### 环境要求

| | |
| --- | --- |
| Node.js | **≥ 22** |
| 包管理器 | **pnpm**（推荐 ≥ 9） |

### 本地开发

```bash
pnpm install
pnpm dev          # → http://localhost:5173
```

### 构建与预览

```bash
pnpm build        # 生成占位图 → astro build → 建搜索索引
pnpm preview      # → http://localhost:5174
```

> ⚠️ **构建请用 `pnpm build`，不要用 `npx astro build`。**
> `build` 是三步：生成图片占位图、`astro build`、Pagefind 建索引。
> 直接跑 `astro build` 会清掉 `dist/pagefind/`，**站内搜索从此永远返回 0 条**。

---

## 📖 配置说明

### 站点信息 / 导航栏 / 每页篇数

全部集中在 **[`src/consts.ts`](src/consts.ts)**：

```ts
export const SITE_TITLE = 'Wizard Note';        // 站名（导航栏左上角）
export const SITE_DESCRIPTION = '算法笔记与刷题记录';
export const SITE_AUTHOR = 'w42s2tflx';         // 页脚版权
export const SITE_HUE = 265;                    // 全站色相，见下一节
export const POSTS_PER_PAGE = 9;                // 首页每页几篇
export const NAV_LINKS = [ ... ];               // 导航栏，带 children 的会变下拉菜单
```

### 配色

**整套配色由 `SITE_HUE` 一个数字驱动。** 改它，整站颜色跟着变：

| 色相 | 颜色 | 色相 | 颜色 |
| --- | --- | --- | --- |
| `0` | 红 | `200` | 青 |
| `25` | 橙红 | `230` | 蓝 |
| `60` | 琥珀 | `265` | **靛蓝（默认）** |
| `160` | 绿 | `330` | 洋红 |

访客也能在设置面板里实时拖着改（只影响他自己的浏览器）。

### 歌单

把 mp3 放进 `public/music/`，然后在 **[`src/data/music.ts`](src/data/music.ts)** 的 `MUSIC_PLAYLIST` 里加一行。

### 樱花特效

**[`src/config-sakura.ts`](src/config-sakura.ts)** 里调花瓣数量、大小、飘落速度。默认 21 片。

### 样式

全站样式都在 **[`src/styles/global.css`](src/styles/global.css)**（约 2000 行，按区块分好注释）。
颜色尽量走这几个变量：

```css
--hue        /* 全站色相 0-360 */
--accent     /* 主题色，由 --hue 算出 */
--accent-fg  /* 压在主题色上的文字色 */
--fg         /* 正文 */
--muted      /* 次要文字（日期、摘要、图标） */
--bg         /* 页面底色 */
--board-bg   /* 内容白板底色 */
--glass-bg   /* 导航栏毛玻璃底色 */
```

### 配置文件一览

| 文件 | 作用 |
| --- | --- |
| [`src/consts.ts`](src/consts.ts) | 站点信息、色相、导航栏、每页篇数 |
| [`src/config-sakura.ts`](src/config-sakura.ts) | 樱花特效参数 |
| [`src/data/music.ts`](src/data/music.ts) | 歌单 |
| [`src/styles/global.css`](src/styles/global.css) | 全站样式 |
| [`astro.config.mjs`](astro.config.mjs) | markdown 管线、站点地址、端口 |
| [`pagefind.yml`](pagefind.yml) | 搜索索引配置 |
| [`src/content/blog/`](src/content/blog) | 文章 |

---

## ⚙️ 文章 Frontmatter

文章放在 **`src/content/blog/`**，**文件名就是 URL**（`19-网络流.md` → `/blog/19-网络流/`）。

```markdown
---
title: 网络流入门              # 必填
description: 从最大流讲到费用流。   # 摘要，显示在列表页
pubDate: 2026-06-01            # 必填，发布日期
updatedDate: 2026-06-05        # 可选，有它才会显示"已更新"
cover: /img/05.jpg             # 可选，封面图（16:9 最合适）
categories: [Algorithm]        # 可选，数组
tags: [网络流, 图论]            # 可选，数组
draft: false                   # 可选，true 则构建时跳过
---
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | 字符串 | **必填** |
| `pubDate` | 日期 | **必填** |
| `description` | 字符串 | 摘要，显示在列表页 |
| `updatedDate` | 日期 | 可选，有它才显示"已更新" |
| `cover` | 字符串 | 可选，指向 `public/` 下的路径 |
| `categories` | 字符串数组 | 可选 |
| `tags` | 字符串数组 | 可选 |
| `draft` | 布尔 | 可选，`true` 跳过构建 |

> 想写草稿又不想加字段？**文件名以 `_` 开头**即可（如 `_draft.md`），构建时会被静默忽略。

图片放进 **`public/img/`**，文章里写 `/img/文件名`。
构建时会自动给每张封面生成主色渐变占位图，图片加载出来之前不会白屏。

---

## 🧩 Markdown 扩展语法

除标准 Markdown 外，还支持以下指令。**全部是纯 Markdown，不需要 import 组件。**

| 指令 | 写法 | 作用 |
| --- | --- | --- |
| 提示框 | `:::tip[标题]` … `:::` | 类型有 tip / note / info / important / warning / danger / caution |
| 折叠块 | `:::details[标题]` … `:::` | 默认收起，适合放题解 |
| 标签页 | `:::tabs` + `::tab[名字]` | 多标签切换 |
| 链接卡 | `:::link[标题]{href="https://example.com"}` | 带图标的外链卡片 |
| 栅格 | `:::grid{cols=2}` + `::cell` | 多列排版 |
| 步骤 | `:::steps` + `::step[标题]` | 带序号和竖线 |
| 时间线 | `:::timeline` + `::step[标题]` | 方形节点的竖线 |
| 剧透 | `:spoiler[文字]` | 涂黑，悬停才显示 |

数学公式用 `$行内$` 和 `$$块级$$`；图表用 ```mermaid 代码块。

> 👉 **每个组件的实际效果和完整写法，都在站内的
> [「样式与组件展示」](src/content/blog/style-guide.md) 那一页**（`/blog/style-guide/`）。
> 它同时也是改完 CSS 之后的**回归基准**。

---

## 🚀 部署

部署分两半：**已经搭好的日常使用**，和**从零开始搭一个**。

---

### 一、日常发布

写完文章、改完样式，想让线上更新 —— **只要三行**：

```bash
git add -A
git commit -m "新增文章：网络流入门"
git push
```

推送后 GitHub 会自动构建并发布，**大约 1~2 分钟后**线上就变了。

> 站点地址：**https://tt3n723.github.io/**
>
> 仓库里已经有 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)，
> 每次 `git push` 都会自动触发，**不需要你做任何别的事**。

#### 怎么知道成没成功

打开仓库的 **Actions** 标签页，能看到每次推送触发的 **Deploy to GitHub Pages**：

| 图标 | 含义 | 该做什么 |
| --- | --- | --- |
| 🟡 转圈 | 正在构建 | 等 1~2 分钟 |
| ✅ 绿勾 | 成功，已经上线 | 打开站点确认 |
| ❌ 红叉 | 失败 | 点进去看哪一步变红，对照下面的[排错](#四排错) |

#### 推之前想先本地看一眼

```bash
pnpm build
pnpm preview      # → http://localhost:5174
```

本地看没问题再推，能省一次失败的 Actions。

> ⚠️ **`package.json` 和 `pnpm-lock.yaml` 必须一起提交。**
> CI 用的是 `pnpm install --frozen-lockfile`，两个文件对不上会**直接构建失败**。
> 用上面的 `git add -A` 就不会漏掉。

---

### 二、从零搭建

换电脑、或者帮别人搭一个，走这一套。

#### 前置条件

- **GitHub 账号**
- **本机装了 Git**，并且配好了身份（没配的话提交会报错）：

  ```bash
  git config --global user.name "你的名字"
  git config --global user.email "你的邮箱"
  ```

- **能连上 GitHub**。国内网络受限时见[排错](#四排错)里的"连不上 GitHub"。

#### 第 1 步 · 在 GitHub 建仓库

登录 GitHub → 右上角 **+** → **New repository**，然后：

| 字段 | 填什么 |
| --- | --- |
| Repository name | **`<你的用户名>.github.io`** —— 必须和用户名**完全一致** |
| 可见性 | **Public**（Private 仓库用 Pages 要付费账号） |
| Add a README file | **不要勾**（本地已经有了） |
| Add .gitignore / license | **不要勾**（同上） |

点 **Create repository**。建完页面会给你一个仓库地址，形如
`https://github.com/<你的用户名>/<你的用户名>.github.io.git`，下一步要用。

#### 第 2 步 · 把本地仓库关联到远程

在项目目录里执行（把地址换成上一步给你的）：

```bash
cd C:\Study\Project\my_blog

# 已经有了 origin 就先删掉（换过仓库地址的情况）
git remote remove origin

git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
git remote -v          # 确认地址对了
```

#### 第 3 步 · 推送

```bash
git add -A
git commit -m "初始化博客"
git push -u origin main
```

> 本地分支叫 `master` 而不是 `main` 的话，把上面最后一行改成
> `git push -u origin master`。workflow 里 **main 和 master 都监听了**，不用担心。

#### 第 4 步 · 开启 GitHub Actions 部署

**这一步是最容易漏的，漏了就会推送成功但线上一直是 404。**

1. 打开仓库 → **Settings**
2. 左侧栏 → **Pages**
3. **Build and deployment** → **Source** 选 **`GitHub Actions`**（**不要**选 "Deploy from a branch"）
4. 保存

> 选完之后不需要点任何"部署"按钮 —— 下一次 `git push` 就会自动跑。

#### 第 5 步 · 验证

1. 回到仓库的 **Actions** 标签页，应该能看到一个正在跑（或已跑完）的 **Deploy to GitHub Pages**
2. 等它变成 ✅ 绿勾
3. 打开 **https://<你的用户名>.github.io/**

#### 站点地址是怎么确定的

**不需要手改任何常量。** workflow 里的 `actions/configure-pages` 会读出真实域名，
通过环境变量 `SITE_URL` 喂给构建，所以 RSS、sitemap、站内绝对链接全都是对的。

#### 如果你要用「项目站」

上面这套适用于**用户站** —— 仓库名必须是 `<用户名>.github.io`，网址是
`https://<用户名>.github.io/`。

如果仓库名是别的（比如 `blog`），网址就会变成
`https://<用户名>.github.io/blog/`，这时**还需要**：

1. 在 [`astro.config.mjs`](astro.config.mjs) 里加 `base: '/blog'`
2. 把站内写死的绝对路径（`/img/...`、`/music/...`）改成带前缀的形式

比较麻烦，**没特殊需求就用用户站**。

---

### 三、改域名（可选）

默认地址是 `https://<用户名>.github.io/`。想绑自己的域名：

1. 在 `public/` 下建一个 **`CNAME`** 文件，内容只有一行域名，例如：
   ```text
   blog.example.com
   ```
2. 到你的域名服务商加一条 **CNAME 记录**，指向 `<你的用户名>.github.io`
3. 仓库 **Settings → Pages → Custom domain** 填上同一个域名，勾选 **Enforce HTTPS**

---

### 四、排错

<details>
<summary><b>推送成功、Actions 也绿了，但网页还是旧的</b></summary>

浏览器缓存。按 `Ctrl + Shift + R` 强制刷新，或者开无痕窗口看。
GitHub Pages 本身也有几十秒的 CDN 缓存。

</details>

<details>
<summary><b>Actions 红叉：<code>ERR_PNPM_OUTDATED_LOCKFILE</code></b></summary>

`package.json` 改了但 `pnpm-lock.yaml` 没一起提交。在本地跑一次：

```bash
pnpm install
git add -A && git commit -m "同步锁文件" && git push
```

</details>

<details>
<summary><b>Actions 红叉：其它构建错误</b></summary>

点进那次失败的运行，展开红色的步骤看日志。
最快的复现方式是**在本地跑一遍一模一样的命令**：

```bash
pnpm install --frozen-lockfile
pnpm build
```

本地报的错就是 CI 报的错。

</details>

<details>
<summary><b>线上一直 404</b></summary>

多半是**第 4 步没做** —— 回仓库 **Settings → Pages**，确认 **Source 是 `GitHub Actions`**。
选成 "Deploy from a branch" 的话，Actions 跑得再成功也不会发布。

</details>

<details>
<summary><b><code>git push</code> 连不上 github.com</b></summary>

两种办法，任选一种：

**用代理**（本地有 HTTP 代理时）：

```bash
git config --global http.proxy http://127.0.0.1:7892
git config --global https.proxy http://127.0.0.1:7892
```

撤销：把上面命令里的地址去掉再执行一次，或 `git config --global --unset http.proxy`。

**用 SSH**（更稳，推荐）：

```bash
ssh-keygen -t ed25519 -C "你的邮箱"     # 一路回车
cat ~/.ssh/id_ed25519.pub                # 复制输出的公钥
```

把公钥粘到 GitHub → **Settings → SSH and GPG keys → New SSH key**，然后：

```bash
ssh -T git@github.com                    # 看到 "successfully authenticated" 就成了
git remote set-url origin git@github.com:<用户名>/<用户名>.github.io.git
```

</details>

<details>
<summary><b>本地 <code>pnpm dev</code> 起不来：<code>listen EACCES</code></b></summary>

不是代码问题 —— Windows 会把一批端口动态划进「保留区间」，落在里面的端口绑不上。
查当前区间：

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

换一个不在区间里的端口即可（[`astro.config.mjs`](astro.config.mjs) 里的 `server.port`）。

</details>

---

## 🙏 致谢

设计上大量参考了两个项目：

- **[hexo-theme-fluid](https://github.com/fluid-dev/hexo-theme-fluid)** —— 首页列表、分页、归档、分类、标签的版式
- **[Firefly](https://github.com/CuteLeaf/Firefly)** —— 导航栏、设置面板、目录、代码块、链接卡、樱花特效

技术栈：**Astro 7** · **Tailwind CSS v4** · **KaTeX** · **Shiki** · **Pagefind** · **Mermaid**
