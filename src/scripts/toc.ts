// 目录的激活跟踪 + 分组开合 + 跳转。
//
// ⚠️ 这是全站最吃布局的一个脚本，改之前先读完这段。
//
// 一篇文章的目录有 ~85 项。原来的 update() 挂在 scroll 上**没有节流**，
// 每次滚动事件都要读 170 次几何属性（getBoundingClientRect / offsetTop），
// 而且顺序是"先写 indicator 样式、再读 offsetTop"
//   → 写让样式失效，紧接着的读强制同步重排 = 布局抖动。
// 在 5 万节点的文章页上，追踪实测出 223ms 的强制重排。
//
// 现在的三条对策：
//   1. rAF 节流     —— 一帧最多算一次（原来一次滚动几十次）
//   2. 导航栏高度缓存 —— 它不会变，只在 resize 时失效（原来每次都量）
//   3. 先读完再写    —— 所有几何属性一次读完，然后统一改样式，消除抖动
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

  const openGroupOf = (item: HTMLAnchorElement | undefined) => {
    const active = item?.closest<HTMLElement>('[data-toc-group]');
    if (!active) return;
    groups.forEach((group) => group.classList.toggle('is-current', group === active));
  };

  // 导航栏真实高度：一页生命周期内不变，缓存；只有 resize 才重新量
  let headerPx = -1;
  const headerOffset = () => {
    if (headerPx >= 0) return headerPx;
    const header = document.getElementById('site-header');
    headerPx = Math.round(header ? header.getBoundingClientRect().height : 0) + 16;
    return headerPx;
  };

  const update = () => {
    const viewport = window.innerHeight;

    // ========== 读阶段：一次读完，中间不碰样式 ==========
    const rects = list.map((heading) => heading.getBoundingClientRect());
    let first = -1;
    let last = -1;
    for (let i = 0; i < rects.length; i += 1) {
      const r = rects[i]!;
      if (r.top < viewport && r.bottom > 0) {
        if (first === -1) first = i;
        last = i;
      }
    }
    if (first === -1) {
      let best = 0;
      let bestDistance = Infinity;
      for (let i = 0; i < rects.length; i += 1) {
        const distance = Math.abs(rects[i]!.top);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      }
      first = best;
      last = best;
    }

    const active = items[first];
    const contentTop = content.getBoundingClientRect().top;
    const startRect = items[first]!.getBoundingClientRect();
    const endRect = items[last]!.getBoundingClientRect();
    const scroller = content.closest<HTMLElement>('.toc-scroll');
    const itemTop = active ? active.offsetTop : 0;
    const itemHeight = active ? active.offsetHeight : 0;
    const viewTop = scroller ? scroller.scrollTop : 0;
    const viewH = scroller ? scroller.clientHeight : 0;

    // ========== 写阶段：读完了再统一改 ==========
    for (let i = 0; i < items.length; i += 1) {
      items[i]!.classList.toggle('is-active', i >= first && i <= last);
    }
    openGroupOf(active);

    indicator.style.top = startRect.top - contentTop + 'px';
    indicator.style.height = endRect.bottom - startRect.top + 'px';
    indicator.style.opacity = '1';

    if (scroller && active && (itemTop < viewTop || itemTop + itemHeight > viewTop + viewH)) {
      scroller.scrollTo({ top: itemTop - viewH / 2 + itemHeight / 2, behavior: 'smooth' });
    }
  };

  // rAF 节流：一次滚动可能触发几十个事件，一帧只算一次
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  };

  const observer = new IntersectionObserver(schedule, { threshold: 0 });
  list.forEach((heading) => observer.observe(heading));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { headerPx = -1; schedule(); }, { passive: true });
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
