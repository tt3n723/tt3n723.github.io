// 目录的激活跟踪 + 分组开合 + 跳转。
//
// IntersectionObserver 只负责"有变化就重算"，真正判断可见性的是
// getBoundingClientRect —— 比纯 IO 的 threshold 稳（长标题、快速滚动都不错位）。
export function initToc() {
  const content = document.querySelector<HTMLElement>('[data-toc-content]');
  const indicator = document.querySelector<HTMLElement>('[data-toc-indicator]');
  if (!content || !indicator || content.dataset.ready === 'true') return;
  content.dataset.ready = 'true';

  const items = Array.from(content.querySelectorAll<HTMLAnchorElement>('.toc-item'));
  const groups = Array.from(content.querySelectorAll<HTMLElement>('[data-toc-group]'));
  const headings = items.map((item) => document.getElementById(item.dataset.headingId ?? ''));
  if (items.length === 0 || !headings.every((el): el is HTMLElement => el !== null)) return;
  const list = headings as HTMLElement[];

  // 只展开"当前阅读位置所在的那一组"，其余收起
  const openGroupOf = (item: HTMLAnchorElement | undefined) => {
    const active = item?.closest<HTMLElement>('[data-toc-group]');
    if (!active) return;
    groups.forEach((group) => group.classList.toggle('is-current', group === active));
  };

  // 固定导航栏的真实高度 —— 不写死数字
  // （以前写死 80px，而实际导航栏 95px，点目录跳过去标题会被挡掉 15px）
  const headerOffset = () => {
    const header = document.getElementById('site-header');
    const h = header ? header.getBoundingClientRect().height : 0;
    return Math.round(h) + 16;
  };

  const update = () => {
    const viewport = window.innerHeight;
    let first = -1;
    let last = -1;

    list.forEach((heading, index) => {
      const rect = heading.getBoundingClientRect();
      if (rect.top < viewport && rect.bottom > 0) {
        if (first === -1) first = index;
        last = index;
      }
    });

    if (first === -1) {
      let best = 0;
      let bestDistance = Infinity;
      list.forEach((heading, index) => {
        const distance = Math.abs(heading.getBoundingClientRect().top);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      first = best;
      last = best;
    }

    items.forEach((item, index) => {
      item.classList.toggle('is-active', index >= first && index <= last);
    });
    openGroupOf(items[first]);

    const contentTop = content.getBoundingClientRect().top;
    const start = items[first].getBoundingClientRect();
    const end = items[last].getBoundingClientRect();
    indicator.style.top = start.top - contentTop + 'px';
    indicator.style.height = end.bottom - start.top + 'px';
    indicator.style.opacity = '1';

    // 高亮项跑出可视区时，让目录自己滚一下把它居中
    const scroller = content.closest<HTMLElement>('.toc-scroll');
    const active = items[first];
    if (scroller && active) {
      const itemTop = active.offsetTop;
      const itemHeight = active.offsetHeight;
      const viewTop = scroller.scrollTop;
      const viewBottom = viewTop + scroller.clientHeight;
      if (itemTop < viewTop || itemTop + itemHeight > viewBottom) {
        scroller.scrollTo({
          top: itemTop - scroller.clientHeight / 2 + itemHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  };

  const observer = new IntersectionObserver(update, { threshold: 0 });
  list.forEach((heading) => observer.observe(heading));
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      const target = document.getElementById(item.dataset.headingId ?? '');
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', '#' + item.dataset.headingId);
    });
  });
}
