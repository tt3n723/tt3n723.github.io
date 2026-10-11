/**
 * 字数与阅读时长。构建期算，零依赖、零客户端 JS。
 *
 * 中英文要分开数：
 *   - 中日韩字符按"字"数，速度按 300 字/分钟
 *   - 拉丁词按"词"数，速度按 200 词/分钟
 * 混排时取两者之和，比单纯按空格分词准得多。
 */
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff]/g;
const LATIN_WORD = /[A-Za-z0-9_'-]+/g;

export interface ReadingStats {
  chars: number;
  words: number;
  minutes: number;
}

export function readingStats(markdown: string): ReadingStats {
  // 代码块不参与阅读时长的统计（读代码和读文章不是一回事）
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$]*\$/g, '');

  const cjk = (text.match(CJK) ?? []).length;
  const latin = (text.match(LATIN_WORD) ?? []).length;
  const minutes = Math.max(1, Math.round(cjk / 300 + latin / 200));

  return { chars: cjk + latin, words: latin, minutes };
}
