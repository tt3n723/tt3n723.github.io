/**
 * rehype-external-links —— 给正文里的站外链接自动加 target="_blank" 和 rel。
 *
 * 你旧站 Hexo 的 external_link.enable 是开着的（全站新窗口），迁移时丢了。
 * 这里补回来，而且是**构建期**处理，零客户端 JS。
 *
 * 站内链接（以 / 或 # 开头）和图片链接不动。
 */
const EXTERNAL = /^https?:\/\//i;

export default function rehypeExternalLinks() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties?.href;
        if (typeof href === 'string' && EXTERNAL.test(href)) {
          node.properties.target = '_blank';
          // noopener 防 tabnabbing，noreferrer 顺手去掉 Referer
          node.properties.rel = 'noopener noreferrer';
        }
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}
