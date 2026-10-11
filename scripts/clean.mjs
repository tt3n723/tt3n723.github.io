/**
 * 清理构建/开发缓存。
 *
 * 什么时候需要它：改了 remark / rehype 插件（src/plugins/*.mjs）、
 * 或者改了 astro.config.mjs 里的 markdown 管线之后。
 *
 * 三个缓存各自会让"我明明改了代码，页面却没变"：
 *
 *   .astro/                    —— Astro 的类型与集合缓存
 *   node_modules/.astro/       —— 每篇文章**渲染好的 HTML**（最容易坑人的一个）
 *   node_modules/.vite/        —— Vite 的模块缓存；不删它的话，
 *                                **dev 服务器**会一直用旧版插件，而 build 却是新的
 *
 * 用法：
 *   pnpm clean && pnpm build     # 构建
 *   pnpm clean                   # 然后重启 dev：npx astro dev stop && pnpm dev
 */
import fs from 'node:fs';

for (const dir of ['.astro', 'node_modules/.astro', 'node_modules/.vite', 'dist']) {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`已清理 ${dir}`);
}
