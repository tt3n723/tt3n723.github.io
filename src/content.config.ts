import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  // 所有文章都放在 src/content/blog/ 下，文件名就是 URL slug
  // pattern 里的 [^_] 让下划线开头的文件被**静默忽略**——
  // 所以 `_draft.md` 就是草稿，不需要 draft 字段，也不会有任何工具链负担。
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // 旧的 Hexo 数据里 tags / categories 是单个字符串，迁移脚本已转成数组
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    // 封面图，指向 public/ 下的路径，例如 /img/01.jpg
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
