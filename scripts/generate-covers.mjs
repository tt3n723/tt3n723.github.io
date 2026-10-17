/**
 * 生成首页预览图：public/img/card/<名>.webp，640×360，q80。
 *
 *   node scripts/generate-covers.mjs
 *
 * ── 为什么只要一档、只要 640 ──
 * 卡片实际显示宽度只有 ~302px（33% × 1330px 板宽）。
 *   DPR 1 → 需要 302 设备像素 → 640 有 2.1 倍余量
 *   DPR 2 → 需要 604 设备像素 → 640 刚好够（604 < 640）
 * 所以一张 640 覆盖 99% 的真实设备，不需要 srcset 多档。
 * 原图（*.jpg）留给详情页头图，两边彻底分开。
 *
 * ── 为什么处理 public/img 里的**全部** JPEG ──
 * 包括还没写文章的备用封面（19.jpg ~ 46.jpg）。
 * 一次全生成好，以后写文章直接引用 /img/19.jpg 就行，不用再跑脚本。
 * 代价是仓库多几 MB，但那些文件不会被请求。
 *
 * ── 放在子目录里的原因 ──
 * generate-lqips.mjs 只扫 public/img 的**顶层**，所以 card/ 不会混进 lqips.json。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'public/img';
const OUT_DIR = 'public/img/card';
const W = 640;
const H = 360;
const Q = 80;

await fs.mkdir(OUT_DIR, { recursive: true });

const files = (await fs.readdir(SRC_DIR)).filter((n) => /\.jpe?g$/i.test(n));
let made = 0;
let total = 0;

for (const file of files) {
  const base = file.replace(/\.jpe?g$/i, '');
  const buf = await sharp(path.join(SRC_DIR, file))
    .resize(W, H, { fit: 'cover' })
    .webp({ quality: Q })
    .toBuffer();
  await fs.writeFile(path.join(OUT_DIR, base + '.webp'), buf);
  made += 1;
  total += buf.length;
}

console.log(
  '生成 ' + made + ' 张预览图 → ' + OUT_DIR +
  '（合计 ' + (total / 1024).toFixed(0) + ' KB，平均 ' + (total / made / 1024).toFixed(0) + ' KB/张）',
);
