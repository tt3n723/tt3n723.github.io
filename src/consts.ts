// 全站常量：改这里的文字就能改站点信息，不需要动组件。
// ── 站名 vs 首页标语：**故意分成两组** ──────────────────────
// 之前只有一个 SITE_TITLE，改首页标语会连导航栏左上角一起改掉。
// 现在分开了：
//   SITE_*  → 导航栏、浏览器标签页、og:site_name、RSS
//   HOME_*  → 只影响首页头图的那两行字
export const SITE_TITLE = 'Wizard Note';
export const HOME_TITLE = 'Believe in Me Who Believes in You';
// 首页副标题：**当前没在用**（作者要求删掉头图上那行字）。
// 想恢复的话，在 src/pages/[...page].astro 的 <BaseLayout> 里加回 bannerSubtitle={HOME_SUBTITLE}。
export const HOME_SUBTITLE = '算法笔记与刷题记录';

// 站点的通用描述：给搜索引擎的 meta description 和 RSS 用。
// 和首页副标题是两回事 —— 那个是 HOME_SUBTITLE。
export const SITE_DESCRIPTION = '算法笔记与刷题记录';
export const SITE_AUTHOR = 'tt3n722';
// 站点绝对地址。构建时可以用环境变量覆盖：
//   SITE_URL=https://你的用户名.github.io pnpm build
// GitHub Actions 里会自动注入（见 .github/workflows/deploy.yml），
// 所以部署到 Pages 时**不需要**手改这里。本地开发保持原样即可。
export const SITE_URL = process.env.SITE_URL ?? 'https://example.github.io';

// 全站色相（0-360），整站配色由它驱动。
//    265 = 靛蓝（默认）   230 = 蓝   200 = 青   160 = 绿
//    100 = 黄绿           60 = 琥珀  25 = 橙红   0 = 红   330 = 洋红
export const SITE_HUE = 265;

// 首页每页多少篇（构建期真分页：/、/2/、/3/…）
export const POSTS_PER_PAGE = 9;

/** 导航栏。有 children 的项会渲染成下拉菜单（和 Firefly 的"文章"一样）。 */
export const NAV_LINKS: {
  href?: string;
  label: string;
  children?: { href: string; label: string }[];
}[] = [
  { href: '/', label: '主页' },
  { href: '/archive', label: '归档' },
  { href: '/categories', label: '分类' },
  { href: '/tags', label: '标签' },
  { href: '/about', label: '关于' },
];
