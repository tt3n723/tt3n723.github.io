// 头图标题的打字机效果（作者要的）。
//
// 只有 <html class="js"> 时才启动 —— 禁用 JS 时标题是完整的静态文字，不会变空。
// 尊重 prefers-reduced-motion。
export function initTyped() {
  const elements = document.querySelectorAll<HTMLElement>('[data-typed]');
  elements.forEach((el) => {
    const text = el.dataset.typed ?? '';
    if (!text) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.textContent = text;
      return;
    }
    if (el.dataset.ready === 'true') return;
    el.dataset.ready = 'true';

    el.classList.add('is-typing');
    el.textContent = '';
    let i = 0;
    const step = () => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        // 90–140ms 一个字符，带点随机才不像机器
        setTimeout(step, 90 + Math.random() * 50);
      } else {
        el.classList.remove('is-typing');
      }
    };
    setTimeout(step, 350);
  });
}
