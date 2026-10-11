// Firefly 的 SeriesNav 开合：把内容区的 max-height 设成它的 scrollHeight。
export function initSeriesNav() {
  document.querySelectorAll<HTMLElement>('[data-series-nav]').forEach((root) => {
    const toggle = root.querySelector<HTMLButtonElement>('[data-series-toggle]');
    const content = root.querySelector<HTMLElement>('[data-series-content]');
    if (!toggle || !content || toggle.dataset.ready === 'true') return;
    toggle.dataset.ready = 'true';

    const setOpen = (open: boolean) => {
      root.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open));
      content.style.maxHeight = open ? content.scrollHeight + 'px' : '0px';
    };
    setOpen(root.dataset.open === 'true');

    toggle.addEventListener('click', () => {
      setOpen(root.dataset.open !== 'true');
    });

    // 窗口变化时重算（内容宽度变了高度也会变）
    window.addEventListener('resize', () => {
      if (root.dataset.open === 'true') content.style.maxHeight = content.scrollHeight + 'px';
    });
  });
}
