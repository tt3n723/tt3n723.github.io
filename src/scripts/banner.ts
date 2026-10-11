// 头图上的下滑箭头：点一下滚到内容开始处。
export function initBanner() {
  document.querySelectorAll<HTMLElement>('[data-scroll-down]').forEach((button) => {
    if (button.dataset.ready === 'true') return;
    button.dataset.ready = 'true';
    button.addEventListener('click', () => {
      const banner = button.closest('.banner');
      const target = banner ? banner.getBoundingClientRect().height : window.innerHeight;
      window.scrollTo({ top: window.scrollY + target - 0, behavior: 'smooth' });
    });
  });
}
