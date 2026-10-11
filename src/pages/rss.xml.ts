// RSS 订阅源 → /rss.xml
// 依赖 @astrojs/rss（本来就在 package.json 里，之前一直没接上）。
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../consts';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // CI 里 context.site 来自 SITE_URL（deploy.yml 注入的 Pages 真实地址）
    site: context.site ?? SITE_URL,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        categories: [...post.data.categories, ...post.data.tags],
      })),
    customData: '<language>zh-cn</language>',
  });
}
