// 进入视口才淡入上移。零依赖，一个 IntersectionObserver 搞定。
//
// 安全降级：初始的 opacity:0 挂在 html.js 下面（见 global.css），
// 所以禁用 JS 时元素正常可见，不会凭空消失。
export function initReveal() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (targets.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // 已经渲染过一次的（客户端路由回来）就不要再藏起来重播
  targets.forEach((el) => {
    if (el.dataset.revealed === 'true') return;
    el.dataset.revealed = 'true';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0 },
  );

  targets.forEach((el) => {
    if (el.classList.contains('is-visible')) return;
    observer.observe(el);
  });
}
