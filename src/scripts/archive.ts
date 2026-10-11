// 归档页：年份折叠。
export function initArchive() {
  // ---------- 年份折叠 ----------
  document.querySelectorAll<HTMLButtonElement>('[data-archive-toggle]').forEach((button) => {
    if (button.dataset.ready === 'true') return;
    button.dataset.ready = 'true';
    button.addEventListener('click', () => {
      const block = button.closest('[data-archive-year]');
      const content = block?.querySelector<HTMLElement>('.archive-year-content');
      if (!content) return;
      const open = content.hidden;
      content.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      block?.classList.toggle('is-open', open);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-archive-year]').forEach((block) => {
    const content = block.querySelector<HTMLElement>('.archive-year-content');
    block.classList.toggle('is-open', content ? !content.hidden : false);
  });

}
