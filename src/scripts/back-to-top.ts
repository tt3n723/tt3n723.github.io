// 回到顶部按钮：滚过一屏才出现。
export function initBackToTop() {
  const button = document.querySelector<HTMLElement>('[data-back-to-top]');
  if (!button || button.dataset.ready === 'true') return;
  button.dataset.ready = 'true';

  let ticking = false;
  const update = () => {
    button.hidden = window.scrollY < window.innerHeight * 0.8;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
