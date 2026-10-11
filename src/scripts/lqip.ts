// 封面图加载完再淡入，避免"先白一块、再啪一下跳出来"。
//
// 关键：初始的 opacity:0 挂在 html.js 下面（见 global.css），
// 所以禁用 JS 或脚本失败时图片是正常可见的，不会凭空消失。
export function initLqip() {
document.querySelectorAll<HTMLImageElement>('.cover-img').forEach((img) => {
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('is-loaded');
    return;
  }
  img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
});
}
