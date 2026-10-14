// 顶部阅读进度条（lab ⑩ 采纳）。
//
// 固定在视口最顶部，宽度 = 已滚过的比例，到底时刚好铺满。
// 用 rAF 节流：滚动事件里不读 scrollHeight（读它会强制重排）。
export function initProgress() {
  const bar = document.querySelector<HTMLElement>('[data-progress-bar]');
  if (!bar) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.width = (ratio * 100).toFixed(2) + '%';
  };
  // 监听只挂一次（切页会反复调用这个函数）
  const w = window as unknown as { __progressBound?: boolean };
  if (!w.__progressBound) {
    w.__progressBound = true;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }
  update();
}
