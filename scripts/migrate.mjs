/**
 * 把旧 Hexo 博客（C:/Study/Blog）的文章迁移成 Astro 内容集合。
 *
 *   node scripts/migrate.mjs
 *
 * 做三件事：
 *   1. front-matter 转换（index_img→cover、date→pubDate、tags 字符串→数组 …）
 *   2. 复制封面图并压缩到 public/img/
 *   3. 打印一份报告，指出被丢弃的语法和缺失的资源
 *
 * 幂等：可以反复运行，会覆盖 src/content/blog/ 下同名文件。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
const HEXO = 'C:/Study/Blog';
const POSTS = path.join(HEXO, 'source/_posts');
const OUT_POSTS = 'src/content/blog';
const OUT_IMG = 'public/img';

// 文章里用到、需要一起搬过来的图片
const KEEP_IMAGES = [
  ...Array.from({ length: 18 }, (_, i) => `${String(i + 1).padStart(2, '0')}.jpg`),
  'begin.jpg',
];

const report = { posts: 0, images: [], missing: [], warnings: [] };

/** 极简 YAML front-matter 解析：只处理 key: value 这种扁平结构 */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[kv[1]] = value;
  }
  return { data, body: raw.slice(m[0].length) };
}

/** Hexo 的 "2025-12-21 21:00:00"（东八区）→ ISO 8601 */
function toIso(value) {
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return new Date(value).toISOString();
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+08:00`;
}

function stripInline(text) {
  return text
    .replace(/\$[^$]*\$/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 从正文开头提炼一句摘要，给卡片和 <meta description> 用 */
function makeDescription(body) {
  const buf = [];
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) {
      if (buf.length) break;
      continue;
    }
    const isNoise =
      /^#{1,6}\s/.test(t) || /^\{%/.test(t) || /^```/.test(t) || /^<!--/.test(t) || /^!\[/.test(t) || /^\|/.test(t);
    if (isNoise) {
      if (buf.length) break;
      continue;
    }
    buf.push(t);
    if (buf.join(' ').length > 140) break;
  }
  const text = stripInline(buf.join(' '));
  return text.length > 100 ? `${text.slice(0, 100)}…` : text;
}

function yamlString(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function yamlList(values) {
  return `[${values.map((v) => yamlString(v)).join(', ')}]`;
}

// ---------------------------------------------------------------- 图片
async function migrateImages() {
  await fs.mkdir(OUT_IMG, { recursive: true });
  for (const name of KEEP_IMAGES) {
    const src = path.join(HEXO, 'source/img', name);
    const dst = path.join(OUT_IMG, name);
    try {
      // 原图直拷，不做任何压缩/缩放（作者要求）
      await fs.copyFile(src, dst);
      const size = (await fs.stat(dst)).size;
      report.images.push(`${name}: ${(size / 1024).toFixed(0)}KB（原图）`);
    } catch (err) {
      report.missing.push(`${name}: ${err.message}`);
    }
  }

  // 头像：原图直拷（作者要求所有图片不压缩）
  try {
    await fs.copyFile(path.join(HEXO, 'source/img/avatar.gif'), path.join(OUT_IMG, 'avatar.gif'));
    report.images.push('avatar.gif（原图）');
  } catch (err) {
    report.missing.push(`avatar.gif: ${err.message}`);
  }

  // favicon：直接从旧站搬
  try {
    await fs.copyFile(path.join(HEXO, 'source/img/favicon.jpg'), 'public/favicon.jpg');
    report.images.push('favicon.jpg（直接复制）');
  } catch (err) {
    report.missing.push(`favicon.jpg: ${err.message}`);
  }
}

// ---------------------------------------------------------------- 文章
async function migratePosts() {
  await fs.mkdir(OUT_POSTS, { recursive: true });
  const names = (await fs.readdir(POSTS)).filter((n) => n.endsWith('.md'));

  for (const name of names) {
    const raw = await fs.readFile(path.join(POSTS, name), 'utf8');
    const { data, body: rawBody } = parseFrontmatter(raw);
    let body = rawBody.replace(/\r\n/g, '\n');

    // 旧站的 <!--more--> 摘录分隔符在 Astro 里没有意义（有的独占一行，有的夹在段中间）
    body = body.replace(/<!--\s*more\s*-->/g, '');

    // Fluid 的 {% fold %} 折叠语法 → markdown 指令，全站只保留一套语法
    body = body.replace(
      /^\{%\s*fold\s+\w+\s*@\s*(.*?)\s*%\}$/gm,
      (_, title) => `:::details[${title}]`,
    );
    body = body.replace(/^\{%\s*endfold\s*%\}$/gm, ':::');

    // 记录并清理已知的坏引用
    const broken = [...body.matchAll(/!\[[^\]]*\]\((\S*?)\)/g)].filter((m) => /\.\.\/picture\//.test(m[1]));
    if (broken.length) {
      body = body.replace(/!\[[^\]]*\]\(\.\.\/picture\/[^)]*\)\s*/g, '');
      report.warnings.push(`${name}: 删除了 ${broken.length} 处指向已丢失图片的引用（../picture/）`);
    }

    body = body.trim() + '\n';

    const tags = data.tags ? [data.tags] : [];
    const categories = data.categories ? [data.categories] : [];
    const description = makeDescription(body) || data.title || '';

    const frontmatter = [
      '---',
      `title: ${yamlString(data.title ?? name.replace(/\.md$/, ''))}`,
      `description: ${yamlString(description)}`,
      `pubDate: ${toIso(data.date)}`,
      `tags: ${yamlList(tags)}`,
      `categories: ${yamlList(categories)}`,
      data.index_img ? `cover: ${yamlString(data.index_img)}` : null,
      '---',
      '',
    ].filter((line) => line !== null);

    await fs.writeFile(path.join(OUT_POSTS, name), frontmatter.join('\n') + body, 'utf8');
    report.posts += 1;
  }
}

await migrateImages();
await migratePosts();

console.log('迁移报告');
console.log('================');
console.log(`文章：${report.posts} 篇 → ${OUT_POSTS}/`);
console.log(`图片：${report.images.length} 张`);
for (const line of report.images) console.log(`  ${line}`);
if (report.warnings.length) {
  console.log('警告：');
  for (const line of report.warnings) console.log(`  ${line}`);
}
if (report.missing.length) {
  console.log('缺失/失败：');
  for (const line of report.missing) console.log(`  ${line}`);
}
