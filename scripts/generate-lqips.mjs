/**
 * 给 public/img/ 下每张图生成一个"主色渐变"字符串，写进 src/data/lqips.json。
 *
 *   node scripts/generate-lqips.mjs      （pnpm build 会自动先跑它）
 *
 * 原理：把图缩到 2x2 像素，取 4 个角的颜色，取其中 3 个当作渐变色标。
 * 卡片渲染时先用这个渐变当背景，图片加载完再淡入——
 * 这样不会出现"先白一块、再啪一下跳出图"的跳动感。
 *
 * 这是 Firefly 的做法（18 字符 hex），这里是 3 个 #rrggbb，更直观也更好调。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const IMAGE_DIR = 'public/img';
const OUT_FILE = 'src/data/lqips.json';

const hex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');

const files = (await fs.readdir(IMAGE_DIR)).filter((name) => /\.(jpe?g|png|webp|avif)$/i.test(name));
const map = {};

for (const file of files) {
  try {
    const { data, info } = await sharp(path.join(IMAGE_DIR, file))
      .resize(2, 2, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels;
    const pixel = (index) => {
      const at = index * channels;
      return [data[at], data[at + 1], data[at + 2]];
    };

    // 左上 / 右上 / 左下 —— 斜向渐变，比单色更有"缩略图"的感觉
    map['/img/' + file] = [hex(pixel(0)), hex(pixel(1)), hex(pixel(2))].join(', ');
  } catch (error) {
    console.warn('跳过 ' + file + '：' + error.message);
  }
}

await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
await fs.writeFile(OUT_FILE, JSON.stringify(map, null, 2) + '\n', 'utf8');
console.log('已生成 ' + Object.keys(map).length + ' 张图的 LQIP → ' + OUT_FILE);
