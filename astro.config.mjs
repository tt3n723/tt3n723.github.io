// @ts-check
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';

import rehypeExternalLinks from './src/plugins/rehype-external-links.mjs';
import rehypeFigure from './src/plugins/rehype-figure.mjs';
import remarkSectionize from './src/plugins/remark-sectionize.mjs';
import remarkDirectives from './src/plugins/remark-directives.mjs';
import { SITE_URL } from './src/consts.ts';

export default defineConfig({
  // site 决定 RSS / sitemap / 绝对链接的域名，改 src/consts.ts 里的 SITE_URL 即可
  site: SITE_URL,
  integrations: [
    mdx(),
    // /lab 是内部样式展台，不进 sitemap
    sitemap({ filter: (page) => !page.includes('/lab') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    // 固定端口。Astro 默认的 4321（和 4322）现在落在 Windows 的动态保留区间
    // 4304-4403 里，绑定会直接失败：listen EACCES: permission denied。
    // 查当前保留区间：netsh interface ipv4 show excludedportrange protocol=tcp
    port: 5173,
  },
  markdown: {
    // Astro 7 的默认 Markdown 处理器是 Sätteri；这里显式选用 remark/rehype 管线，
    // 因为数学公式、目录锚点、折叠块都依赖 remark/rehype 插件。
    processor: unified({
      // $...$ 行内公式 与 $$...$$ 块级公式
      remarkPlugins: [
        remarkMath, // $...$ / $$...$$ 数学公式
        remarkDirective, // 解析 :::tip / :::details / :::tabs 这类指令
        remarkDirectives, // 把指令渲染成真正的 HTML 结构
        remarkSectionize, // 标题层级包成 <section>，供"连同正文一起缩进"用（必须放最后）
      ],
      rehypePlugins: [
        rehypeSlug, // 给标题加 id，供目录跳转
        // throwOnError:false —— 公式写错时只标红报错，不让整个构建失败
        [rehypeKatex, { throwOnError: false, errorColor: '#ef4444' }],
        rehypeExternalLinks, // 站外链接自动新窗口
        rehypeFigure, // 图片 alt → 题注
      ],
    }),
    shikiConfig: {
      // 双主题：白天 github-light，夜间 github-dark，由 html.dark 切换
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
